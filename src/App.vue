<i18n>
{
  "en": {
    "login": "Login",
    "logout": "Logout (currently logged as : '{msg}')",
    "page.repositories" : "Repositories",
    "page.information" : "User information",
    "page.dashboard" : "Dashboard",
    "page.administration" : "Administration"
  },
  "fr": {
    "login": "Connexion",
    "logout": "Déconnexion (vous êtes connecté en tant que : '{msg}'",
    "page.repositories" : "Entrepôts",
    "page.information" : "Information utilisateur",
    "page.dashboard" : "Tableau de bord",
    "page.administration" : "Administration"
  }
}
</i18n>
<template>
 <v-app class="grey lighten-4">
  <certifymyrepo-token-refresher :service="service"></certifymyrepo-token-refresher>

  <v-snackbar v-model="notifier" top :color="notifierColor" :timeout="timeout">
      {{ notifierMessage }}
    <v-btn dark text @click="notifier = false">Close</v-btn>
   </v-snackbar>
    <v-toolbar color="secondary" v-if="type!='external'">
      <v-toolbar-title class="text-uppercase" >
        <span class="font-weight-light">Crusöe</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <v-toolbar-items  >
          <v-btn v-for="(link, i) in links"
            :key="i" router :to="link.route" :title="$t(link.label)"
            color="secondary"
            >
            <v-icon class="standard-icon">{{ link.icon }}</v-icon>
          </v-btn>
          <v-btn text @click="login" v-if="!isLogged" title="Login">
            <v-icon class="standard-icon">mdi-application-import</v-icon>
          </v-btn>
          <v-btn
            text
            @click="logoutFromORCID"
            v-if="isLogged"
            :title="$t('logout', {msg: userName})"
          >
            <v-icon class="standard-icon">mdi-application-export</v-icon>
          </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-content class="ma-3">
      <router-view @login="login"></router-view>
    </v-content>
  
</v-app>
</template>

<script>

