/** Invoices routes */

const express = require('express');
const router = new express.Router();
const app = express();
const db = require('../utils/db');
const ExpressError = require('../utils/expressError');

app.use(express.json());

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, comp_code
        FROM invoices`
    );
    return res.json({ invoices: result.rows })
  } catch (e) {
    return next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await db.query(
      `SELECT id, amt, paid, add_date, paid_date, companies.code, 
       companies.name, companies.description FROM invoices
        JOIN companies ON comp_code=companies.code
          WHERE id=$1`,
      [id]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`No invoice found with ID ${id}`, 404);
    }
    const i = result.rows[0]
    return res.json({
      invoice: {
        id: i.id,
        amt: i.amt,
        paid: i.paid,
        add_date: i.add_date,
        paid_date: i.paid_date,
        company: {
          code: i.code,
          name: i.name,
          description: i.description,
        }
      }
    });
  } catch (e) {
    return next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt)
        VALUES ($1, $2)
          RETURNING *`,
      [comp_code, amt]
    );
  } catch (e) {
    return next(e)
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const amt = req.body.amt;
    const code = req.params.id;
    const result = await db.query(
      `UPDATE invoices SET amt=$1
        WHERE id=$2
          RETURNING id, amt, paid, add_date, paid_date`,
      [amt, code]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`No invoice found with ID ${id}`, 404);
    }
  } catch (e) {
    return next(e)
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await db.query(
      `DELETE FROM invoices
        WHERE id=$1`,
      [id]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`No invoice found with ID ${id}`, 404);
    }
    return res.json({ status: 'Deleted!' });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
