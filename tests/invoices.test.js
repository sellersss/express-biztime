process.env.NODE_ENV = 'test';

const app = require('../app')
const db = require('../utils/db');
const request = require('supertest');


let testCompany;

beforeEach(async () => {
  await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('vlo', 'Valero Industries', 'Advancing the Future of Energy')
    RETURNING *
  `);
  const invoice = await db.query(`
    INSERT INTO invoices (comp_code, amt)
    VALUES ('vlo', 1000)
    RETURNING *
  `)

  testCompany = invoice.rows[0];
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.end();
});

describe('GET: /invoices', function() {
  test('Returns all invoices with code', async () => {
    const res = await request(app).get('/invoices');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ invoices: [testCompany] });
  });
});

describe('GET: /invoices/:id', function() {
  test('Returns a specific invoice from id', async () => {
    const res = await request(app).get(`/invoices/${testCompany.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      invoice: {
        amt: 1000,
        company: {
          code: 'vlo',
          description: 'Advancing the Future of Energy',
          name: 'Valero Industries',
        },
        id: testCompany.id,
        add_date: '2021-03-20T00:00.000Z',
        paid: false,
        paid_date: null,
      }
    });
  });
});

describe('POST: /invoices', async () => {
  test('Creates a new invoice', async () => {
    const res = await request(app)
      .post('/invoices')
      .send({ comp_code: 'vlo', amt: 300 })

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      invoice: {
        comp_code: 'vlo',
        amt: 300,
        add_date: '2021-03-20T00:00.000Z',
        id: testCompany.id,
        paid: false,
        paid_date: null,
      },
    });
  });
});

describe('UPDATE: /invoices/:id', async () => {
  test('Updates a current invoice', async () => {
    const res = await request(app)
      .put(`/invoices/${testCompany.id}`)
      .send({ amt: 91210 })

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      invoice: {
        comp_code: 'vlo',
        amt: 91210,
        add_date: '2021-03-20T00:00.000Z',
        id: testCompany.id,
        paid: false,
        paid_date: null,
      },
    });
  });
});
