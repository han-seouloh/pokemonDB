const express = require('express');
const app = express();
const PORT = 4000;

const data = require('./data.json');

app.get('/pokemon-api/', (req, res, next) => {
  res.send(data);
});

app.listen(PORT, () => {
  console.log(`Server listening on Port:${PORT}`);
})