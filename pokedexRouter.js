const express = require('express');
const pokedexRouter = express.Router();

const { findIndexById, verifyEntry, checkQuery, filterByName, filterByType, checkID } = require('./util.js');
const { ReturnCodes } = require('./returnCodes.js');

const data = require('./db/pokemonData.json');


// ============= MIDDLEWARE FUNCTIONS =============
const validateEntry = (req, res, next) => {
  const retCode = verifyEntry(req.body.entry);

  switch (retCode) {
    case ReturnCodes.SUCCESS:
      return next();

    case ReturnCodes.GENERAL_FAILURE:
      return res.send('Missing entry properties or invalid id.');

    case ReturnCodes.NOT_A_NUMBER:
      return res.send('id property is not a number.');

    case ReturnCodes.NOT_A_STRING:
      return res.send('name, description or type array elements are not strings.');

    case ReturnCodes.NOT_AN_ARRAY:
      return res.send('type property is not an array.')
  }
}

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
    const retCode = checkQuery(req.query);

    switch (retCode) {
      case ReturnCodes.Q_EMPTY:
        return res.status(200).send(data);

      case ReturnCodes.Q_INVALID:
        return res.send('Invalid query parameter.');

      case ReturnCodes.Q_NAME:
        const entriesByName = filterByName(req.query.name, data);
        return res.send(entriesByName);

      case ReturnCodes.Q_TYPE:
        const mode = Number(req.query.strict || 0);
        const entriesByType = filterByType(req.query.type, data, mode);
        return res.send(entriesByType);
    }
      
  } else {
    res.status(200).send(data[req.index]);
  }
});

// ==================== POST ====================
pokedexRouter.post('/', validateEntry, (req, res, next) => {
  const entry = req.body.entry;
  const index = findIndexById(Number(entry.id), data);

  if (index === -1) {
    data.push(entry);
    return res.status(200).send(entry);
  } else {
    res.send('This entry id already exists.');
  }
});

// ==================== PUT ====================
pokedexRouter.put('/', validateEntry, (req, res, next) => {
  const entry = req.body.entry;

  switch (checkID(entry.id)) {
    case ReturnCodes.VALID_ID:
      const index = findIndexById(Number(entry.id), data);
      if (index === -1) {
        return res.status(404).send(`Could not find entry to update with ID:${entry.id}`);
      } else {
        data[index] = entry;
        return res.status(200).send({status: 'SUCCESS', updatedEntry: entry});
      }

    case ReturnCodes.INVALID_ID:
      return res.send('This is an invalid ID. You cannot remove any of the original 151 pokemon.')
  }
});

// ==================== DELETE ====================
pokedexRouter.delete('/:id', (req, res, next) => {
  if (req.index < 151) {
    res.send('Error: You cannot delete any of the original 151 pokemon entries.');
  } else {
    const deletedEntry = data.splice(req.index, 1);
    res.send({status:'SUCCESS', deletedEntry: deletedEntry});
  }
});

// ================ ERROR HANDLERS ================
// TODO - ErrorHandler

module.exports = pokedexRouter;