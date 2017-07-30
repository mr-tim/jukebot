import axios from 'axios'

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

function simplifySearchResult (result) {
  return {
    'image300': result.album.images[1].url,
    'image64': result.album.images[2].url,
    'title': result.name,
    'artist': result.artists.map(a => a.name).join(', '),
    'uri': result.uri,
    'enqueued': false
  }
}

const store = new Vuex.Store({
  state: {
    searchResults: []
  },

  actions: {
    'LOAD_SEARCH_RESULTS': function (context, searchTerm) {
      if (searchTerm.length === 0) {
        context.commit('SET_SEARCH_RESULTS', { searchResults: [] })
      } else {
        axios.get('/api/search?q=' + encodeURI(searchTerm))
        .then((response) => {
          var results = response.data.tracks.items.map(simplifySearchResult)
          context.commit('SET_SEARCH_RESULTS', { searchResults: results })
        }, (err) => {
          console.log(err)
        })
      }
    },

    'ENQUEUE': function (context, track) {
      axios.post('/api/enqueue', { spotifyUri: track.uri })
        .then((response) => {
          context.commit('SET_ENQUEUED', { track: track })
        })
    }
  },

  mutations: {
    'SET_SEARCH_RESULTS': (state, { searchResults }) => {
      state.searchResults = searchResults
    },

    'SET_ENQUEUED': (state, { track }) => {
      state.searchResults.forEach((r) => {
        if (r.uri === track.uri) {
          r.enqueued = true
        }
      })
    }
  }
})

export default store
