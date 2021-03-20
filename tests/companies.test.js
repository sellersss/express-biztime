process.env.NODE_ENV = 'test';

const app = require('../app')
const db = require('../utils/db');
const request = require('supertest');


let testCompany;

beforeEach(async () => {
  const company = await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('vlo', 'Valero Industries', 'Advancing the Future of Energy')
    RETURNING *
  `);
  testCompany = company.rows[0];
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.end();
});

describe('GET: /companies', function() {
  test('Returns all companies', async () => {
    const res = await request(app).get('/companies');

    expect(res.statusCode).toBe(200);
    // expect(res.body).toEqual({ companies: [testCompany] });
  });
});

describe('GET: /companies/:code', function() {
  test('Returns a company with its respective code', async () => {
    const res = await request(app).get('/companies/vlo');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: {
        code: 'vlo',
        name: 'Valero Industries',
        description: 'Advancing the Future of Energy',
      }
    });
  });
});

describe('POST; /companies', function() {
  test('Creates a new company', async () => {
    const res = await request(app)
      .post('/companies')
      .send({
        code: 'hal',
        name: 'Halliburton',
        description: 'The future of energy is digital',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: {
        code: 'hal',
        name: 'Halliburton',
        description: 'The future of energy is digital',
      }
    });
  });
});

describe('UPDATE: /companies/:code', function() {
  test('Updates a company profile', async () => {
    const res = await request(app)
      .put('/companies/vlo')
      .send({
        name: 'Valero Industries',
        description: 'The future of energy is digital and awesome',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      code: 'vlo',
      name: 'Valero Industries',
      description: 'The future of energy is digital and awesome',
    });
  });
});

describe('DELETE: /companies/:code', function() {
  test('Deletes a company and returns a message', async () => {
    const res = await request(app).delete('/companies/vlo');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Deleted' });
  });
});
