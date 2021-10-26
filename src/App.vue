<template>
 <v-app class="grey lighten-4">
  <certifymyrepo-token-refresher :service="service"></certifymyrepo-token-refresher>

    <unidoo-alert></unidoo-alert>
    <unidoo-confirm-dialog />

    <v-app-bar-nav-icon v-if="type!='external' || $vuetify.breakpoint.mobile" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-navigation-drawer
      v-model="drawer"
      absolute
      temporary
    >
      <v-list
        nav
        dense
      >
        <v-list-item-group
          v-model="group"
          active-class="deep-purple--text text--accent-4"
        >
          <v-list-item v-for="(link, i) in links"
            :key="i" router :to="link.route"
            color="secondary"
            >
            <v-list-item-icon><v-icon>{{ link.icon }}</v-icon></v-list-item-icon>
            <v-list-item-title>{{ $t(link.label) }}</v-list-item-title>
          </v-list-item>

          <v-list-item :href="helpUrl" target="_blank" v-if="isLogged">
            <v-list-item-icon><v-icon>mdi-help-circle</v-icon></v-list-item-icon>
            <v-list-item-title>{{ $t('page.help') }}</v-list-item-title>
          </v-list-item>
          <v-list-item :href="docUrl" target="_blank" v-if="isLogged">
            <v-list-item-icon><v-icon>mdi-information-outline</v-icon></v-list-item-icon>
            <v-list-item-title>{{ $t('page.documentation') }}</v-list-item-title>
          </v-list-item>

          <v-list-item @click="login" v-if="!isLogged">
            <v-list-item-icon><v-icon>mdi-application-import</v-icon></v-list-item-icon>
            <v-list-item-title>{{ $t('login') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="logoutFromORCID" v-if="isLogged">
            <v-list-item-icon><v-icon>mdi-application-export</v-icon></v-list-item-icon>
            <v-list-item-title class="text-wrap">{{ $t('logout', {msg: userName}) }}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>


    <v-main class="ma-3">
      <router-view @login="login"></router-view>
    </v-main>
</v-app>
</template>

<script>
import {logOut} from './utils.js'
export default {
  name: 'App',
  props: {
    service: {
      type: String,
      default: "http://localhost:8485"
    },
    frontEndUrl: {
      type: String,
      default: "https://coso-preprod.sedoo.fr"
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
    },
    renater: {
      Type: Boolean,
      default: false
    },
    devEnv: {
      Type: Boolean,
      default: false
    }
  },
  data: () => ({
    profile: null,
    errored: false,
    drawer : false,
    group: null,
    link: null,
    links : [],
    linkRepositories: {label:"page.repositories", route: '/repositories', icon: 'mdi-archive'},
    linkUserInformation: {label:"page.information", route: "/information", icon: 'mdi-account-details-outline'},
    linkDashoard: {label:"page.dashboard", route: '/dashboard', icon: 'mdi-view-dashboard'},
    linkAdministration: {label:"page.administration", route: '/administration', icon: 'mdi-cogs' },
    linkContact: {label:"page.contact", route: '/contact', icon: 'mdi-email' },
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
    helpUrl: function() {
      if(this.language == 'fr') {
        return this.frontEndUrl+'/faq/'
      } else {
        return this.frontEndUrl+'/en/faq-2/'
      }
    },
    docUrl: function() {
      if(this.language == 'fr') {
        return this.frontEndUrl+'/documentation/'
      } else {
        return this.frontEndUrl+'/en/documentation-2/'
      }
    }
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
    this.$store.commit('setRenater', this.renater)
    this.links = []
    let token = this.getTokenParameter()
    if( token != null) {
      let user = {token: token, profile: {name: 'Robot'}}
      this.$store.commit('setUser', user)
    } else {
      if(this.devEnv) {
        this.links.push(this.linkContact)
      }
      if (this.isLogged) {
          this.links.push(this.linkRepositories)
          this.links.push(this.linkUserInformation)
          if(this.userIsAdmin || this.userIsSuperAdmin) {
            this.links.push(this.linkDashoard)
            this.links.push(this.linkAdministration)
          }
          // To deal with the case: 
          // 1/ One logged user click on another Wordpress menu and leave The VueJS App
          // 2/ He comes back on the VueJS App. He is still logged in
          //  then path is equal to "/", router redirect to "/notlogged" by default
          //  The app has to redirect to the main page
          if(this.$route.fullPath == '/notlogged') {
            this.$router.push({path: '/repositories'})
          }
      } else {
        var code = this.getCodeParameter();
        if (code) {
          var self = this;
          this.axios({
              method: 'post',
              url: this.service+"/login/v1_0/login?code=" + code + "&redirect_uri=" + this.redirectUri + "&type=" + this.getAuthentificationType()
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
            }).catch(function(error) {
              self.$unidooAlert.showError(self.$unidooAlert.formatError(self.$t('error.notification'), error), self.$t('button.close'))
            })
            this.$router.push("/logging").catch(() => {});
        } else {
          this.logoutFromORCID()
        }
      }
  }

 },

  mounted: function() {
    let aux = document.querySelector(this.externalselector);
    if (aux) {
      let text = aux.innerText;
      aux.innerHTML = '<section class="toolbar-parent"><h1 class="entry-title">'+text+'</h1><div class="toolbar-fill-remaining-space"></div><div class="external-toolbar"></div></section>'
      this.updateToolbar();
      this.setExternalListeners();
    }
  },
    
  methods: {

      getCodeParameter: function (){
        return this.getURLParameter("code");
      },

      getAuthentificationType: function (){
        return this.getURLParameter("authtype");
      },

      getTokenParameter: function (){
        return this.getURLParameter("token");
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
        if(this.devEnv) {
          this.links.push(this.linkContact)
        }
        this.$router.push("/notlogged").catch(() => {});
      },

      /**
       * Update toolbar on production mode
       */
      updateToolbar() {
        let prefix='external-toolbar-button'
        if (this.type=='external' && !this.$vuetify.breakpoint.mobile) {
        let toolbar = document.querySelector("div.external-toolbar")
        if (toolbar) {
          let content ="<span style='font-size: 2rem;padding-right: 70px;'>";
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
          if(this.links && this.links.length > 0) {
            content += '<i route="help" id="'+prefix+'-help" style="border-left: 1px solid #555;" class="toolbar-button mdi mdi-help-circle" title="'+this.$t('page.help')+'"></i>'
            content += '<i route="documentation" id="'+prefix+'-documentation" style="border-left: 1px solid #555;" class="toolbar-button mdi mdi-information-outline" title="'+this.$t('page.documentation')+'"></i>'
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
        } else if(route == "help"){
          window.location = self.helpUrl;
          return
        } else if(route == "documentation"){
          window.location = self.docUrl;
          return
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
.fullwidth a {
 text-decoration: none;
}
</style>

