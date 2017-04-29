const SonosSystem = require('sonos-discovery')

const discovery = new SonosSystem({});

var currentIndex = 0;
var addingToQueue = false;

const trackUris = [
  'spotify:track:6fTsxhIosAU6zXTAhSaemI',
  'spotify:track:1n7D2aCuzDoFTXSje54YA8',
  'spotify:track:4j0Vn3lI1SHtI4bvJSM47e',
  'spotify:track:7sFPfxWORT9q7WcvkUyZeL',
  'spotify:track:18zyVulK9H3peQTaLlqbGe'
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

function fetchAndQueueNextTrack (player) {
  // getAccountId(player, 'Spotify')
  addingToQueue = true
  const spotifyUri = trackUris[currentIndex]
  currentIndex = (currentIndex + 1) % trackUris.length
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
  const title = `Spotify track ${currentIndex}`
  const encodedId = encodeURIComponent(decodeURIComponent(uri).substring('spotify:track:'.length))
  return `<DIDL-Lite xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/" xmlns:r="urn:schemas-rinconnetworks-com:metadata-1-0/" xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/">
        <item id="00032020${uri}" restricted="true">
            <dc:title>${title}</dc:title>
            <upnp:class>object.item.audioItem.musicTrack</upnp:class>
            <desc id="cdudn" nameSpace="urn:schemas-rinconnetworks-com:metadata-1-0/">SA_RINCON${serviceType}_X_#Svc${serviceType}-0-Token</desc>
        </item>
      </DIDL-Lite>`;
}

discovery.on('transport-state', (player) => {
  if (player.roomName === 'Dining Room') {
    // console.log('Transport state change: ' + JSON.stringify(player, null, 2))
    // console.log()

    if (nextTrackIsEmpty(player.state)) {
      console.log('No next track - fetching and queuing next...')
      fetchAndQueueNextTrack(player).then(() => {
        console.log('Next track queued successfully!')
        addingToQueue = false
      })
      .catch((err) => {
        console.log('Something went wrong :(')
        console.log(JSON.stringify(err, null, 4))
        addingToQueue = false
      })
    }
  }
})

// discovery.on('topology-change', (topology) => {
//   console.log('Toplogy change: ' + JSON.stringify(topology, null, 2))
//   console.log()
// })
