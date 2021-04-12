<i18n src="../locales.json"></i18n>
<i18n>
{
  "en": {
    "page.repositories" : "Repositories",
    "create.button" : "Create a new repository",
    "delete.confirmation": "Do you really want to delete this repository and all the related reports? This operation cannot be undone.",
    "edit.repository.button": "Edit this repository",
    "view.reports.button": "View the reports",
    "radar.chart.title.valid": "Latest valid report chart",
    "radar.chart.title.inProgress": "Latest report in progress chart",
    "keywords": "Keywords",
    "required.email.error": "Please go to MY PROFILE to add your email before editing a repository",
    "role.field": "Role: "
  },
  "fr": {
    "page.repositories" : "Entrepôts",
    "create.button" : "Créer un nouvel entrepôt",
    "delete.confirmation": "Voulez vous vraiment supprimer cet entrepôt et toutes les fiches associées? Veuillez noter que cette opération est irréversible.",
    "edit.repository.button": "Editer cet entrepôt",
    "view.reports.button": "Consulter les fiches",
    "radar.chart.title.valid": "Dernière fiche validée",
    "radar.chart.title.inProgress": "Dernière fiche en cours",
    "keywords": "Mots clefs",
    "required.email.error": "Veuillez ajouter votre courriel dans votre profile avant d'éditer un entrepôt",
    "role.field": "Rôle: "
  }
}
</i18n>
<template>
    <div class="repositories">
    <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      {{ notifierMessage }}
      <v-btn dark text @click="notifier = false">Close</v-btn>
    </v-snackbar>
    
    <h1 class="grey--text">{{ $t('page.repositories') }}</h1>
    
<v-layout justify-end>
  <v-btn class="info my-3" :disabled="userEmail==null" @click="createRepository">{{ $t('create.button') }}</v-btn>
</v-layout>
  <v-card class="mx-auto" v-if="resultMyRepo != null && resultMyRepo.length > 0">
	    <v-data-iterator 
	      :items=resultMyRepo
	      disable-pagination: true
        hide-default-footer
        class="pa-5"
	    >
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
                      <span>{{ $t('url.repository.button') }}</span>
                  </v-tooltip> 
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn v-on="on" icon @click="routeToMyReports(item.repository)">
                        <v-icon>mdi-inbox-multiple-outline</v-icon>
                      </v-btn>
                     </template>
                     <span>{{ $t('view.reports.button') }}</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template v-if="!item.readonly" v-slot:activator="{ on }">
                      <v-btn v-on="on" icon @click="editRepository(item.repository)">     
                        <v-icon>mdi-pencil-outline</v-icon>    
                      </v-btn>
                      </template>
                      <span>{{ $t('edit.repository.button') }}</span>
                  </v-tooltip>              
                  <v-btn v-if="!item.readonly" icon @click="repositoryId = item.repository.id;dialog=true" >     
                      <v-icon>mdi-delete-forever-outline</v-icon>    
                  </v-btn>
                </div>
              </v-card-title>
              <v-card-text>
                <v-chip small>{{ getMyRoleMessage(item.repository) }}</v-chip>
                <div class="icons-right">
                </div>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-text>
              <v-list>
                <v-list-item v-if="item.repository.keywords && item.repository.keywords.length > 0">
                  <v-list-item-content>{{$t('keywords')}}:</v-list-item-content>
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
                <v-list-item-content>{{ $t('radar.chart.title.valid')}}</v-list-item-content>
                <v-icon :color="getHealthColor(item.healthLatestValidReport)">{{ getHealthIcon(item.healthLatestValidReport) }}</v-icon>
                </template>
                <apexchart type=radar :options="chartOptions(item.healthLatestValidReport)" :series="levelList(item.healthLatestValidReport)" />
              </v-list-group>
              <v-list-group v-show="item.healthLatestInProgressReport != null" sub-group no-action color="black--text">
                <template v-slot:activator>
                <v-list-item-content>{{ $t('radar.chart.title.inProgress')}}</v-list-item-content>
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
      Confirmation
      </v-card-title>
      <v-card-text>
      {{ $t('delete.confirmation')}}
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
</template>


<script>
import requestRepositoryAccess from '../components/RequestRepositoryAccess.vue'
import {displayError} from '../utils.js'
export default {
  components: {
      requestRepositoryAccess
  },
	props: {

  	},
    data() {
        return {
          dialog: false,
          repositoryId: null,
          resultMyRepo: [],
          // error and success notification vars
          timeout: 2000,
          notifier: false,
          notifierMessage: "",
          notifierColor: "success",
          //
          repoType: 'All',
          loading: false,
          emptyRepo: {id:null, name: null, keywords:[], contact: null, users: []},
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
          displayError(this, this.$t('required.email.error'))
        } else {
          this.$router.push({name: 'repository', query: {repositoryId: item.id}});
        }
      },
      levelList (health) {
            var serie = {name: 'certificationReport', data: []}
            if(health != null) {
              serie.data = health.requirementLevelList
            }
            return [serie];
        },
      chartOptions (health) {   
        let option = {labels: null, title: {text: ''}, yaxis:{max: 0, forceNiceScale: true, tickAmount: 0}}   
        if(health != null) {
          let levelsNumber = 0
          if(health.numberOfLevel) {
            levelsNumber = health.numberOfLevel
          }
          option.labels = health.requirementCodeList
          option.yaxis.min = 0
          option.yaxis.max = levelsNumber
          option.yaxis.tickAmount = levelsNumber
        }
        return option
      },
      routeToMyReports(repository) {
        if(this.userEmail==null) {
          displayError(this, this.$t('required.email.error'))
        } else {
          this.$store.commit('setRepository', repository)
          this.$router.push({path: '/certificationReports/' + repository.id })
        }
      },
      getMyRoleMessage(item) {
        let role = null
        if(item.users != null && item.users.length > 0) {
          for(let i=0 ; i<item.users.length ; i++) {
            if(this.userId == item.users[i].id) {
              role = this.$t('role.field') + this.$t(item.users[i].role)
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
      var self = this;
      this.axios.get(this.service+'/repository/v1_0/listAllFullRepositories')
      .then(response => {
        self.resultMyRepo = response.data
        if(this.userEmail==null) {
          displayError(this, this.$t('required.email.error'))
        }
      }).catch(function(error) {displayError(self, error)})
      .finally(() => this.loading = false)
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