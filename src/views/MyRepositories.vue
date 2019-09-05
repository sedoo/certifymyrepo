<template>
    <div class="repositories">
    
    <div style="background:red" v-if="errored">
    Une erreur est survenue
    </div>
    
    <h1 class="subheading grey--text">My repositories</h1>
    
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
              <v-card-title ><router-link tag="span" class="toto" to="/certificationReports"><h4>{{ item.name }}</h4></router-link></v-card-title>
              <v-divider></v-divider>
              <v-list dense>
                <v-list-item>
                  <v-list-item-content>Pôle:</v-list-item-content>
                  <v-list-item-content class="align-end">{{ item.pole}}</v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>Contact:</v-list-item-content>
                  <v-list-item-content class="align-end">{{ item.contact }}</v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>search id:</v-list-item-content>
                  <v-list-item-content class="align-end">{{ item.id }}</v-list-item-content>
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
        resultMyRepo: [],
        errored: false,
        loading: false
        }
    },
    
    created: function() {
    
    console.log("----->"+this.service)
    
      this.errored = false;
      this.axios
      .get(this.service+'repository/v1_0/listAll')
      .then(response => {
        this.resultMyRepo = response.data
      })
      .catch(error => {
        console.log(error)
        this.errored = true
      })
      .finally(() => this.loading = false)
      }
} 
</script>

<style scoped>

.toto {
	cursor: pointer
}

h1 {

}
</style>