const { assert } = require('chai');
const request = require('supertest');

const app = require('../pokemonServer');
describe('Testing API routes...', () => {
  describe('Testing /register route...', () => {
    describe('User is registering...', () => {
      it('Registering prof_birch...', async () => {
        const username = 'prof_birch';
        const password = 'Pokedex2*';
        
        const response = await request(app)
          .post('/register')
          .send({username, password});
        const data = JSON.parse(response.text);
    
        assert.equal(data.status, 'SUCCESS');
      });

      it('Verifying prof_birch has been registered...', async () => {
        const response = await request(app)
          .get('/test/login');
        const data = JSON.parse(response.text);
        const result = data.find(user => user.username === 'prof_birch');
    
        assert.equal(result.username, 'prof_birch');
      });

      it('Verifying we now have 2 users in DB...', async () => {
        const response = await request(app)
          .get('/test/login');
        const data = JSON.parse(response.text);
        const result = data.length;

        assert.equal(result, 2);
      });
    });
  });
});