<template>
  <v-layout>
    <v-flex xs12>
    <h1 class="subheading grey--text">{{ $t('dashboard.screen.title') }}</h1>

    <v-progress-linear indeterminate v-if="loading" class="mt-3"></v-progress-linear>
    <div v-else class="pa-5">
      <template v-if="repoList != null && repoList.length > 0">
        <v-data-table
          :headers="headers"
          :items="repoList"
          :items-per-page="5"
          sort-by="name"
          class="elevation-1"
          :footer-props="{
              'items-per-page-text':$t('data.table.items.per.page.text'),
              'items-per-page-all-text':$t('data.table.items.per.page.all.text')
          }"
        >
            <template v-slot:item.creationDate="{ item }">  
                <span class="px-2" >{{ formatDate(item.creationDate) }}</span>
            </template>
            <template v-slot:item.latestValidReportUpdateDate="{ item }">  
                <v-tooltip bottom z-index="12">
                  <template v-if="!item.readonly" v-slot:activator="{ on }">
                    <v-icon v-on="on" class="px-2" :color="getHealthColor(item.healthLatestValidReport)">{{ getHealthIcon(item.healthLatestValidReport) }}</v-icon>
                  </template>
                  <span v-if="item.healthLatestValidReport && item.healthLatestValidReport.green">{{ $t('health.icon.legend.green') }}</span>
                  <span v-if="item.healthLatestValidReport && item.healthLatestValidReport.orange">{{ $t('health.icon.legend.orange') }}</span>
                  <span v-if="item.healthLatestValidReport && item.healthLatestValidReport.red">{{ $t('health.icon.legend.red') }}</span>
                </v-tooltip>
                <span class="px-2" >{{ formatDate(item.latestValidReportUpdateDate) }}</span>
            </template> 
            <template v-slot:item.latestInProgressReportUpdateDate="{ item }">  
                <v-tooltip bottom z-index="12">
                  <template v-if="!item.readonly" v-slot:activator="{ on }">
                    <v-icon v-on="on" class="px-2" :color="getHealthColor(item.healthLatestInProgressReport)">{{ getHealthIcon(item.healthLatestInProgressReport) }}</v-icon>
                  </template>
                  <span v-if="item.healthLatestInProgressReport && item.healthLatestInProgressReport.green">{{ $t('health.icon.legend.green') }}</span>
                  <span v-if="item.healthLatestInProgressReport && item.healthLatestInProgressReport.orange">{{ $t('health.icon.legend.orange') }}</span>
                  <span v-if="item.healthLatestInProgressReport && item.healthLatestInProgressReport.red">{{ $t('health.icon.legend.red') }}</span>
                </v-tooltip>
                <span class="px-2" >{{ formatDate(item.latestInProgressReportUpdateDate) }}</span>
            </template> 
            <template v-slot:footer.page-text="items"> {{ items.pageStart }} - {{ items.pageStop }} {{ $t('data.table.page.text') }} {{ items.itemsLength }} 
            </template>
        </v-data-table>
        <dashboard-semester-charts/>
      </template>
    </div>
    </v-flex>
  </v-layout>

</template>

<script>
import DashboardSemesterCharts from "../components/DashboardSemesterCharts.vue";
import moment from 'moment';
export default {
  components: {
      DashboardSemesterCharts
  },
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
          { text: this.$t('repository.table.column.repository.name'), value: 'name' },
          { text: this.$t('repository.table.column.repository.creation.date'), value: 'creationDate' },
          { text: this.$t('repository.table.column.report.validated.health'), value: 'latestValidReportUpdateDate' },
          { text: this.$t('repository.table.column.report.inprogress.health'), value: 'latestInProgressReportUpdateDate' }
          ]
    var self = this;
    this.axios.get(this.$service+'/repository/v1_0/listAllFullRepositories')
    .then(response => {
      self.repoList = response.data
    }).catch(function(error) {
      self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
    })
    .finally(() => self.loading = false)
  },

  props: {

  },

  computed: {

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

