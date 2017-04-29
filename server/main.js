const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan')

const PORT = process.env.PORT || 3000;

const server = express();

server.use(bodyParser.json());
server.use(morgan('tiny'))

server.post('/api/enqueue', (req, res) => {
  const track = req.body
  console.log(`Request to enqueue track: ${JSON.stringify(track)}`)
  res.status(201).json({'status': 'ok'})
});

server.listen(PORT, () => {
  console.log(`The API is listening on port ${PORT}`)
})
