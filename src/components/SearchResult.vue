<template>
  <b-card overlay :img="result.image300" show-footer class="search-result">
    <b-button v-if="!result.enqueued" class="float-right" variant="primary" size="sm" @click="enqueueTrack(result)">
        Add to Queue
    </b-button>
    <b-button v-if="result.enqueued" class="float-right" variant="success" size="sm">Added!</b-button>
    <small slot="footer" class="text-muted">
      {{ result.title }}<br/>{{ result.artist }}
    </small>
  </b-card>
</template>

<script>
export default {
  name: 'search-result',
  props: {
    'result': Object
  },
  methods: {
    enqueueTrack (result) {
      this.$store.dispatch('ENQUEUE', { track: result })
    }
  }
}
</script>

<style>
.search-result {
  margin-left: auto;
  margin-right: auto;
  max-width: 300px;
  margin-bottom: 10px;
  min-height: 370px;
}
</style>
