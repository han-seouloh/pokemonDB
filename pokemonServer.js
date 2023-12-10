const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const PORT = process.env.PORT || 4000;

const info = require ('./db/pokemonAPI-help.json');
const pokedexRouter = require('./pokedexRouter');

app.use(bodyParser.json());
app.use(morgan('dev'));

app.get('/', (req, res, next) => {
  res.send(info[0]);
});

app.get('/help', (req, res, next) => {
  res.send(info[1]);
});

// Pokedex Routes
app.use('/pokedex', pokedexRouter);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status).send({ error: err.status, message: err.message});
});

app.listen(PORT, () => {
  console.log(`Server listening on Port:${PORT}`);
});