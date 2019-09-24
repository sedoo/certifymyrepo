<template>
 <v-app class="grey lighten-4">
 
  <v-app-bar  app  color="indigo" dark    >
       <v-app-bar-nav-icon @click.stop="toggleDrawer()"></v-app-bar-nav-icon>

     <v-toolbar-title class="text-uppercase" >
                <span class="font-weight-light">CertifMy</span>REPO
            </v-toolbar-title>
            
            <v-spacer></v-spacer>
     
    </v-app-bar>
 
        
          <v-navigation-drawer app  v-model="drawer">
     
     
      <v-list flat>
      <v-list-item-group v-model="link" color="primary">
        <v-list-item
          v-for="(link, i) in links"
          :key="i" router :to="link.route"
        >
          <v-list-item-icon>
            <v-icon v-text="link.icon"></v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="link.label"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
     </v-navigation-drawer>
        
        <v-content class="mx-4 mb-4 my-2">
            <router-view></router-view>            
        </v-content>
</v-app>
</template>

<script>


export default {
  name: 'App',
  components: {
  },
  data: () => ({
    service: "http://localhost:8485/",
    profile: null,
    errored: false,
    drawer : false,
    link: null,
    links : [{label:"My repositories", route: '/repositories', icon: 'fa-archive'},{label:"My Profile", route: "/profile", icon: 'fa-user'}, {label:"Login", route: "/login", icon: 'fa-key'}]
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
            console.log(JSON.stringify(response.data))
            self.$store.commit('setUser', response.data)
            self.$store.commit('setLogged', true)
            self.$router.push({path: '/repositories'})
          })

      } else {
        this.logout();
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

    logout: function() {
      this.$store.commit('setLogged', false)
      this.$router.push("/login");
    },
    toggleDrawer: function() {
      this.drawer = !this.drawer
    }
  }
};
</script>
