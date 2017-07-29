<template>
  <div class="search">
    <b-card style="margin-bottom: 20px">
      <b-input-group left="Search">
        <b-form-input type="search" @input="search($event)"/>
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
import { mapState } from 'vuex'

import SearchResult from './SearchResult.vue'

export default {
  name: 'search',
  computed: mapState([
    'searchResults'
  ]),
  components: {
    SearchResult
  },
  methods: {
    search (term) {
      this.$store.dispatch('LOAD_SEARCH_RESULTS', term)
    }
  }
}
</script>

<style>

</style>
