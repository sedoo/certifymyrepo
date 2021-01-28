<i18n>
{
  "en": {
    "page.repositories" : "Repositories",
    "url.repository.button": "Repository website link",
    "create.button" : "Create a new repository",
    "repositories.type": "Repositories type",
    "delete.confirmation": "Do you really want to delete this repository and all the related reports? This operation cannot be undone.",
    "edit.repository.button": "Edit this repository",
    "view.reports.button": "View the reports",
    "repositories.type": "Repositories type",
    "radar.chart.title": "Requirements Radar Chart",
    "keywords": "Keywords"
  },
  "fr": {
    "page.repositories" : "Entrepôts",
    "url.repository.button": "Lien vers le site web de l'entrepôt",
    "create.button" : "Créer un nouvel entrepôt",
    "repositories.type": "Type d'entrepôt",
    "delete.confirmation": "Voulez vous vraiment supprimer cet entrepôt et toutes les fiches associées? Veuillez noter que cette opération est irréversible.",
    "edit.repository.button": "Editer cet entrepôt",
    "view.reports.button": "Consulter les fiches",
    "repositories.type": "Type d'entrepôt",
    "radar.chart.title": "Graphique radar des critères",
    "keywords": "Mots clefs"
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
    
<div class="text-right pa-2">
  <v-btn class="primary" :disabled="userEmail==null" @click="createRepository">{{ $t('create.button') }}</v-btn>
</div>  
  <v-card class="mx-auto" v-if="resultMyRepo != null && resultMyRepo.length > 0">
	<v-container fluid>
      <v-row>
        <v-col cols="4">
          <v-select id="selectRepoType"
            v-model="repoType"
            :items="repoTypes"
            :label="$t('repositories.type')"
            item-text="label"
            item-value="value"
            background-color="white"
          ></v-select>
        </v-col>
      </v-row>
	    <v-data-iterator 
	      :items=filtedRepoList
	      disable-pagination: true
        hide-default-footer
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
              <v-card-title v-bind:class="cssColorClass(item)">
                <v-tooltip bottom>
                  <template v-if="item.repository.url" v-slot:activator="{ on }">
                    <v-btn v-on="on" icon :href="checkedURL(item.repository.url)" target="_blank">
                      <v-icon size='20px'>fa-link</v-icon>
                    </v-btn>
                    </template>
                    <span>{{ $t('url.repository.button') }}</span>
                </v-tooltip> 
                <h3 class="repo-title">{{ item.repository.name }}</h3>
                <div class="icon-edit-delete">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn v-on="on" icon @click="routeToMyReports(item.repository)">
                        <v-icon size='20px'>mdi-file-multiple</v-icon>
                      </v-btn>
                     </template>
                     <span>{{ $t('view.reports.button') }}</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template v-if="!item.readonly" v-slot:activator="{ on }">
                      <v-btn v-on="on" icon @click="editRepository(item.repository)">     
                          <v-icon size='20px'>fa-edit</v-icon>    
                      </v-btn>
                      </template>
                      <span>{{ $t('edit.repository.button') }}</span>
                  </v-tooltip>              
                  <v-btn v-if="!item.readonly" icon @click="repositoryId = item.repository.id;dialog=true" >     
                      <v-icon size='20px'>fa-trash-alt</v-icon>    
                  </v-btn>
                </div>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text v-bind:class="cssColorClass(item)">
              <v-list v-bind:class="cssColorClass(item)">
                <v-list-item v-if="item.repository.keywords && item.repository.keywords.length > 0">
                  <v-list-item-content>{{$t('keywords')}}:</v-list-item-content>
                  <v-list-item-content>
                    <span v-for="(keyword, key) in item.repository.keywords" :key=key >{{ keyword }}</span>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>Contact:</v-list-item-content>
                  <v-list-item-content class="align-end">{{ item.repository.contact }}</v-list-item-content>
                </v-list-item>
              <v-list-group v-if="item.repository.description != null" sub-group no-action class="secondary--text">
                <template v-slot:activator>
                  <v-list-item-title>Description</v-list-item-title>
                </template>
                <v-textarea readonly :value="item.repository.description"></v-textarea>
              </v-list-group>
              <v-list-group v-show="item.health != null" sub-group no-action class="secondary--text">
                <template v-slot:activator>
                <v-list-item-title>{{ $t('radar.chart.title')}}</v-list-item-title>
                </template>
                <apexchart type=radar :options="chartOptions(item.health)" :series="levelList(item.health)" />
              </v-list-group>
              </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-data-iterator> 
  </v-container>
  </v-card>

  <v-dialog v-model="dialog" width="500">
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
      <v-btn color="primary" text @click="dialog = false">
        Cancel
      </v-btn>
      <v-btn color="primary" @click="dialog = false; deleteRepository()">
        Confirm
      </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <requestRepositoryAccess class="pt-10" :service="service"></requestRepositoryAccess>

  </div>
</template>


<script>
import requestRepositoryAccess from '../components/RequestRepositoryAccess.vue'

export default {
  components: {
      requestRepositoryAccess
  },
	props: {

  	},
    data() {
        return {
          items: {"en": [{"label":"All", "value": "All"}, {"label":"Standard", "value": "All"}, {"label":"Test", "value": "Test"}],
                "fr": [{"label":"Tous", "value": "All"}, {"label":"Standard", "value": "Standard"}, {"label":"Test", "value": "Test"}]},
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
      repoTypes: function() {
        return this.items[this.$store.getters.getLanguage]
      },
      userEmail: function()  {
        let email = null
        if(this.$store.getters.getUser != null) {
          email = this.$store.getters.getUser.profile.email
        }
        return email;
      },

      filtedRepoList: function() {
        let result = null
        if(this.repoType == 'All') {
          result = this.resultMyRepo
        } else {
          let repoStandard = []
          let repoTest = []
          for(var i=0; i<this.resultMyRepo.length; i++) {
            if(this.resultMyRepo[i].repository.isTest) {
              repoTest.push(this.resultMyRepo[i])
            } else {
              repoStandard.push(this.resultMyRepo[i])
            }
          }
          if(this.repoType == 'Standard') {
            result = repoStandard
          } else if(this.repoType == 'Test') {
            result = repoTest
          }
        }
        return result
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
        if(item.health) {
          if(item.health.green) {
            return 'light-green'
          } else if(item.health.orange) {
            return 'light-orange'
          } else if(item.health.red) {
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
                    .get(self.service+'/repository/v1_0/listAllFullRepository')
                    .then(response => {
                        self.resultMyRepo = response.data
                    })
            ).catch(function(error) {self.displayError("An error has occured:" + error)})
      },
      editRepository (item) {
        if(this.userEmail==null) {
          this.displayError('Please go to MY PROFILE to add your email before editing your repository')
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
          var option = {labels: null, title: {text: ''}, yaxis:{max: 4, forceNiceScale: true, tickAmount: 4}}
          if(health != null) {
            option.labels = health.requirementCodeList
          }
          return option
      },
      routeToMyReports(repository) {
        if(this.userEmail==null) {
          this.displayError('Please go to MY PROFILE to add your email before using your repository')
        } else {
          this.$store.commit('setRepository', repository)
          this.$router.push({path: '/certificationReports/' + repository.id })
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
    
    created: function() {
      // reset repository in the store
      this.$store.commit('setRepository', null)
      var self = this;
      this.axios.get(this.service+'/repository/v1_0/listAllFullRepository')
      .then(response => {
        self.resultMyRepo = response.data
        if(this.userEmail==null) {
          this.displayError('Please go to MY PROFILE to add your email before creating a repository')
        }
      }).catch(function(error) {self.displayError("An error has occured:" + error)})
      .finally(() => this.loading = false)
      }
} 
</script>

<style scoped>

.link-title {
  font-size: 1.5rem;
  font-weight: bold;
}

.icon-edit-delete {
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