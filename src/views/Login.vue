<template>
    <v-container class="fill-height" fluid>
   <v-row align="center" justify="center">
     <v-col cols="12" sm="12" md="12">
       <div v-if="!isLogged" class="headline text-center">
         You need to login using
         <v-btn class="mx-3 light-green lighten-5" @click="openORCID">
           <img
             style="vertical-align:middle;"
             src="https://orcid.org/sites/default/files/images/orcid_24x24.png"
             width="24"
             height="24"
           />
           <span class="px-2">Orcid</span>
         </v-btn>to use the application.
       </div>
       <div v-else class="text-center">
         <p class="headline">Wellcome {{ userName }} </p>
         </div>
     </v-col>
   </v-row>
 </v-container>
</template>


<script>

export default {
    data() {
        return {
        }
    },

    props: {
    	service: null
  	},

    methods: {
      openORCID: function(){
        console.log('this.redirectUri ->'+this.redirectUri)
        window.open("https://orcid.org/oauth/authorize?client_id=APP-E0UG85537RVITGE5&response_type=code&scope=/authenticate&redirect_uri=" + this.redirectUri, "_self");
      }
    },
    
    mounted: function() {
    	console.log("Monté")
    },
    
    created: function() {
    	console.log("Créé")
    },

    computed: {
      redirectUri: function() {
        return window.location.origin + window.location.pathname;
      },
      isLogged: function()  {
        return this.$store.getters.getLogged
      },
      userName: function()  {
        if(this.$store.getters.getUser != null) {
          return this.$store.getters.getUser.name
        } else {
          return '';
        }
      }
    }

} 
</script>