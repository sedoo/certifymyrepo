<template>
  <v-app>
    <unidoo-alert />
    <unidoo-confirm-dialog />
    <div>
      <v-toolbar flat>
        <v-spacer></v-spacer>
        <v-toolbar-items v-if="authenticated">
          <v-btn
            v-for="(link, i) in links"
            :key="i"
            
            text
            :title="link.label"
            @click="navigate(link.route)"
          >
            <v-icon :color="link.color" v-if="link.color">{{ link.icon }}</v-icon>
            <v-icon v-else>{{ link.icon }}</v-icon>
          </v-btn>
          <v-btn
            @click="logout"
            text :title="'Déconnexion du compte '+userName">
            <v-icon>mdi-application-export</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
    </div>
      <v-main class="ma-3">
        <router-view ></router-view>
      </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'app-admin',

  components: {

  },

  props: {
    language: {
      type: String,
      default: "fr"
    },
    service: {
      Type: String,
      default: null
    },
    env: {
      Type: String,
      default: null
    }
  },

  computed: {
    authenticated() {
      return this.$keycloak.authenticated;
    },

    userName() {
      return this.$store.getters.getUser.firstName + " " + this.$store.getters.getUser.lastName
    },

    links() { 
      let links = [] 
        links = [
          {label:"page.repositories", route: '/repositories', icon: 'mdi-archive'},
          {label:"page.information", route: "/information", icon: 'mdi-account-details-outline'},
        ]
        links.push(this.linkDashoard)
        links.push(this.linkAdministration)
      return links
    },
  },

    data() {
      return {
        localKeycloak: this.$keycloak,
        linkDashoard: {label:"page.dashboard", route: '/dashboard', icon: 'mdi-view-dashboard'},
        linkAdministration: {label:"page.administration", route: '/administration', icon: 'mdi-cogs' },
      };
    },
    
    watch: {
      authenticated(value) {
        if (value) {
          this.$store.dispatch("userSignIn", this.$keycloak);
          this.$router.push("repositories").catch( () => {})
        }
        // si on veut stocker le booléen authenticated dans le store pour l'utiliser à différents endroits de l'application
        this.$store.commit("setAuthenticated", value);
      }
    },

    created: function() {
      this.$i18n.locale = this.language
    },

    methods: {

      logout() {
        this.$store.dispatch("userSignOut")
        this.$router.push("notlogged").catch( () => {})
        this.$keycloak.logout();
      },

      navigate(route) {
        this.$router.push(route).catch( () => {})
      },

    }
};
</script>
