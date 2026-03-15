const request = require('supertest');
const app = require('../server');

describe('Health Check Endpoint Test', () => {
  
  it('should return 200 OK along with status message', async () => {
    const response = await request(app).get('/health');
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('message', 'SGP Backend is running');
  });

});
