<template>
  <v-layout>

    <v-flex xs12>
    <h1 class="subheading grey--text">{{ $t('dashboard.screen.title') }}</h1>
    <v-progress-linear indeterminate v-if="loading" class="mt-3"></v-progress-linear>
    <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      {{ notifierMessage }}
      <v-btn dark text @click="notifier = false">{{ $t('button.close') }}</v-btn>
    </v-snackbar>

    <div v-if="!loading" class="pa-5">
      <template v-if="repoList != null && repoList.length > 0">
        <v-data-table
          :headers="headers"
          :items="repoList"
          :items-per-page="5"
          class="elevation-1"
        >
            <template v-slot:item.validHealth="{ item }">  
                <v-icon :color="getHealthColor(item.healthLatestValidReport)">{{ getHealthIcon(item.healthLatestValidReport) }}</v-icon>
            </template> 
            <template v-slot:item.validDate="{ item }">  
                <span>{{ formatDate(item.healthLatestValidReport) }}</span>
            </template> 
            <template v-slot:item.inProgressHealth="{ item }">  
                <v-icon :color="getHealthColor(item.healthLatestInProgressReport)">{{ getHealthIcon(item.healthLatestInProgressReport) }}</v-icon>
            </template> 
            <template v-slot:item.inProgressDate="{ item }">  
                <span>{{ formatDate(item.healthLatestInProgressReport) }}</span>
            </template> 
        </v-data-table>
      </template>
    </div>
    </v-flex>
  </v-layout>

</template>

<script>
import moment from 'moment';
import {displayError} from '../utils.js'
export default {

  data() {
    return {
      repoList: [],
      loading: false,
      timeout: 2000,
      notifier: false,
      notifierMessage: "",
      notifierColor: "success",
      headers: [] ,
    }
  },

  created: function() {
    this.$i18n.locale = this.$store.getters.getLanguage;
    this.headers = [
          { text: this.$t('repository.table.column.repository.name'), value: 'repository.name' },
          { text: this.$t('repository.table.column.report.validated.health'), value: 'validHealth' },
          { text: this.$t('repository.table.column.report.validated.date'), value: 'validDate' },
          { text: this.$t('repository.table.column.report.inprogress.health'), value: 'inProgressHealth' },
          { text: this.$t('repository.table.column.report.inprogress.date'), value: 'inProgressDate' }
          ]
    var self = this;
    this.axios.get(this.service+'/repository/v1_0/listAllFullRepositories')
    .then(response => {
      self.repoList = response.data
    }).catch(function(error) {displayError(self, error)})
    .finally(() => self.loading = false)
  },

  props: {

  },

  computed: {

    service: function()  {
      return this.$store.getters.getService
    },

  },

  methods: {

    getHealthIcon(health) {
        if(health) {
          if(health.green) {
            return 'mdi-weather-sunny'
          } else if(health.orange) {
            return 'mdi-weather-partly-cloudy'
          } else if(health.red) {
            return 'mdi-weather-pouring'
          } else {
            return ''
          }
        } else {
          return ''
        }
    },

    getHealthColor(health) {
        if(health) {
          if(health.green) {
            return 'green'
          } else if(health.orange) {
            return 'orange'
          } else if(health.red) {
            return 'red'
          } else {
            return ''
          }
        } else {
          return ''
        }
    },

    formatDate (health) {
        if(health) {
          return moment(health.lastUpdateDate).format('DD MMM YYYY HH:mm')
        } else {
          return ''
        }
    },

    displaySuccess: function(message) {
      this.notifierMessage = message;
      this.notifierColor = "success";
      this.timeout = 4000;
      this.notifier = true;
    }

  },

};

</script>

<style>

.dense .col-12{

  padding: 1px !important;

}

</style>

