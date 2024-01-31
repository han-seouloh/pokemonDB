const { assert } = require('chai');
const request = require('supertest');
const app = require('../pokemonServer');
require('dotenv').config();

describe('Testing pokemonServer and pokemonRouter routes...', () => {
  const agent = request.agent(app);
  it('Logging in before testing pokedex routes...', (done) => {
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

  describe('Testing / route...', () => {
    it('Returns introductory info...', (done) => {
      agent
      .get('/')
      .end((err, res) => {
        if (err) throw err;
        const data = JSON.parse(res.text);
        assert.include(data.introduction.welcome, 'Hey!');
        
        done();
      });
    });
  });

  describe('Testing /help route...', () => {
    it('Returns help info...', (done) => {
      agent
      .get('/help')
      .end((err, res) => {
        if (err) throw err;
        const data = JSON.parse(res.text);
        assert.include(data.help.GET["end-point"], '/pokedex/:id');
        
        done();
      });
    });
  });

  describe('Testing /pokedex route...', () => {
    describe('Testing GET routes', () => {
      it('GET /pokedex/all returns 152 entries...', (done) => {
        agent
        .get('/pokedex/all')
        .end((err, res) => {
          if (err) throw err;
          const data = JSON.parse(res.text);
          assert.equal(data.length, 152);
          
          done();
        });
      });
  
      it('GET /pokedex/59 returns Arcanine entry...', (done) => {
        agent
        .get('/pokedex/59')
        .end((err, res) => {
          if (err) throw err;
          const data = JSON.parse(res.text);
          assert.equal(data.name, "Arcanine");
          
          done();
        });
      });

      it('GET /pokedex/all?name=nido returns Pokemon entries in which names include "nido"...', (done) => {
        const substring = 'nido';
        agent
        .get(`/pokedex/all?name=${substring}`)
        .end((err, res) => {
          if (err) throw err;
          const data = JSON.parse(res.text);
          const allInclude = data.every(entry => entry.name.toLowerCase().includes(substring.toLowerCase()));
          
          assert.isTrue(allInclude && data.length === 6);
          done();
        });
      });

      it('GET /pokedex/all?type=Fire returns all fire type Pokemon entries...', (done) => {
        const pokeType = 'Fire';
        agent
        .get(`/pokedex/all?type=${pokeType}`)
        .end((err, res) => {
          if (err) throw err;
          const data = JSON.parse(res.text);
          const allInclude = data.every(entry => entry.type.includes(pokeType));

          assert.isTrue(allInclude && data.length === 12);
          done();
        });
      });

      it('GET /pokedex/all?type=Fire&strict=1 returns all Pokemon entries that are only Fire type...', (done) => {
        const pokeType = 'Fire';
        agent
        .get(`/pokedex/all?type=${pokeType}&strict=1`)
        .end((err, res) => {
          if (err) throw err;
          const data = JSON.parse(res.text);
          const allInclude = data.every(entry => entry.type.includes(pokeType));
          const onlyFireType = data.every(entry => entry.type.length === 1);

          assert.isTrue(allInclude && onlyFireType && data.length === 10);
          done();
        });
      });

      it('GET /pokedex/153 returns "Not Found" error...', (done) => {
        agent
        .get('/pokedex/153')
        .end((err, res) => {
          if (res.text) {
            const message = JSON.parse(res.text).error
            assert.include(message, "Not Found");
            done();
          } else {
            throw new Error('Expected "Not Found" error, but got another response');
          }
        });
      });

      it('GET /pokedex/all?invalidQuery=0 returns "Invalid query parameter" error...', (done) => {
        agent
        .get('/pokedex/all?invalidQuery=0')
        .end((err, res) => {
          if (res.text) {
            const message = JSON.parse(res.text).error
            assert.include(message, "Invalid query parameter");
            done();
          } else {
            throw new Error('Expected "Not Found" error, but got another response');
          }
        });
      });

      it('GET /pokedex/all?type=invalidType returns "Invalid Pokemon type" error...', (done) => {
        agent
        .get('/pokedex/all?type=invalidType')
        .end((err, res) => {
          if (res.text) {
            const message = JSON.parse(res.text).error
            assert.include(message, "Invalid Pokemon type");
            done();
          } else {
            throw new Error('Expected "Not Found" error, but got another response');
          }
        });
      });
    });
  });
});