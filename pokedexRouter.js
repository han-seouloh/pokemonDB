const express = require('express');
const pokedexRouter = express.Router();

const data = require('./pokemonData.json');

const { findIndexById, verifyEntry } = require('./util.js');
pokedexRouter.param('id', (req, res, next, id) => {
  if (id === 'all') {
    req.index = id;
    return next();
  }
  const index = findIndexById(Number(id), data);
  if (index !== -1) {
    req.index = index;
    next();
  } else {
    res.status(404).send('Pokemon Entry Not Found');
  }
});

// ==================== GET ==================== 
pokedexRouter.get('/:id', (req, res, next) => {
  if (req.index === 'all') {
    res.status(200).send(data);
  } else {
    res.status(200).send(data[req.index]);
  }
});

// ==================== POST ====================
pokedexRouter.post('/', (req, res, next) => {
  const entry = req.body.entry;
  const index = findIndexById(Number(entry.id), data);
  if (index === -1) {
    const valid = verifyEntry(entry);
    switch (valid) {
      case 0:
        data.push(entry);
        return res.status(200).send(entry);
      case 1:
        return res.send('Missing entry properties.');
      case 10:
        return res.send('id property is not a number.');
      case 11:
        return res.send('name, description or type array elements are not strings.');
      case 12:
        return res.send('type property is not an array.')
    }
  } else {
    res.send('This entry id already exists.');
  }
});

// ==================== PUT ====================
pokedexRouter.put('/:id', (req, res, next) => {

});

// ==================== DELETE ====================
pokedexRouter.delete('/:id', (req, res, next) => {
  if (req.index < 151) {
    res.send('Error: You cannot delete any of the original 151 pokemon entries.')
  } else {
    const deletedEntry = data.splice(req.index, 1);
    res.send({status:'SUCCESS', entry: deletedEntry});
  }
});

module.exports = pokedexRouter;