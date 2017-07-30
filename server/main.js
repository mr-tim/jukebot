const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const pg = require('pg')
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/jukebot'

const pool = new pg.Pool({connectionString: connectionString})

const PORT = process.env.PORT || 3000;

const server = express();

server.use(bodyParser.json());
server.use(morgan('tiny'))

server.post('/api/enqueue', (req, res) => {
  const track = req.body
  console.log(`Request to enqueue track: ${JSON.stringify(track)}`)
  pool.query({text: 'insert into queued_tracks (spotify_uri) values ($1)', values: [track.spotifyUri]})
  .then(() => {
    return res.status(201).json({'status': 'ok'})
  })
  .catch((e) => {
    console.error(e)
  })
});

const SpotifyWebApi = require('spotify-web-api-node')
const spotifyApi = new SpotifyWebApi()
const rest = require('restler')

function renewSpotifyToken() {
  const spotifyCredentials = require('./spotifyCredentials.json')

  rest.post('https://accounts.spotify.com/api/token', { 
    data: {
      'grant_type': 'client_credentials'
    }, 
    username: spotifyCredentials['clientId'], 
    password: spotifyCredentials['clientSecret'] })
    .on('complete', function (data, response) {
      if (response.statusCode == 200) {
        const resultJson = JSON.parse(response.raw.toString('utf-8'))
        const token = resultJson['access_token']
        spotifyApi.setAccessToken(token)
        console.log('Successfully renewed access token')
      }
      else {
        console.log('Unexpected response code when renewing access token:')
        console.log(response.raw.toString('utf-8'))
      }
    })

  setTimeout(renewSpotifyToken, 30*60*1000)
}

renewSpotifyToken()

server.get('/api/search', (req, res) => {
  const searchTerm = req.query['q']
  console.log('Search for ' + searchTerm)
  spotifyApi.searchTracks(searchTerm, {market: 'GB'})
  .then((data) => {
    res.status(200).json(data['body'])
  })
  .catch((err) => {
    res.status(500).json({error: err})
  })
})

server.listen(PORT, () => {
  console.log(`The API is listening on port ${PORT}`)
})
