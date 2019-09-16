<template>
 <v-app class="grey lighten-4">
 
  <v-app-bar  app  color="indigo" dark    >
       <v-app-bar-nav-icon @click.stop="toggleDrawer()"></v-app-bar-nav-icon>

     <v-toolbar-title class="text-uppercase" >
                <span class="font-weight-light">CertifMy</span>REPO
            </v-toolbar-title>
            
            <v-spacer></v-spacer>
            <v-btn text icon color="grey">
              <v-icon>mdi-face</v-icon>
               <v-icon>fa-anchor</v-icon>
               <v-icon>mdi-storage</v-icon>
            </v-btn>
     
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
    profile: null,
    errored: false,
    drawer : false,
    link: null,
    links : [{label:"My repositories", route: '/repositories', icon: 'fa-archive'},{label:"My Profile", route: "/profile", icon: 'fa-user'}]
  }),
    methods: {
      toggleDrawer: function() {
        this.drawer = !this.drawer
        }
  }
};
</script>
