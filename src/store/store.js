import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex);

export const store = new Vuex.Store(
    {
        state: {
          user: null,
          logged: false,
          repository: null,
          language: null,
        },
      
        mutations: {
          setUser(state, user) {
            state.user = user;
          },
          setLogged(state, logged) {
            state.logged = logged
          },
          setRepository(state, repository) {
            state.repository = repository
          },
          setLanguage(state, language) {
            state.language = language
          }
        },
      
        actions: {},
      
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
          }
        },

        plugins: [
          createPersistedState({ storage: window.sessionStorage })
        ]
      }
)