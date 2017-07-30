const SonosSystem = require('sonos-discovery')

const discovery = new SonosSystem({});

var currentIndex = 0;
var addingToQueue = false;

// extract tracks from playlist json:
// cat playlist.json | jq '[.tracks.items[].track.uri]'
const trackUris = [
  "spotify:track:6gOirCUz62z0mFhCJ6P5KC",
  "spotify:track:1Rvl8qsKJurfFTyWLBI9ib",
  "spotify:track:5ByIHT8s38diBQf6dkEWbt",
  "spotify:track:40dJCw4xU6Bd5ie9rfagNo",
  "spotify:track:2XCI7vQB1pnGR3nuPtoejf",
  "spotify:track:0ky5BaGgJJnYATgz2KAc1q",
  "spotify:track:43VSZHjLjjxSi7KosnHZ8w",
  "spotify:track:04tphyAEH1SJFp6beHQdaz",
  "spotify:track:43L7sXzJLKnto5PpKLf28r",
  "spotify:track:18n3RlT0UNcy2yHImHy8IT",
  "spotify:track:44L7aDHaRzb9pMWEZjSH8u",
  "spotify:track:222iv52N3sRK2iTJGlfGq0",
  "spotify:track:6hdNOhGNR1x0q7xPfOfYhm",
  "spotify:track:3TjlMH27nWbY3veJ8fHdaD",
  "spotify:track:6cpk00i5TxCqSeqNi2HuIe",
  "spotify:track:3WkPRXJvKa7tRAvx5g0idb",
  "spotify:track:3RNyGLgSvmVRZ7xKUp8Wgd",
  "spotify:track:55A8N3HXzIecctUSvru3Ch",
  "spotify:track:64LEzmN3831SPhxGIBQ4KH",
  "spotify:track:52Rp3xBJFYYdmpgzDy0Quf",
  "spotify:track:2hbA72TFulrNGTEBUMAnzG",
  "spotify:track:1Ho2mFQ415Q97rEe5hSO1x",
  "spotify:track:1MkcvwNhKiE5vyrw73xZtY",
  "spotify:track:5SI6jYhKUWm1qnaheTm4Zw",
  "spotify:track:7kTvXtMERxvwCGcWv68ssH",
  "spotify:track:0vFs2Eorve6vnnQcmItot1",
  "spotify:track:34zWZOSpU2V1ab0PiZCcv4",
  "spotify:track:7INi4pMPG4IE0Smx5y4KVf",
  "spotify:track:7Bz8yww6UMbTgTVLG6zbI4",
  "spotify:track:4Xgr8IWwGSGyqLjwiwOxqk",
  "spotify:track:6B1mi7lMKxdSuD40kxAIs9",
  "spotify:track:1F6A8AHmzEyzPSrEc9aumd",
  "spotify:track:6Fj36toK6ky8HhyZdVTsce",
  "spotify:track:6XitzIBDSAbU9gU9lhouQa",
  "spotify:track:7cKLOenzViwzoHJWciMIrj",
  "spotify:track:680kMGV6szhTiZbHRr3vLi",
  "spotify:track:2lPfcRMRLffiBTwLA9S8Vc",
  "spotify:track:4MM4UlT0j7MePs9bMoi34N",
  "spotify:track:1Sp1rSN58hcQhdMzqk4IcE",
  "spotify:track:3ldG6XCLDXxWg1N6XhrSKo",
  "spotify:track:386RUes7n1uM1yfzgeUuwp",
  "spotify:track:1I6q6nwNjNgik1Qe8Oi0Y7",
  "spotify:track:3sFEGvMPkY8Ti97K94Pwp9",
  "spotify:track:0INtJm8gCJKtNaAYQNVlpZ",
  "spotify:track:6HHrXbBPk5ybtKuYG9SZDH",
  "spotify:track:6OJq6oyCcsJUg4fENeNJk4",
  "spotify:track:3yGdLMObhf3IbmzfLohAAh",
  "spotify:track:2SE11vmjbi7j5QKJ885ib6",
  "spotify:track:7LOAChK8Lkj8ZdF1LuhNWP",
  "spotify:track:4OsZ1vrenrtSbqLJxOceKl"
];

