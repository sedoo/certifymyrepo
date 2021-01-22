<template>
 <v-app class="grey lighten-4">
   <crusoe-app language="fr" :service="service"></crusoe-app>
</v-app>
</template>

<script>

import crusoeApp from './views/crusoe-app.vue'
export default {
  name: 'App',
  components: {
    crusoeApp
  },

  data: () => ({
    service: 'http://localhost:8485'
  }),

  computed: {

  },

  created: function() {

  },
  
  methods: {

  }
};
</script>

