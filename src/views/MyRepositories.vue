<template>
    <div class="repositories">
    
    <div style="background:red" v-if="errored">
    Error: {{ errorMessage }}
    </div>
    
    <h1 class="subheading grey--text">My repositories</h1>

  <template>
  <div class="text-center">

      <router-link tag="icon" color="grey" class="link-title" :to="{name: 'repository', query: {repository: JSON.stringify(emptyRepo)}}">
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
            :key="item.name"
            cols="12"
            sm="6"
            md="4"
            lg="6"
          >
            <v-card>
              <v-card-title >
                <router-link tag="div" class="link-title" v-bind:to="'/certificationReports/' + item.id + '/' + item.name "><h4>{{ item.name }}</h4></router-link>
                <div class="icon-edit-delete">
                  <v-btn icon class="mx-0" @click="editRepository(item)">     
                      <v-icon size='20px'>fa-edit</v-icon>    
                  </v-btn> 

                  <v-dialog
                      v-model="dialog"
                      width="500"
                      >
                  <template v-slot:activator="{ on }">
                      <v-btn icon class="mx-0" v-on="on" @click="repositoryId = item.id">     
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
              <v-list dense>
                <v-list-item>
                  <v-list-item-content>Department:</v-list-item-content>
                  <v-list-item-content class="align-end">{{ item.pole}}</v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>Contact:</v-list-item-content>
                  <v-list-item-content class="align-end">{{ item.contact }}</v-list-item-content>
                </v-list-item>
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
          emptyRepo: {id:null, name: null, pole: null, contact: null, managerIds: []}
        }
    },

    methods: {
      deleteRepository () {
          this.axios.delete(this.service+'repository/v1_0/delete/'+this.repositoryId)
            .then( () =>
                this.axios
                    .get(this.service+'repository/v1_0/listAll')
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
    },
    
    created: function() {
    console.log('created MyRepositories.vue')
    console.log("----->"+this.service)
    
      this.errored = false;
      this.axios.get(this.service+'repository/v1_0/listAll')
      .then(response => {
        this.resultMyRepo = response.data
      })
      .catch(error => {
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
</style>