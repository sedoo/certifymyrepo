<template>
      <div id="chart">
        <v-progress-linear indeterminate v-if="loading" class="mt-3"></v-progress-linear>
        <v-card v-else class="mt-10">
          <v-card-title>{{ $t('dashboard.screen.semester.graphs') }}</v-card-title>
        <v-card-text>
          <apexchart  type="bar" height="350" :options="chartOptions" :series="series"></apexchart>
          <apexchart  type="bar" height="350" :options="chartOptionsUsersRoles" :series="seriesUsersRoles"></apexchart>
          <p class="legend center">{{ $t('dashboard.screen.role.legend') }}</p>
          <apexchart  type="bar" height="350" :options="chartOptionsStacked" :series="serieReports"></apexchart>
        </v-card-text>
        </v-card>

      </div>
</template>
<script>
export default {
  computed: {

  },

  props: {

  },

  watch: { 

  },

  mounted: function() {

  },

  created: function() {
    this.$i18n.locale = this.$store.getters.getLanguage
    let year = new Date().getFullYear();
    // initialize array yearsItems from 2015 to current year
    this.years = []
    for (let y = 2021; y<=year; y++) {
      this.years.push(y)
    }
    this.year= this.years[this.years.length - 1]
    this.loadStats()

  },

  methods: {
    loadStats() {
      this.loading = true
      this.axios({
              method: 'get',
              url: this.$service+"/statistics/v1_0/getStats"
          })
          .then(response => {

            let dataGreen = []
            let dataOrange = []
            let dataRed = []
            let dataNoReport = []
            let xAxis = []
            this.serieReports = []
            let statsByYear = response.data;

            statsByYear.sort(function (a, b) {
              return a.year - b.year;
            });

            let serieUsers = {name: this.$t('dashboard.screen.users'), data: []}
            let serieRepo = {name: this.$t('dashboard.screen.repositories'), data: []}

            let serieEditor = {name: this.$t('dashboard.screen.role.editor'), data: []}
            let serieContributor = {name: this.$t('dashboard.screen.role.repo.contributor'), data: []}
            let serieReader = {name: this.$t('dashboard.screen.role.reader'), data: []}
            let serieNoRole = {name: this.$t('dashboard.screen.role.none'), data: []}

            for(let i=0 ; i<statsByYear.length ; i++) {
              if(statsByYear[i].firstSemester) {
                  serieUsers.data.push(statsByYear[i].firstSemester.users)
                  serieRepo.data.push(statsByYear[i].firstSemester.repositories)
                  dataGreen.push(statsByYear[i].firstSemester.greenReports)
                  dataOrange.push(statsByYear[i].firstSemester.orangeReports)
                  dataRed.push(statsByYear[i].firstSemester.redReports)
                  dataNoReport.push(statsByYear[i].firstSemester.noReports)
                  serieEditor.data.push(statsByYear[i].firstSemester.numberOfEditors)
                  serieContributor.data.push(statsByYear[i].firstSemester.numberOfContributors)
                  serieReader.data.push(statsByYear[i].firstSemester.numberOfReaders)
                  serieNoRole.data.push(statsByYear[i].firstSemester.numberUsersWithoutRepo)
                  xAxis.push("S1 - "+statsByYear[i].year)
              }
              if(statsByYear[i].secondSemester) {
                  serieUsers.data.push(statsByYear[i].secondSemester.users)
                  serieRepo.data.push(statsByYear[i].secondSemester.repositories)
                  dataGreen.push(statsByYear[i].secondSemester.greenReports)
                  dataOrange.push(statsByYear[i].secondSemester.orangeReports)
                  dataRed.push(statsByYear[i].secondSemester.redReports)
                  dataNoReport.push(statsByYear[i].secondSemester.noReports)
                  serieEditor.data.push(statsByYear[i].secondSemester.numberOfEditors)
                  serieContributor.data.push(statsByYear[i].secondSemester.numberOfContributors)
                  serieReader.data.push(statsByYear[i].secondSemester.numberOfReaders)
                  serieNoRole.data.push(statsByYear[i].secondSemester.numberUsersWithoutRepo)
                  xAxis.push("S2 - "+statsByYear[i].year)
              }
            }

          this.serieReports.push({name: this.$t('health.icon.legend.green'), data: dataGreen})
          this.serieReports.push({name: this.$t('health.icon.legend.orange'), data: dataOrange})
          this.serieReports.push({name: this.$t('health.icon.legend.red'), data: dataRed})
          this.serieReports.push({name: this.$t('health.icon.legend.nodata'), data: dataNoReport})

          this.series = []
          this.series.push(serieUsers)
          this.series.push(serieRepo)

          this.seriesUsersRoles.push(serieEditor)
          this.seriesUsersRoles.push(serieContributor)
          this.seriesUsersRoles.push(serieReader)
          this.seriesUsersRoles.push(serieNoRole)
          
          
          this.chartOptions.xaxis.categories = xAxis
          this.chartOptionsUsersRoles = JSON.parse(JSON.stringify(this.chartOptions))

          this.chartOptionsStacked.xaxis.categories = xAxis

          let maxNumberOfUsers = Math.ceil(Math.max(...serieUsers.data)/10)*10
          let yaxisUsers = { seriesName: serieUsers.name,
                      opposite: false,
                      title: {
                        text: this.$t('dashboard.screen.users.all')
                      },
                      min: 0,
                      max: maxNumberOfUsers,
                      tickAmount: maxNumberOfUsers/10
                    }
          let maxNumberOfRepositories = Math.ceil(Math.max(...serieRepo.data)/10)*10
          let yaxisRepo = { seriesName: serieRepo.name,
                      opposite: true,
                      title: {
                        text: this.$t('dashboard.screen.repositories')
                      },
                      min: 0,
                      max: maxNumberOfRepositories,
                      tickAmount: maxNumberOfRepositories/10
                    }
          this.chartOptions.yaxis = []
          this.chartOptions.yaxis.push(yaxisUsers)
          this.chartOptions.yaxis.push(yaxisRepo)

          let yaxisUsersRole = { seriesName: serieUsers.name,
                      opposite: false,
                      title: {
                        text: this.$t('dashboard.screen.users')
                      },
                      min: 0,
                      max: maxNumberOfUsers,
                      tickAmount: maxNumberOfUsers/10
                    }
          this.chartOptionsUsersRoles.yaxis = yaxisUsersRole

          this.chartOptionsStacked.yaxis = {
                      title: {
                        text: this.$t('dashboard.screen.repositories.states')
                      },
                      min: 0,
                      max: maxNumberOfRepositories,
                      tickAmount: maxNumberOfRepositories/10
                    }
        })
          
          .catch(error => {
            this.$unidooAlert.showError(this.$unidooAlert.formatError(this.$t('error.notification'), error), this.$t('button.close'))
          }).finally(() => {
            this.loading = false
          })
    }
  },

  data() {
    return {
      loading: false,
      year: 2021,
      years: [2021],
      series: [],
      seriesUsersRoles: [],
      serieReports: [],
      chartOptionsUsersRoles: null,
      chartOptions: {
        chart: {
          height: 350,
          type: 'bar',
          dropShadow: {
            enabled: true,
            color: '#000',
            top: 18,
            left: 7,
            blur: 10,
            opacity: 0.2
          },
          toolbar: {
            show: true
          }
        },
        dataLabels: {
          enabled: true,
        },
        stroke: {
          curve: 'smooth'
        },
        grid: {
          borderColor: '#e7e7e7',
          row: {
            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
            opacity: 0.5
          },
        },
        markers: {
          size: 1
        },
        xaxis: {
          categories: [],
          title: {
            text: this.$t('dashboard.screen.semester')
          }
        },
        yaxis: [],
        legend: {
          position: 'bottom',
          horizontalAlign: 'center',
          floating: false,
          offsetY: 5,
          offsetX: -5
        }
      },
      chartOptionsStacked: {
        chart: {
          type: 'bar',
          height: 350,
          stacked: true,
          toolbar: {
            show: true
          },
          zoom: {
            enabled: false
          }
        },
        colors: ['#62D65C', '#D09F37', '#E54949', '#D1CBC0'],
        responsive: [{
          breakpoint: 480,
          options: {
            legend: {
              position: 'bottom',
              offsetX: -10,
              offsetY: 0
            }
          }
        }],
        plotOptions: {
          bar: {
            horizontal: false,
            borderRadius: 10
          },
        },
        xaxis: {
          categories: [],
          title: {
            text: this.$t('dashboard.screen.semester')
          }
        },
        yaxis: {},
        legend: {
          position: 'bottom',
          horizontalAlign: 'left',
          floating: false,
          offsetY: 0,
          offsetX: -5
        },
        fill: {
          opacity: 1
        }
      },
    }
  },

}
</script>

<style scoped>
.legend {
  color: rgb(55, 61, 63);
  font-size: 12px;
  font-weight: 400;
  font-family: Helvetica, Arial, sans-serif;
}

.center {
  margin: auto;
  width: 75%;
}
</style>