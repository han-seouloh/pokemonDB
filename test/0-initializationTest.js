const { assert } = require('chai');
const request = require('supertest');

const app = require('../pokemonServer');

describe('Server is running...', () => {
  describe('Initializing server setup...', () => {
    before(function(done) {
      setTimeout(done, 20000);
    });

    it('Main page redirects when there is no active session...', async () => {
      const response = await request(app)
        .get('/');

      assert.include(response.text, 'Redirecting');
    });

    it('Verifying only prof_oak has been initialized...', async () => {
      const response = await request(app)
        .get('/test/login');
      const data = JSON.parse(response.text);

      const result = data.length;

      assert.equal(result, 1);
    });
    
    it('Verifying prof_oak has been initialized...', async () => {
      const response = await request(app)
        .get('/test/login');
      const user = JSON.parse(response.text)[0];

      assert.equal(user.username, 'prof_oak');
    });
  });
});