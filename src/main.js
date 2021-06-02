import '@fortawesome/fontawesome-free/css/all.css'
import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify.js';
import axios from "axios";
import VueAxios from "vue-axios";

// Importing the global css file
import "@/style/global.css"

Vue.config.productionTip = false

import TokenRefresher from './components/CertifyMyRepo-token-refresher.vue'
import VueApexCharts from 'vue-apexcharts'
import 'es6-promise/auto'
import { store } from './store/store'
import {logOut} from './utils.js'
import i18n from './i18n'
import router from './router'
import Unidoo from '@sedoo/unidoo'

Vue.use(VueAxios, axios);
Vue.use(Unidoo)

Vue.component('apexchart', VueApexCharts)
Vue.component('certifymyrepo-token-refresher', TokenRefresher)

//Enable request interceptor
axios.interceptors.request.use(function (config) {
    if(store.getters.getUser != null ) {
      config.headers = { Authorization: 'Bearer '+store.getters.getUser.token}
    }
    return config;
})

// Add a response interceptor
axios.interceptors.response.use(function (response) {
  // Do not do anything
  return response;
}, function (error) {
  if(error.response != null && error.response.status == 403) {
    logOut(store)
    router.push({path: '/notlogged' })
  }
  return Promise.reject(error);
});

new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: h => h(App, {props: {type: 'internal', devEnv: true}})
}).$mount('#app')
