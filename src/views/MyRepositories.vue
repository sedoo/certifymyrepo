<template>
    <div class="repositories">
    
    <div style="background:red" v-if="errored">
    Error: {{ errorMessage }}
    </div>
    
    <h1 class="subheading grey--text">My repositories</h1>
    
<div class="text-right pa-2">
  <v-btn color="primary" @click="createRepository">Create a new repository</v-btn>
</div>  
  <v-card class="mx-auto">
	<v-container fluid>
	    <v-data-iterator v-if="resultMyRepo != null && resultMyRepo.length > 0"
	      :items=resultMyRepo
	      disable-pagination: true
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
              <v-card-title v-bind:class="{ 'light-green': item.health != null && item.health.green, 'light-orange': item.health != null && item.health.orange, 'light-red': item.health != null && item.health.red }">
                <v-btn text class="link-title pa-0" @click="routeToMyReports(item.repository)">{{ item.repository.name }}</v-btn>
                <div class="icon-edit-delete">
                  <v-btn v-if="!item.readonly" icon class="mx-0" @click="editRepository(item.repository)">     
                      <v-icon size='20px'>fa-edit</v-icon>    
                  </v-btn> 

                  <v-dialog v-if="!item.readonly"
                      v-model="dialog"
                      width="500"
                      >
                  <template v-slot:activator="{ on }">
                      <v-btn icon class="mx-0" v-on="on" @click="repositoryId = item.repository.id" >     
                          <v-icon size='20px'>fa-trash-alt</v-icon>    
                      </v-btn>  
                  </template>

                  <v-card>
                      <v-card-title
                      class="headline grey lighten-2"
                      primary-title
                      >
                      Confirmation
                      </v-card-title>

                      <v-card-text>
                      Do you really want to delete this repository and all the related reports? This process cannot be undone.
                      </v-card-text>

                      <v-divider></v-divider>

                      <v-card-actions>
                      <div class="flex-grow-1"></div>
                      <v-btn
                          color="primary"
                          text
                          @click="dialog = false"
                      >
                          Cancel
                      </v-btn>
                      <v-btn
                          color="primary"
                          @click="dialog = false; deleteRepository()"
                      >
                          Confirm
                      </v-btn>
                      </v-card-actions>
                  </v-card>
                  </v-dialog>
                </div>
              </v-card-title>
              <v-divider></v-divider>
              <v-list dense v-bind:class="{ 'light-green': item.health != null && item.health.green, 'light-orange': item.health != null && item.health.orange, 'light-red': item.health != null && item.health.red }">
                <v-list-item>
                  <v-list-item-content>Keywords:</v-list-item-content>
                  <v-list-item-content class="align-end">
                    <span v-for="(keyword, key) in item.repository.keywords" :key=key >{{ keyword }}</span>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>Contact:</v-list-item-content>
                  <v-list-item-content class="align-end">{{ item.repository.contact }}</v-list-item-content>
                </v-list-item>
              <v-list-group sub-group no-action>
                <template v-slot:activator>
                  <v-list-item-content>
                    <v-list-item-title>Radar chart</v-list-item-title>
                  </v-list-item-content>
                </template>
                <apexchart v-show="item.health != null" type=radar :options="chartOptions(item.health)" :series="levelList(item.health)" />
              </v-list-group>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-data-iterator> 

  </v-container>
  </v-card>
    </div>
</template>


<script>
export default {

	props: {
    	service: null
  	},
    data() {
        return {
          dialog: false,
          repositoryId: null,
          resultMyRepo: [],
          errorMessage: null,
          errored: false,
          loading: false,
          emptyRepo: {id:null, name: null, keywords:[], contact: null, users: []},
          dataLabels: {
              enabled: true,
              enabledOnSeries: undefined,
              formatter: function (val) {
                  return val
              },
              textAnchor: 'middle',
              offsetX: 0,
              offsetY: 0,
              style: {
                  fontSize: '14px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  colors: ['#000']
              },
              dropShadow: {
                  enabled: false,
                  top: 1,
                  left: 1,
                  blur: 1,
                  opacity: 0.45
              }
    }
        }
    },

    methods: {
      createRepository() {
          this.$router.push({name: 'repository'});
      },
      deleteRepository () {
          this.errored = false
          var self = this;
          this.axios.delete(this.service+'repository/v1_0/delete/'+this.repositoryId)
            .then( response =>
                self.axios
                    .get(self.service+'repository/v1_0/listAllFullRepository')
                    .then(response => {
                        self.resultMyRepo = response.data
                    })
            )
            .catch(error => {
              self.errorMessage = error.message;
              self.errored = true
            })
      },
      editRepository (item) {
          this.$router.push({name: 'repository', query: {repositoryId: item.id}});
      },
      levelList (health) {
            var serie = {name: 'certificationReport', data: []}
            if(health != null) {
              serie.data = health.requirementLevelList
              console.log('Level list: '+JSON.stringify(serie.data))
            }
            return [serie];
        },
      chartOptions (health) {
          var option = {labels: null, title: {text: 'Requirements Radar Chart'}}
          if(health != null) {
            option.labels = health.requirementCodeList
            console.log('Code list: '+JSON.stringify(option.labels))
          }
          option.dataLabels = this.dataLabels
          return option
      },
      routeToMyReports(repository) {
        this.$store.commit('setRepository', repository)
        this.$router.push({path: '/certificationReports/' + repository.id })
      }
    },
    
    created: function() {
      // reset repository in the store
      this.$store.commit('setRepository', null)
      this.errored = false;
      var self = this;
      this.axios.get(this.service+'repository/v1_0/listAllFullRepository')
      .then(response => {
        self.resultMyRepo = response.data
      })
      .catch(error => {
        console.log('Error : '+error)
        self.errorMessage = error.message;
        self.errored = true
      })
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