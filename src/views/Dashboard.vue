<i18n src="../locales.json"></i18n>
<i18n>
{
  "en": {
    "title": "Dasboard",
    "tab.repo": "Repositories",
    "tab.health.validated": "State latest validated report",
    "tab.date.validated": "Validation date",
    "tab.health.inprogress": "State latest report in progress",
    "tab.date.inprogress": "Last update date"
  },
  "fr": {
    "title": "Tableau de bord",
    "tab.repo": "Entrepôts",
    "tab.health.validated": "Etat de la dernière fiche validée",
    "tab.date.validated": "Date validation",
    "tab.health.inprogress": "Etat de la dernière fiche en cours",
    "tab.date.inprogress": "Date mise à jour"
  }
}
</i18n>
<template>
  <v-layout>

    <v-flex xs12>
    <h1 class="subheading grey--text">{{ $t('title') }}</h1>
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
                <v-icon>{{ getHealthIcon(item.healthLatestValidReport) }}</v-icon>
            </template> 
            <template v-slot:item.validDate="{ item }">  
                <span>{{ formatDate(item.healthLatestValidReport) }}</span>
            </template> 
            <template v-slot:item.inProgressHealth="{ item }">  
                <v-icon>{{ getHealthIcon(item.healthLatestInProgressReport) }}</v-icon>
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
export default {

  data() {
    return {
      repoList: [],
      loading: false,
      timeout: 2000,
      notifier: false,
      notifierMessage: "",
      notifierColor: "success",
      headers: [
          { text: this.$t('tab.repo'), value: 'repository.name' },
          { text: this.$t('tab.health.validated'), value: 'validHealth' },
          { text: this.$t('tab.date.validated'), value: 'validDate' },
          { text: this.$t('tab.health.inprogress'), value: 'inProgressHealth' },
          { text: this.$t('tab.date.inprogress'), value: 'inProgressDate' }
          ] ,
    }
  },

  created: function() {
    this.$i18n.locale = this.$store.getters.getLanguage;
    var self = this;
    this.axios.get(this.service+'/repository/v1_0/listAllFullRepositories')
    .then(response => {
      self.repoList = response.data
    }).catch(function(error) {self.displayError("An error has occured:" + error)})
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

    formatDate (health) {
        if(health) {
          return moment(health.lastUpdateDate).format('DD MMM YYYY HH:mm')
        } else {
          return ''
        }
    },

    displayError: function(message) {
      this.notifierMessage = message;
      this.notifierColor = "error";
      this.timeout = 8000;
      this.notifier = true;

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

