/** Companies routes */

const express = require('express');
const router = new express.Router();
const app = express();
const db = require('../utils/db');
const ExpressError = require('../utils/expressError');

app.use(express.json());

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(`SELECT code, name FROM companies`);
    return res.json({ companies: result.rows })
  } catch (e) {
    return next(e);
  }
});

router.get('/:code', async (req, res, next) => {
  try {
    const compRes = await db.query(
      `SELECT code, name, description
        FROM companies
          WHERE code=$1`
    )
    if (compRes.rows.length === 0) {
      throw new ExpressError(`Company not found with code ${req.params.code}!`, 404);
    }
    const invRes = await db.query(
      `SELECT id FROM invoices
        WHERE comp_code=$1`,
      [req.params.code]
    );
    const result = compRes.rows[0];
    result.invoices = invRes.rows.map(inv => inv.id);
    return res.json({ company: result });
  } catch (e) {
    return next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const result = await db.query(
      `INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3)
          RETURNING code, name, description`,
      [code, name, description]
    );
    return res.status(201).json(result.rows[0]);
  } catch (e) {
    return next(e);
  }
});

router.put('/:code', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const result = await db.query(
      `UPDATE companies
        SET name=$1, description=$2
          WHERE code=$3
            RETURNING code, name, description`,
      [name, description, req.params.code]
    );
    if (!result.rows.length) {
      throw new ExpressError(`Company not found with code ${req.params.code}!`, 404);
    }
  } catch (e) {
    return next(e);
  }
});

router.delete('/:code', async (req, res, next) => {
  try {
    const code = req.params.code;
    const result = await db.query(
      `DELETE FROM companies
        WHERE code=$1
          RETURNING code`,
      [code]
    );
    return res.json({ message: 'Deleted!' });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
