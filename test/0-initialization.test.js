const { assert } = require('chai');
const request = require('supertest');
const app = require('../pokemonServer');
require('dotenv').config();

describe('Server is running...', () => {
  describe('Initializing server setup...', () => {
    it('Waiting for server to complete setup...', async () => {
      let setupIncomplete = process.env.SERVER_SETUP_COMPLETE === 'false';
      
      process.stdout.write('    ');
      
      while (setupIncomplete) {
        await delay(2000);
        
        setupIncomplete = process.env.SERVER_SETUP_COMPLETE === 'false';
        if(!setupIncomplete) break;

        process.stdout.write('.');
      }
      process.stdout.write('\n');
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

// Utility function
const delay = ms => new Promise(res => setTimeout(res, ms));