const express = require('express');
const app = express();
const PORT = 4000;

app.get('/', (req, res, next) => {
  res.send(`
  <h1>Pokemon Server</h1>
  <p>This server is working!</p>
  <p>But it's still currently under construction...</p>
  `);
});

app.listen(PORT, () => {
  console.log(`Server listening on Port:${PORT}`);
})