import {logOut} from './utils.js'
export default {
  name: 'App',
  components: {
  },
  props: {
    service: {
      type: String,
      default: "http://localhost:8485"
    },
    language: {
      type: String,
      default: "fr"
    },
    type: {
      Type: String,
      default: "external"
    },
    externalselector: {
      Type: String,
      default: "header.entry-header"
    }
  },
  data: () => ({
    profile: null,
    errored: false,
    drawer : false,
    link: null,
    links : [],
    linkRepositories: {label:"page.repositories", route: '/repositories', icon: 'mdi-archive'},
    linkUserInformation: {label:"page.information", route: "/information", icon: 'mdi-account-details-outline'},
    linkDashoard: {label:"page.dashboard", route: '/dashboard', icon: 'mdi-view-dashboard'},
    linkAdministration: {label:"page.administration", route: '/administration', icon: 'mdi-cogs' },
    // error and success notification vars
    timeout: 2000,
    notifier: false,
    notifierMessage: "",
    notifierColor: "success",
    // Add extra listenner on production mode
    listenersSet: false,
  }),

  computed: {
    redirectUri: function() {
      return window.location.origin + window.location.pathname;
    },
    isLogged: function()  {
      return this.$store.getters.getLogged
    },
    userIsAdmin: function()  {
      let isadmin
      if(this.$store.getters.getUser != null) {
        isadmin = this.$store.getters.getUser.admin
      } 
      return isadmin;
    },
    userIsSuperAdmin: function()  {
      let isSuperAdmin
      if(this.$store.getters.getUser != null) {
        isSuperAdmin = this.$store.getters.getUser.superAdmin
      } 
      return isSuperAdmin;
    },
    userName: function()  {
      if(this.$store.getters.getUser != null) {
        return this.$store.getters.getUser.profile.name
      } else {
        return '';
      }
    },
  },

  watch: {
    filteredLinks: function () {
      this.updateToolbar();
    },
    $route (){
        this.updateToolbar();
    }
  },

  created: function() {
    this.$i18n.locale = this.language;
    this.$store.commit('setLanguage', this.language)
    this.$store.commit('setService', this.service)
    this.links = []
    if (this.isLogged) {
        this.links.push(this.linkRepositories)
        this.links.push(this.linkUserInformation)
        if(this.userIsAdmin || this.userIsSuperAdmin) {
          this.links.push(this.linkDashoard)
          this.links.push(this.linkAdministration)
        }
    }
    var code = this.getCodeParameter();
    if (code) {
    var self = this;
    this.axios({
        method: 'post',
        url: this.service+"/login/v1_0/orcid?code=" + code + "&redirect_uri=" + this.redirectUri
    }).then( function (response) {
        self.links.push(self.linkRepositories)
        self.links.push(self.linkUserInformation)
        self.$store.commit('setUser', response.data)
        self.$store.commit('setLogged', true)
        if(self.userIsAdmin || self.userIsSuperAdmin) {
          self.links.push(self.linkDashoard)
          self.links.push(self.linkAdministration)
        }
        if(response.data.profile.email != null) {
          self.$router.push({path: '/repositories'})
        } else {
          self.$router.push({path: '/profile'})
        }
      }).catch(function(error) {self.displayError("An error has occured:" + error)})
      this.$router.push("/logging").catch(() => {});
  } else {
    this.logoutFromORCID()
  }
 },

  mounted: function() {
    let aux = document.querySelector(this.externalselector);
    if (aux) {
      let text = aux.innerText;
      console.log(text)
      aux.innerHTML = '<section class="toolbar-parent"><h1 class="entry-title">'+text+'</h1><div class="toolbar-fill-remaining-space"></div><div class="external-toolbar"></div></section>'
      this.updateToolbar();
      this.setExternalListeners();
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

      login: function() {
        this.$router.push("/logging").catch(() => {});
        window.open(
          "https://orcid.org/oauth/authorize?client_id=APP-E0UG85537RVITGE5&response_type=code&scope=/authenticate&redirect_uri=" +
            this.redirectUri,
          "_self"
        );
      },

      logoutFromORCID: function() {
        logOut(this.$store)
        this.links = []
        this.$router.push("/").catch(() => {});
      },

      /**
       * Update toolbar on production mode
       */
      updateToolbar() {
        let prefix='external-toolbar-button'
        if (this.type=='external') {
        let toolbar = document.querySelector("div.external-toolbar")
        if (toolbar) {
          let content ="<span style='font-size: 1.5rem;'>";
          for (let i=0; i < this.links.length; i++) {
            let routeclass="";
            let link = this.links[i]
            if (this.$route.name == link.route) {
              routeclass="active"
            }
          if (i==0) {
            content += '<i route="'+link.route+'" id="'+prefix+'-'+i+'"  class="'+routeclass+' toolbar-button mdi '+link.icon+'" title="'+this.$t(link.label)+'"></i>'
          } else {
            content += '<i route="'+link.route+'" id="'+prefix+'-'+i+'" style="border-left: 1px solid #555;" class="'+routeclass+' toolbar-button mdi '+link.icon+'" title="'+this.$t(link.label)+'"></i>'
          }
            
          }
          if (this.isLogged) {
            content += '<i route="logout" id="'+prefix+'-logout" style="color:#fb8c00" class="toolbar-button mdi mdi-application-export" title="'+this.$t('logout', {msg: this.userName})+'"></i>'
          } else {
            content += '<i route="login" id="'+prefix+'-login" style="color:#fb8c00" class="toolbar-button mdi mdi-application-import" title="'+this.$t('login')+'"></i>'
          }

          content +="</span>"
          toolbar.innerHTML = content;
        }
        }
      },

      /**
       * Add extra listenner on production mode
       */
      setExternalListeners() {
        if (this.listenersSet) {
          return;
        }
        var self = this
        document.addEventListener('click',function(e){
        if(e.target && e.target.id.startsWith('external-toolbar-button')){
          let route = e.target.getAttribute("route");
        if (route == "login") {
          self.login();
          return;
        }

        if (route == "logout") {
          self.logoutFromORCID();
          return;
        } else {
          self.navigate(route)
        }
        
        }
        })
      this.listenersSet=true;
      },

      navigate(route) {
        this.$router.push(route).catch( () => {})
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

<style>

.toolbar-button {
  padding-left: 10px;
  padding-right: 10px; 
  cursor:pointer;
  font-weight: 300;
}

.toolbar-button.active {
  color: var(--theme-color)
}

.toolbar-fill-remaining-space {
  flex: auto;
}

.toolbar-parent {
    display: flex;
    overflow: hidden;
    align-items: flex-start;
}

div.v-application.white {
  background: #ffffff;
}

.v-application .v-toolbar {
  flex: initial;
}

.v-application .container {
  display: initial !important;
}

/* header.v-toolbar.mytheme {
  background-color: #f5f5f5;
  color: #555;
  border-bottom: 1px solid #eee;
  border-top: 2px solid #ddd;
} */

.standard-icon {
  color: #555 !important;
}

.toolbar-title {
  font-size: 1.3 rem;
  margin: 10px 0px;
}
</style>

