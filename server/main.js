const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const pg = require('pg')
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/jukebot'

const client = new pg.Client(connectionString)

const PORT = process.env.PORT || 3000;

const server = express();

server.use(bodyParser.json());
server.use(morgan('tiny'))

server.post('/api/enqueue', (req, res) => {
  const track = req.body
  console.log(`Request to enqueue track: ${JSON.stringify(track)}`)

  pg.connect(connectionString, (err, client, done) => {
    console.log('Connected to database')
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    const q = client.query('insert into queued_tracks (spotify_uri) values ($1)', [track.spotifyUri])
    q.on('end', () => {
      done()
      return res.status(201).json({'status': 'ok'})
    })
  })
});

server.listen(PORT, () => {
  console.log(`The API is listening on port ${PORT}`)
})
