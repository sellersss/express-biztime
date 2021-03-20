const express = require('express');
const db = require('../utils/db');
const ExpressError = require('../utils/expressError');
const slugify = require('slugify');
const router = express.Router();

async function checkCode(code) {
  const res = await db.query(`
    SELECT code, name, description
    FROM companies
    WHERE code=$1
  `, [code]);
  if (res.rowCount === 0) {
    const e = new ExpressError('404 Company Not Found', 404);
    return e;
  }
}

router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    const code = slugify(name);
    const results = await db.query(`
      INSERT INTO industries (code, name)
      VALUES ($1, $2)
      RETURNING *
    `, [code, name]);
    return res.status(201).json({ industry: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const industryResults = await db.query(`
      SELECT i.code, i.name, c.code AS company 
      FROM industries AS i 
      LEFT JOIN industries_companies AS ic 
      ON i.code = ic.industry_code 
      LEFT JOIN companies AS c 
      ON c.code = ic.company_code 
      WHERE i.code=$1
      `, [code]);

    const { industryCode, name } = industryResults.rows[0];
    const companiesArr = industryResults.rows.map((r) => r.company);
    const companies = [...new Set(companiesArr)];

    return res.json({ industries: { industryCode, name, companies } });
  } catch (error) {
    return next(error);
  }
});

router.post('/:code', async (req, res, next) => {
  try {
    const { company } = req.body;
    const results = await db.query(
      `INSERT INTO industries_companies (industry_code, company_code) VALUES ($1,$2) RETURNING *`,
      [req.params.code, company]
    );
    return res.status(201).json({ industry: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
