<template>
    <div class="repositories">
    <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      {{ notifierMessage }}
      <v-btn dark text @click="notifier = false">Close</v-btn>
    </v-snackbar>
    
    <h1 class="grey--text">{{ $t('repositories.screen.title') }}</h1>
    
    <v-progress-linear indeterminate v-if="loadingReports" class="mt-3"></v-progress-linear>
    <div v-else>
      <v-layout justify-end>
        <v-btn class="info my-3" :disabled="userEmail==null" @click="createRepository">{{ $t('repositories.screen.button.create.new.repository') }}</v-btn>
      </v-layout>
      <v-card class="mx-auto" v-if="resultMyRepo != null && resultMyRepo.length > 0">
          <v-data-iterator 
            :items=resultMyRepo
            disable-pagination: true
            hide-default-footer
            :search="search"
            :sort-by="sortBy.toLowerCase()"
            class="pa-5"
          >
          <template v-slot:header>
            <v-toolbar
              class="mb-1"
              flat 
            >
            <v-row>
              <v-col
                cols="12"
                sm="12"
                md="6"
                lg="4"
              >
                <v-text-field
                  v-model="search"
                  clearable
                  flat outlined dense
                  hide-details
                  prepend-inner-icon="mdi-magnify"
                  label="Search"
                ></v-text-field>
              </v-col>
            </v-row>
            </v-toolbar>
          </template>
          <template v-slot:default="props">
            <v-row>
              <v-col
                v-for="item in props.items"
                :key="item.repository.name"
                cols="12"
                sm="12"
                md="6"
                lg="4"
              >
                <v-card>
                  <v-card-title>
                    <h3 class="repo-title">{{ item.repository.name }}</h3>
                    <div class="icons-right">
                      <v-tooltip bottom>
                        <template v-if="item.repository.url" v-slot:activator="{ on }">
                          <v-btn v-on="on" icon :href="checkedURL(item.repository.url)" target="_blank">
                            <v-icon>mdi-link</v-icon>
                          </v-btn>
                          </template>
                          <span>{{ $t('repository.button.help.message.link') }}</span>
                      </v-tooltip> 
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                          <v-btn v-on="on" icon @click="routeToMyReports(item.repository)">
                            <v-icon>mdi-inbox-multiple-outline</v-icon>
                          </v-btn>
                        </template>
                        <span>{{ $t('repositories.screen.button.help.message.view') }}</span>
                      </v-tooltip>
                      <v-tooltip bottom>
                        <template v-if="!item.readonly" v-slot:activator="{ on }">
                          <v-btn v-on="on" icon @click="editRepository(item.repository)">     
                            <v-icon>mdi-pencil-outline</v-icon>    
                          </v-btn>
                          </template>
                          <span>{{ $t('repositories.screen.button.help.message.edit') }}</span>
                      </v-tooltip>              
                      <v-btn v-if="!item.readonly" icon @click="repositoryId = item.repository.id;dialog=true" >     
                          <v-icon>mdi-delete-forever-outline</v-icon>    
                      </v-btn>
                    </div>
                  </v-card-title>
                  <v-card-text>
                    <v-chip v-show="item.repository.displayRole" small>{{ getMyRoleMessage(item.repository) }}</v-chip>
                  </v-card-text>
                  <v-divider></v-divider>
                  <v-card-text>
                  <v-list>
                    <v-list-item>
                      <v-list-item-content>{{ $t('repositories.screen.label.affiliation') }}:</v-list-item-content>
                      <v-list-item-content class="align-end">{{ formatAffiliation(item.repository.affiliation).text }}</v-list-item-content>
                    </v-list-item>
                    <v-list-item v-if="item.repository.keywords && item.repository.keywords.length > 0">
                      <v-list-item-content>{{ $t('repositories.screen.label.keywords') }}:</v-list-item-content>
                      <v-list-item-content>
                      <v-chip-group active-class="primary--text" column>
                        <v-chip small v-for="(keyword, key) in item.repository.keywords" :key=key >{{ keyword }}</v-chip>
                      </v-chip-group>
                      </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-content>Contact:</v-list-item-content>
                      <v-list-item-content class="align-end">{{ item.repository.contact }}</v-list-item-content>
                    </v-list-item>
                  <v-list-group v-if="item.repository.description != null" sub-group no-action color="black--text">
                    <template v-slot:activator>
                      <v-list-item-content>Description</v-list-item-content>
                    </template>
                    <div class="ma-5">{{ item.repository.description }}</div>
                  </v-list-group>
                  <v-list-group v-show="item.healthLatestValidReport != null" sub-group no-action color="black--text">
                    <template v-slot:activator>
                    <v-list-item-content>{{ $t('repositories.screen.radar.chart.title.valid')}}</v-list-item-content>
                    <v-icon :color="getHealthColor(item.healthLatestValidReport)">{{ getHealthIcon(item.healthLatestValidReport) }}</v-icon>
                    </template>
                    <apexchart type=radar :options="chartOptions(item.healthLatestValidReport)" :series="levelList(item.healthLatestValidReport)" />
                  </v-list-group>
                  <v-list-group v-show="item.healthLatestInProgressReport != null" sub-group no-action color="black--text">
                    <template v-slot:activator>
                    <v-list-item-content>{{ $t('repositories.screen.radar.chart.title.inProgress')}}</v-list-item-content>
                    <v-icon :color="getHealthColor(item.healthLatestInProgressReport)">{{ getHealthIcon(item.healthLatestInProgressReport) }}</v-icon>
                    </template>
                    <apexchart type=radar :options="chartOptions(item.healthLatestInProgressReport)" :series="levelList(item.healthLatestInProgressReport)" />
                  </v-list-group>
                  </v-list>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </template>
        </v-data-iterator>
      </v-card>

      <v-dialog v-model="dialog" :width="$store.getters.getDialogWidth">
        <v-card>
          <v-card-title class="headline grey lighten-2" primary-title>
          {{ $t('repositories.screen.delete.repository.confirmation.title')}}
          </v-card-title>
          <v-card-text>
          {{ $t('repositories.screen.delete.repository.confirmation.message')}}
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn @click="dialog = false">
            {{ $t('button.cancel')}}
          </v-btn>
          <v-btn color="info" @click="dialog = false; deleteRepository()">
            {{ $t('button.confirm')}}
          </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <requestRepositoryAccess class="pt-10" :service="service"></requestRepositoryAccess>
    </div>
  </div>
