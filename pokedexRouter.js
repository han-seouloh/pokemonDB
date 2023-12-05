const express = require('express');
const pokedexRouter = express.Router();

const data = require('./pokemonData.json');

const { findIndexById } = require('./util.js');
pokedexRouter.param('id', (req, res, next, id) => {
  if (id === 'all') {
    req.index = id;
    next();
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
pokedexRouter.post('/:id', (req, res, next) => {

});

// ==================== PUT ====================


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