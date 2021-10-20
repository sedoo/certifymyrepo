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
          service: null,
          renater: false,
          dialogWidth: '900px'
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
          },
          setService(state, service) {
            state.service = service
          },
          setRenater(state, renater) {
            state.renater = renater
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
          },
          getService(state) {
            return state.service;
          },
          getDialogWidth(state) {
            return state.dialogWidth;
          },
          getRenater(state) {
            return state.renater;
          }
        },

        plugins: [
          createPersistedState({ storage: window.sessionStorage })
        ]
      }
)