</template>


<script>
import requestRepositoryAccess from '../components/RequestRepositoryAccess.vue'
import {displayError} from '../utils.js'
import formattedAffiliationMixin from "../mixins/formattedAffiliationMixin";
export default {
  mixins: [formattedAffiliationMixin],
  components: {
      requestRepositoryAccess
  },
	props: {

  	},
    data() {
        return {
          dialog: false,
          loadingReports: false,
          repositoryId: null,
          resultMyRepo: [],
          // error and success notification vars
          timeout: 2000,
          notifier: false,
          notifierMessage: "",
          notifierColor: "success",
          emptyRepo: {id:null, name: null, keywords:[], contact: null, users: []},
          search: null,
          sortBy: 'name',
        }
    },

    computed: {
      userEmail: function()  {
        let email = null
        if(this.$store.getters.getUser != null) {
          email = this.$store.getters.getUser.profile.email
        }
        return email;
      },
      userId: function()  {
        let userId = null
        if(this.$store.getters.getUser != null) {
          userId = this.$store.getters.getUser.profile.id
        }
        return userId;
      },
      service: function()  {
        return this.$store.getters.getService
      },
    },

    methods: {
      checkedURL(url) {
        if(url.startsWith('//') || url.startsWith('https://') || url.startsWith('http://') ) {
          return url
        } else {
          return "//" + url
        }
      },
      cssColorClass(item) {
        let health = null
        if(item.healthLatestValidReport != null && item.healthLatestInProgressReport != null) {
          if(item.healthLatestValidReport.lastUpdateDate > item.healthLatestInProgressReport.lastUpdateDate) {
            health = item.healthLatestValidReport
          } else {
            health = item.healthLatestInProgressReport
          }
        } else if(item.healthLatestValidReport == null && item.healthLatestInProgressReport != null) {
          health = item.healthLatestInProgressReport
        } else if(item.healthLatestValidReport != null && item.healthLatestInProgressReport == null) {
          health = item.healthLatestValidReport
        }
        if(health) {
          if(health.green) {
            return 'light-green'
          } else if(health.orange) {
            return 'light-orange'
          } else if(health.red) {
            return 'light-red'
          } else {
            return ''
          }
        } else {
          return ''
        }

      },
      createRepository() {
          this.$router.push({name: 'repository'});
      },
      deleteRepository () {
          var self = this;
          this.axios.delete(this.service+'/repository/v1_0/delete/'+this.repositoryId)
            .then( response =>
                self.axios
                    .get(self.service+'/repository/v1_0/listAllFullRepositories')
                    .then(response => {
                        self.resultMyRepo = response.data
                    })
            ).catch(function(error) {displayError(self, error)})
      },
      editRepository (item) {
        if(this.userEmail==null) {
          displayError(this, this.$t('repository.screen.required.email.error'))
        } else {
          this.$router.push({name: 'repository', query: {repositoryId: item.id}});
        }
      },

      levelList (health) {
        let serie = {name: 'certificationReport', data: []}
        if(health != null) {
        let array = [];
        for (var j = 0; j < health.latestReport.items.length; j++){
          let r = health.latestReport.items[j]
          if(r.levelActive) {
              if(r.levelCode) {
                  array.push(r.levelCode)
              } else {
                  array.push(null)
              }
          }
        }
        serie.data = array
        }
        return [serie];
      },

      chartOptions (health) {   
        console.log(health)
        let title = ''
        if(health && health.latestReport && health.latestReport.templateName) {
          title = health.latestReport.templateName
        }
        let option = {labels: null, title: {text: title}, yaxis:{max: 0, forceNiceScale: true, tickAmount: 0}}   
        if(health != null) {
          let levelsNumber = 0
          if(health.latestReport && health.latestReport.levelMaxValue) {
            levelsNumber = health.latestReport.levelMaxValue
          }
          option.labels = health.requirementCodeList
          option.yaxis.min = 0
          option.yaxis.max = levelsNumber
          option.yaxis.tickAmount = levelsNumber

          let array = [];
          for (let j = 0; j < health.latestReport.items.length; j++){
              let r = health.latestReport.items[j]
              if(r.code && r.levelActive) {
                  array.push(r.code)
              }
          }
          option.labels = array
        }
        return option
      },
      routeToMyReports(repository) {
        if(this.userEmail==null) {
          displayError(this, this.$t('repository.screen.required.email.error'))
        } else {
          this.$store.commit('setRepository', repository)
          this.$router.push({path: '/certificationReports/' + repository.id })
        }
      },
      getMyRoleMessage(item) {
        item.displayRole = false
        let role = null
        if(item.users != null && item.users.length > 0) {
          for(let i=0 ; i<item.users.length ; i++) {
            if(this.userId == item.users[i].id) {
              role = this.$t('repository.screen.label.repository.role') + ': ' + this.$t(item.users[i].role)
              item.displayRole = true
              break
            }
          }
        }
        return role
      },
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
    },
    
    created: function() {
      this.$i18n.locale = this.$store.getters.getLanguage;
      // reset repository in the store
      this.$store.commit('setRepository', null)
      this.loadingReports = true
      var self = this;
      this.axios.get(this.service+'/repository/v1_0/listAllFullRepositories')
      .then(response => {
        self.resultMyRepo = response.data
        console.log(self.resultMyRepo )
        if(this.userEmail==null) {
          displayError(this, this.$t('repository.screen.required.email.error'))
        }
      }).catch(function(error) {displayError(self, error)})
      .finally(() => this.loadingReports = false)
      }
} 
</script>

<style scoped>

.link-title {
  font-size: 1.5rem;
  font-weight: bold;
}

.icons-right{
  position: absolute;
  right: 0;
  margin-right: 5px
}

.repo-title {
  color: rgba(0, 0, 0, 0.54);
  margin-left: 13px;
}

.light-green {
  background-color: #A5D6A7;
}
.light-orange {
  background-color: #ffcc80;
}
.light-red {
  background-color: #EF9A9A;
}

</style>