// var country = '';
// var accountId = '';
// var accountSN = '';
// var searchType = 0;
//
// const request = require('request-promise');
//
// function getAccountId(player, service)
// {
//   accountId = '';
//
//   if (service != 'library') {
//     return request({url: player.baseUrl + '/status/accounts',json: false})
//       .then((res) => {
//         console.log(`Response: ${res}`)
//         var actLoc = res.indexOf(player.system.getServiceType(service));
//
//         if (actLoc != -1) {
//           var idLoc = res.indexOf('<UN>', actLoc)+4;
//           var snLoc = res.indexOf('SerialNum="', actLoc)+11;
//
//           accountId = res.substring(idLoc,res.indexOf('</UN>',idLoc));
//           console.log(`accountId: ${accountId}`)
//           accountSN = res.substring(snLoc,res.indexOf('"',snLoc));
//           console.log(`accountSn: ${accountSN}`)
//         }
//
//         return Promise.resolve();
//       });
//
//     return promise;
//   } else {
//     return Promise.resolve();
//   }
// }

const pg = require('pg')
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/jukebot'
const pool = new pg.Pool({connectionString: connectionString})

function fetchAndQueueNextTrack (player) {
  // getAccountId(player, 'Spotify')
  addingToQueue = true
  pool.query('select id, request_time, spotify_uri from queued_tracks where queued = false order by request_time asc limit 1')
  .then((res) => {
    result = res.rows[0]
    if (result !== undefined) {
      const spotifyUri = result.spotify_uri
      const delQueue = pool.query({text: 'update queued_tracks set queued = true where id = $1', values: [result.id]})
      queueTrack(player, spotifyUri).then(() => {
        console.log('Next track queued successfully!')
        addingToQueue = false
      })
    }
    else {
      const spotifyUri = trackUris[currentIndex]
      currentIndex = (currentIndex + 1) % trackUris.length
      queueTrack(player, spotifyUri).then(() => {
        console.log('Next track queued successfully!')
        addingToQueue = false
      })
    }
  })
}

function queueTrack(player, spotifyUri) {
  console.log(`Next track: ${spotifyUri}`)
  const encodedSpotifyUri = encodeURIComponent(spotifyUri);
  const serviceType = player.system.getServiceType('Spotify')
  console.log(`Service type: ${serviceType}`)
  const sid = player.system.getServiceId('Spotify')
  const uri = `x-sonos-spotify:${encodedSpotifyUri}?sid=${sid}&flags=0&sn=1`;
  console.log(`Spotify sid: ${sid}`)
  const metadata = getSpotifyMetadata(encodedSpotifyUri, serviceType)
  console.log(`Track metadata: ${metadata}`)
  return player.coordinator.addURIToQueue(uri, metadata)
}

function nextTrackIsEmpty (state) {
  return state.nextTrack.uri.length === 0 && !addingToQueue;
}
function getSpotifyMetadata(uri, serviceType) {
  const encodedId = encodeURIComponent(decodeURIComponent(uri).substring('spotify:track:'.length))
  return `<DIDL-Lite xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/" xmlns:r="urn:schemas-rinconnetworks-com:metadata-1-0/" xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/">
        <item id="00032020${uri}" restricted="true">
            <upnp:class>object.item.audioItem.musicTrack</upnp:class>
            <desc id="cdudn" nameSpace="urn:schemas-rinconnetworks-com:metadata-1-0/">SA_RINCON${serviceType}_X_#Svc${serviceType}-0-Token</desc>
        </item>
      </DIDL-Lite>`;
}

discovery.on('transport-state', (player) => {
  if (player.roomName === 'Kitchen') {
    // console.log('Transport state change: ' + JSON.stringify(player, null, 2))
    // console.log()

    if (nextTrackIsEmpty(player.state)) {
      console.log('No next track - fetching and queuing next...')
      fetchAndQueueNextTrack(player)
      // .catch((err) => {
      //   console.log('Something went wrong :(')
      //   console.log(JSON.stringify(err, null, 4))
      //   addingToQueue = false
      // })
    }
  }
})

// discovery.on('topology-change', (topology) => {
//   console.log('Toplogy change: ' + JSON.stringify(topology, null, 2))
//   console.log()
// })
