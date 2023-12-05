const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = 4000;

const info = require ('./pokemonAPI-help.json');
const pokedexRouter = require('./pokedexRouter');

app.use(bodyParser.json());

app.get('/', (req, res, next) => {
  res.send(info[0]);
});

app.get('/help', (req, res, next) => {
  res.send(info[1]);
});

// Pokedex Routes
app.use('/pokedex', pokedexRouter);

app.listen(PORT, () => {
  console.log(`Server listening on Port:${PORT}`);
});