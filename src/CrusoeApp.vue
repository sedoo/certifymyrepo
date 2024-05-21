<template>
 <v-app class="grey lighten-4">

    <unidoo-alert></unidoo-alert>
    <unidoo-confirm-dialog />

    <v-app-bar-nav-icon v-if="type!='external' || $vuetify.breakpoint.mobile" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-navigation-drawer
      v-model="drawer"
      absolute
      temporary app
    >
      <v-list
        nav
        dense
      >
        <v-list-item-group v-if="authenticated" 
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

          <v-list-item :href="helpUrl" target="_blank" v-if="authenticated">
            <v-list-item-icon><v-icon>mdi-help-circle</v-icon></v-list-item-icon>
            <v-list-item-title>{{ $t('page.help') }}</v-list-item-title>
          </v-list-item>
          <v-list-item :href="docUrl" target="_blank" v-if="authenticated">
            <v-list-item-icon><v-icon>mdi-information-outline</v-icon></v-list-item-icon>
            <v-list-item-title>{{ $t('page.documentation') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout" v-if="authenticated">
            <v-list-item-icon><v-icon>mdi-application-export</v-icon></v-list-item-icon>
            <v-list-item-title class="text-wrap">{{ $t('logout', {msg: userName}) }}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
        <v-list-item-group v-else
          v-model="group"
          active-class="deep-purple--text text--accent-4"
        >
          <v-list-item @click="login">
            <v-list-item-icon><v-icon>mdi-application-import</v-icon></v-list-item-icon>
            <v-list-item-title class="text-wrap">{{ this.$t('login') }}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
    <v-main class="ma-3">
      <router-view></router-view>
    </v-main>
</v-app>
</template>

<script>
export default {
  name: 'crusoe-app',
  props: {
    language: {
      type: String,
      default: "en"
    },
    type: {
      Type: String,
      default: "external"
    },
    externalselector: {
      Type: String,
      default: "header.entry-header"
    },
  },
  
  data() {
    return {
      localKeycloak: this.$keycloak,
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
    };
  },

  computed: {

    authenticated() {
      return this.$keycloak.authenticated;
    },

    userName() {
      return this.$store.getters.getUser.firstName + " " + this.$store.getters.getUser.lastName
    },
    frontEndUrl: function() {
      return this.$store.getters.getFrontEndUrl
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

  created: function() {
    console.log("CRUSOE APP")
    console.log(this.$store.getters.getUser)
    console.log(this.authenticated)
    this.$i18n.locale = this.language;
    this.$store.commit('setLanguage', this.language)
    this.links = [
          {label:"page.repositories", route: '/repositories', icon: 'mdi-archive'},
          {label:"page.information", route: "/information", icon: 'mdi-account-details-outline'},
        ]
    //this.links.push(this.linkContact)
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

  watch: {
      authenticated(value) {
        if (value) {
          this.$store.dispatch("userSignIn", this.$keycloak);
        }
        // si on veut stocker le booléen authenticated dans le store pour l'utiliser à différents endroits de l'application
        this.$store.commit("setAuthenticated", value);
        this.updateToolbar();
      }
   },
    
  methods: {

    logout() {
       this.$store.dispatch("userSignOut")
       this.$keycloak.logout();
       this.clearToolBar();
       window.location = this.$store.getters.getFrontEndUrl;
     },

    clearToolBar() {
      this.links = []
      if (this.type=='external' && !this.$vuetify.breakpoint.mobile) {
        let toolbar = document.querySelector("div.external-toolbar")
        if (toolbar) {
          toolbar.innerHTML = ""
        }
      }
    },

    login() {
      this.$keycloak.login();
    },

    isAdmin() {
      if(this.$store.getters.getUser) {
        this.$store.getters.getUser.includes("")
      }
    },

    /**
     * Update toolbar on production mode
     */
    updateToolbar() {
      if(this.$store.getters.getUser.isAdmin) {
        this.links.push(this.linkDashoard)
        this.links.push(this.linkAdministration) 
      } 
      let prefix='external-toolbar-button'
      if (this.type=='external' && !this.$vuetify.breakpoint.mobile) {
        let toolbar = document.querySelector("div.external-toolbar")
        if (toolbar) {
          let content ="<span style='font-size: 2rem;padding-right: 70px;'>";
          if(true) {
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
            content += '<i route="logout" id="'+prefix+'-logout" style="color:#fb8c00" class="toolbar-button mdi mdi-application-export" title="'+this.$t('logout', {msg: this.userName})+'"></i>'
          } else {
            content += '<i route="homepage" id="'+prefix+'-logout" style="color:#fb8c00" class="toolbar-button mdi mdi-application-import" title="'+this.$t('login')+'"></i>'
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
          if(route == "help"){
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

