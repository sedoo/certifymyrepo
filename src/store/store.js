import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex);

export const store = new Vuex.Store(
    {
        state: {
          user: null,
          logged: false
        },
      
        mutations: {
          setUser(state, user) {
            state.user = user;
          },
          setLogged(state, logged) {
            state.logged = logged
          }
        },
      
        actions: {},
      
        getters: {
          getUser(state) {
            return state.user;
          },
          getLogged(state) {
            return state.logged;
          }
        },

        plugins: [
          createPersistedState({ storage: window.sessionStorage })
        ]
      }
)