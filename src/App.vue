<template>
 <v-app class="grey lighten-4">
  <certifymyrepo-token-refresher :service="service"></certifymyrepo-token-refresher>

  <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      {{ notifierMessage }}
    <v-btn dark text @click="notifier = false">Close</v-btn>
   </v-snackbar>

  <div>
    <v-toolbar color="#f7941e" dark >
      <v-toolbar-title class="text-uppercase" >
        <span class="font-weight-light">Crusöe</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <v-toolbar-items  >
        <v-btn v-for="(link, i) in links"
            :key="i" router :to="link.route"
            flat color="#f7941e" dark
            >{{ link.label }}</v-btn>
        <v-btn color="#f7941e" dark to="/login">     
          <span v-if="!isLogged">LOGIN</span>
          <span v-else>LOGOUT</span>
        </v-btn>
      </v-toolbar-items>

    </v-toolbar>

    <v-content class="mx-4 mb-4 my-2">
        <router-view></router-view>            
    </v-content>

  </div>
</v-app>
</template>

<script>


export default {
  name: 'App',
  components: {
  },
    props: {
    	service: null
  	},
  data: () => ({
    profile: null,
    errored: false,
    drawer : false,
    link: null,
    links : [{label:"My repositories", route: '/repositories', icon: 'fa-archive'},{label:"My Profile", route: "/profile", icon: 'fa-user'}],
    // error and success notification vars
    timeout: 2000,
    notifier: false,
    notifierMessage: "",
    notifierColor: "success",
  }),

  computed: {
    redirectUri: function() {
      return window.location.origin + window.location.pathname;
    },
    isLogged: function()  {
      return this.$store.getters.getLogged
    }
  },


  created: function() {
  console.log("App created logged: "+this.isLogged)
   if (!this.isLogged) {
     var code = this.getCodeParameter();
     if (code) {
        var self = this;
        this.axios({
            method: 'post',
            url: this.service+"login/v1_0/orcid?code=" + code + "&redirect_uri=" + this.redirectUri
        }).then( function (response) {
            self.$store.commit('setUser', response.data)
            self.$store.commit('setLogged', true)
            if(response.data.profile.email != null) {
              self.$router.push({path: '/repositories'})
            } else {
              self.$router.push({path: '/profile'})
            }
          }).catch(function(error) {self.displayError("An error has occured:" + error)})
      }
   }
 },
    methods: {

      getCodeParameter: function (){
        return this.getURLParameter("code");
      },

      getURLParameter: function (sParam){
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++){
          var sParameterName = sURLVariables[i].split('=');
          if (sParameterName[0] == sParam) {
            return decodeURIComponent(sParameterName[1]);
          }
        }
        return null;
      },

      toggleDrawer: function() {
        this.drawer = !this.drawer
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
  }
};
</script>

