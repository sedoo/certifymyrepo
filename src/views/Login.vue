<i18n>
{
  "en": {
    "login.message.beginning": "You need to login using",
    "login.message.end": "to use the application."
  },
  "fr": {
    "login.message.beginning": "Vous devez utiliser",
    "login.message.end": "pour accéder à l'application."
  }
}
</i18n>
<template>
    <v-container class="fill-height" fluid>
   <v-row align="center" justify="center">
     <v-col cols="12" sm="12" md="12">
       <div v-if="!isLogged" class="headline text-center">
         {{ $t('login.message.beginning') }}
         <v-btn class="mx-3 light-green lighten-5" @click="openORCID">
           <img
             style="vertical-align:middle;"
             src="https://orcid.org/assets/vectors/orcid.logo.icon.svg"
             width="24"
             height="24"
           />
           <span class="px-2">Orcid</span>
         </v-btn>{{ $t('login.message.end') }}
       </div>
       <div v-else class="text-center">
         <span class="headline">Welcome {{ userName }} </span><br>
         <span> 
         <v-btn class="mx-3 light-green lighten-5" @click="logoutFromORCID">
           <img
             style="vertical-align:middle;"
             src="https://orcid.org/assets/vectors/orcid.logo.icon.svg"
             width="24"
             height="24"
           />
           <span class="px-2">Logout</span>
         </v-btn>
         </span>
         </div>
     </v-col>
   </v-row>
 </v-container>
</template>


<script>
import {logOut} from '../utils.js'
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
      },
      logoutFromORCID: function() {
        logOut(this.$store)
      }
    },
    
    mounted: function() {
    	console.log("Monté")
    },
    
    created: function() {
    	this.$i18n.locale = this.$store.getters.getLanguage
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
          return this.$store.getters.getUser.profile.name
        } else {
          return '';
        }
      }
    }

} 
</script>