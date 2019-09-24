<template>
    <div class="repositories">
    
    <div style="background:red" v-if="errored">
    Error: {{ errorMessage }}
    </div>
    
    <h1 class="subheading grey--text">My repositories</h1>

  <template>
  <div class="text-center">

      <router-link tag="span" color="grey" class="link-title" :to="{name: 'repository', query: {repository: JSON.stringify(emptyRepo)}}">
          <v-icon size='20px' left>fa-plus</v-icon>
          <span style="font-weight: bold;">Create a new repository</span>
      </router-link>

  </div>
  </template>    
    
	<v-container fluid>
	    <v-data-iterator
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
                <router-link tag="div" class="link-title" v-bind:to="'/certificationReports/' + item.repository.id + '/' + item.repository.name "><h4>{{ item.repository.name }}</h4></router-link>
                <div class="icon-edit-delete">
                  <v-btn icon class="mx-0" @click="editRepository(item.repository)">     
                      <v-icon size='20px'>fa-edit</v-icon>    
                  </v-btn> 

                  <v-dialog
                      v-model="dialog"
                      width="500"
                      >
                  <template v-slot:activator="{ on }">
                      <v-btn icon class="mx-0" v-on="on" @click="repositoryId = item.repository.id">     
                          <v-icon size='20px'>fa-trash-alt</v-icon>    
                      </v-btn>  
                  </template>

                  <v-card>
                      <v-card-title
                      class="headline grey lighten-2"
                      primary-title
                      >
                      Are you sure?
                      </v-card-title>

                      <v-card-text>
                      Do you really want to delete these repository and all the related reports? This process cannot be undone.
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
                  <v-list-item-content>Department:</v-list-item-content>
                  <v-list-item-content class="align-end">{{ item.repository.pole}}</v-list-item-content>
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
          emptyRepo: {id:null, name: null, pole: null, contact: null, managerIds: []},
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
      deleteRepository () {
          this.axios.delete(this.service+'repository/v1_0/delete/'+this.repositoryId)
            .then( () =>
                this.axios
                    .get(this.service+'repository/v1_0/listAllFullRepository')
                    .then(response => {
                        this.resultMyRepo = response.data
                    })
            )
            .catch(error => {
                console.log(error)
            })
      },
      editRepository (item) {
          this.$router.push({name: 'repository', query: { repository: JSON.stringify(item)} });
      },
      levelList (health) {
            var serie = {name: 'certificationReport', data: []}
            if(health != null) {
              serie.data = health.requirementLevelList
            }
            
            return [serie];
        },
      chartOptions (health) {
          var option = {labels: null, title: {text: 'Requirements Radar Chart'}}  
          if(health != null) {
            option.labels = health.requirementCodeList
          }
          option.dataLabels = this.dataLabels
          return option
      }     
    },
    
    created: function() {
    console.log('created MyRepositories.vue')
    console.log("----->"+this.service)
    
      this.errored = false;
      this.axios.get(this.service+'repository/v1_0/listAllFullRepository')
      .then(response => {
        console.log('Response : '+JSON.stringify(response))
        this.resultMyRepo = response.data
      })
      .catch(error => {
        console.log('Error : '+error)
        this.errorMessage = error.message;
        this.errored = true
      })
      .finally(() => this.loading = false)
      }
} 
</script>

<style scoped>

.link-title {
	cursor: pointer
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