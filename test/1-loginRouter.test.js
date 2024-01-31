const { assert } = require('chai');
const request = require('supertest');
const app = require('../pokemonServer');
require('dotenv').config();

describe('Testing loginRouter routes...', () => {
  const agent = request.agent(app);

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

      it('Verifying duplicate registers should return an error...', async () => {
        const username = 'prof_birch';
        const password = 'Pokedex2*';
        
        const response = await request(app)
          .post('/register')
          .send({username, password});
        const data = JSON.parse(response.text);

        assert.include(data.error, 'Username already exists');
      });
    });
  });

  describe('Testing /login route...', () => {
    describe('User logging in...', () => {
      it('Verifying /login returns login instructions...', async() => {
        const response = await request(app)
          .get('/login');
        const data = JSON.parse(response.text);

        assert.include(data.login, 'send POST request to /login');
        assert.include(data.info, 'If authentication fails');
      });

      it('Verifying login failure redirects to /login...', async() => {
        const response = await request(app)
          .post('/login')
          .send({
            username: process.env.ADMIN_USERNAME,
            password: 'wrongPassword'
          });

        assert.include(response.text, 'Redirecting to /login');
      });

      it('Verifying successful login', (done) => {
        agent
          .post('/login')
          .send({
            username: process.env.ADMIN_USERNAME,
            password: process.env.ADMIN_PASSWORD
          })
          .end((err, res) => {
            if (err) throw err;
            assert.equal(res.text, 'Found. Redirecting to /');
            done();
          });
      });
    });
  });

  describe('Testing /logout route...', () => {
    it('User successfully logs out...', (done) => {
      agent
        .get('/logout')
        .end((err, res) => {
          if (err) throw err; 
          assert.include(res.text, 'Redirecting to /login');
          done();
        });
    });
  });
});