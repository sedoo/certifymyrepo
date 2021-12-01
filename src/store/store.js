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
          service: process.env.VUE_APP_BACKEND_URL,
          serviceShibboleth: process.env.VUE_APP_SHIBBOLETH_URL,
          frontEndUrl: process.env.VUE_APP_FRONTEND_URL,
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
          getServiceShibboleth(state) {
            return state.serviceShibboleth;
          },
          getFrontEndUrl(state) {
            return state.frontEndUrl;
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