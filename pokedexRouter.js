const express = require('express');
const pokedexRouter = express.Router();

const { findIndexById, checkQuery, filterByName, filterByType, checkOriginalID, createError, validateEntry, validType, isDuplicateEntry } = require('./util.js');
const { ReturnCodes } = require('./returnCodes.js');

const data = require('./db/pokemonData.json');

// ================ MIDDLEWARE =================
pokedexRouter.param('id', (req, res, next, id) => {
  if (id === 'all') {
    req.index = id;
    return next();
  }
  const index = findIndexById(Number(id), data);
  if (index !== -1) {
    req.index = index;
    return next();

  } else {
    const err = createError(404, 'Pokemon Entry Not Found');
    return next(err);
    
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
        const err = createError(400, 'Invalid query parameter.');
        return next(err);

      case ReturnCodes.Q_NAME:
        const entriesByName = filterByName(req.query.name, data);
        return res.send(entriesByName);

      case ReturnCodes.Q_TYPE:
        if (validType(req.query.type) === ReturnCodes.SUCCESS) {
          const mode = Number(req.query.strict || 0);
          const entriesByType = filterByType(req.query.type, data, mode);
          return res.send(entriesByType);

        } else {
          const err = createError(400, `Invalid Pokemon type: ${req.query.type}`);
          return next(err);

        }
        
    }
      
  } else {
    res.status(200).send(data[req.index]);
  }
});

// ==================== POST ====================
pokedexRouter.post('/', validateEntry, (req, res, next) => {
  const entry = req.body.entry;

  if (isDuplicateEntry(entry, data)) {
    const err = createError(400, 'This is a duplicate entry.');
    return next(err);
    
  } else {
    data.push(entry);
    return res.status(200).send({status: 'SUCCESS', newEntry: entry });

  }
});

// ==================== PUT ====================
pokedexRouter.put('/', validateEntry, (req, res, next) => {
  const entry = req.body.entry;

  switch (checkOriginalID(entry.id)) {
    case ReturnCodes.VALID_ID:
      const index = findIndexById(Number(entry.id), data);
      if (index === -1) {
        const err = createError(404, `Could not find entry to update with ID:${entry.id}`);
        return next(err);

      } else {
        data[index] = entry;
        return res.status(200).send({status: 'SUCCESS', updatedEntry: entry});
      }

    case ReturnCodes.ORIGINAL_ID:
      const err = createError(403, 'You cannot modify any of the original 151 pokemon entries.');
      return next(err);
  }
});

// ==================== DELETE ====================
pokedexRouter.delete('/:id', (req, res, next) => {
  if (req.index < 151) {
    const err = createError(403, 'You cannot delete any of the original 151 pokemon entries.');
    next(err);

  } else if (req.index === 'all') {
    const err = createError(400, 'Bad Request. Specify ID.');
    next(err);

  } else {
    const deletedEntry = data.splice(req.index, 1);
    res.send({status:'SUCCESS', deletedEntry: deletedEntry});

  }
});

module.exports = pokedexRouter;