<template>
  <b-card overlay :img="result.image300" show-footer class="search-result">
    <b-button class="float-right" variant="primary" size="sm">
        Add to Queue
    </b-button>
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
  }
}
</script>

<style>
.search-result {
  margin-left: auto;
  margin-right: auto;
  max-width: 300px;
  margin-bottom: 10px;
}
</style>
