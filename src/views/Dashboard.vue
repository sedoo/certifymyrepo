<template>
  <v-layout>
    <unidoo-alert></unidoo-alert>
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
          :footer-props="{
              'items-per-page-text':$t('data.table.items.per.page.text'),
              'items-per-page-all-text':$t('data.table.items.per.page.all.text')
          }"
        >
            <template v-slot:item.repositoryCreation="{ item }">  
                <span class="px-2" >{{ formatDate(item.repository.creationDate) }}</span>
            </template> 
            <template v-slot:item.validHealth="{ item }">  
                <v-icon class="px-2" :color="getHealthColor(item.healthLatestValidReport)">{{ getHealthIcon(item.healthLatestValidReport) }}</v-icon>
                <span class="px-2" >{{ formatHealthDate(item.healthLatestValidReport) }}</span>
            </template> 
            <template v-slot:item.inProgressHealth="{ item }">  
                <v-icon class="px-2" :color="getHealthColor(item.healthLatestInProgressReport)">{{ getHealthIcon(item.healthLatestInProgressReport) }}</v-icon>
                <span class="px-2" >{{ formatHealthDate(item.healthLatestInProgressReport) }}</span>
            </template> 
            <template v-slot:footer.page-text="items"> {{ items.pageStart }} - {{ items.pageStop }} {{ $t('data.table.page.text') }} {{ items.itemsLength }} 
            </template>
        </v-data-table>
      </template>
    </div>
    </v-flex>
  </v-layout>

</template>

<script>
import moment from 'moment';
import formatErrorMessageMixin from "../mixins/formatErrorMessageMixin";
export default {
  mixins: [formatErrorMessageMixin],
  data() {
    return {
      repoList: [],
      loading: false,
      headers: [] ,
    }
  },

  created: function() {
    this.$i18n.locale = this.language
    this.headers = [
          { text: this.$t('repository.table.column.repository.name'), value: 'repository.name' },
          { text: this.$t('repository.table.column.repository.creation.date'), value: 'repositoryCreation' },
          { text: this.$t('repository.table.column.report.validated.health'), value: 'validHealth' },
          { text: this.$t('repository.table.column.report.inprogress.health'), value: 'inProgressHealth' }
          ]
    var self = this;
    this.axios.get(this.service+'/repository/v1_0/listAllFullRepositories')
    .then(response => {
      self.repoList = response.data
    }).catch(function(error) {
      self.$unidooAlert.showError(self.formatError(self.$t('error.notification'), error))
    })
    .finally(() => self.loading = false)
  },

  props: {

  },

  computed: {

    service: function()  {
      return this.$store.getters.getService
    },

    language: function() {
      return this.$store.getters.getLanguage
    }

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

    formatHealthDate (health) {

        if(health && health.latestReport && health.latestReport.updateDate) {
          return this.formatDate(health.latestReport.updateDate)
        } else {
          return ''
        }
    },

    formatDate (date) {
      if(date) {
        let localizedDate = moment(date).locale(this.language)
        return localizedDate.format('DD MMM YYYY HH:mm')
      } else {
        return ''
      }
    },

  },

};

</script>

<style>

.dense .col-12{

  padding: 1px !important;

}

</style>

