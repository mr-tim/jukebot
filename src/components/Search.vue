<template>
  <div class="search">
    <b-card style="margin-bottom: 20px">
      <b-input-group left="Search">
        <b-form-input type="search"/>
      </b-input-group>
    </b-card>

    <div class="search-results">
      <search-result v-for="result in searchResults"
        :key="result.uri"
        :result="result">
      </search-result>
    </div>
  </div>
</template>

<script>
function simplify (result) {
  return {
    'image300': result.album.images[1].url,
    'image64': result.album.images[2].url,
    'title': result.name,
    'artist': result.artists.map(a => a.name).join(', '),
    'uri': result.uri
  }
}

const searchResults = require('../../search-tim.json').tracks.items.map(simplify)

import SearchResult from './SearchResult.vue'

export default {
  name: 'search',
  components: {
    SearchResult
  },
  data () {
    console.log(searchResults)
    return {
      searchResults
    }
  }
}
</script>

<style>

</style>
