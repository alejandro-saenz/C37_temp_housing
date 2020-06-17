const { setupDB } = require('../test-setup');
const app = require('../server');
const request = require('supertest');

// Setup our test database
setupDB();

describe('API: User Endpoints', () => {
  it('runs a basic test', () => {
    expect(true).toBe(true);
  });
  it('returns unauthorized with no token', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toEqual(401);
  });
});
