import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex);

export const store = new Vuex.Store(
    {
        state: {
          user: {roles: []},
          authenticated: false,
          repository: null,
          language: null,
          frontEndUrl: process.env.VUE_APP_FRONTEND_URL,
          dialogWidth: '900px'
        },
      
        mutations: {
          setUser(state, user) {
            state.user = user;
          },
          setRepository(state, repository) {
            state.repository = repository
          },
          setLanguage(state, language) {
            state.language = language
          },
          setAuthenticated(state, authenticated) {
            state.authenticated = authenticated;
          },
        },
      
        actions: {
          async userSignIn({ commit }, keycloak) {
            await initUser(commit, keycloak);
          },
          userSignOut({ commit }) {
            commit("setUser", {roles: []});
            // remettre à null les capabilities de l'user ici si nécessaire
          },
          getAuthenticated(state) {
            return state.authenticated;
          },
        },
      
        getters: {
          getUser(state) {
            return state.user;
          },
          getLogged(state) {
            return state.logged;
          },
          getRepository(state) {
            return state.repository;
          },
          getLanguage(state) {
            return state.language;
          },
          getFrontEndUrl(state) {
            return state.frontEndUrl;
          },
          getDialogWidth(state) {
            return state.dialogWidth;
          }
        },

        plugins: [
          createPersistedState({ storage: window.sessionStorage })
        ]
      }
)

export async function initUser(commit, keyCloak) {
  if (keyCloak.tokenParsed) {
    keyCloak.loadUserProfile().then((userProfile) => {
      const attributes = userProfile.attributes;
      const id = keyCloak.tokenParsed.sub;
      const firstName = keyCloak.tokenParsed.given_name;
      const lastName = keyCloak.tokenParsed.family_name;
      const email = keyCloak.tokenParsed.email;
      const resourceRoles = Object.keys(keyCloak.tokenParsed.resource_access)
        .map((key) => {
          return keyCloak.tokenParsed.resource_access[key].roles;
        })
        .join(",")
        .split(",");

      const realmRoles = keyCloak.tokenParsed.realm_access.roles;
      let roles = [];
      if (realmRoles) {
        roles = roles.concat(realmRoles);
      }
      if (resourceRoles) {
        roles = roles.concat(resourceRoles);
      }

      let user = {
        id,
        email,
        roles,
        firstName,
        lastName,
        attributes
      };
      axios.get(Vue.prototype.$service + "/admin/v1_0/isAdmin?email="+email)
      .then(function(response) {
        user.isAdmin = response.data
        commit("setUser", user);
        console.log(user)
      })
    });
  }

}