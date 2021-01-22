import '@fortawesome/fontawesome-free/css/all.css'
import Vue from 'vue'
import VueRouter from "vue-router";
import vuetify from './plugins/vuetify.js';
import axios from "axios";
import VueAxios from "vue-axios";
import router from './router'

Vue.config.productionTip = false

import CrusoeApp from './views/crusoe-app.vue'
import TokenRefresher from './components/CertifyMyRepo-token-refresher.vue'
import VueApexCharts from 'vue-apexcharts'
import 'es6-promise/auto'
import { store } from './store/store'
import {logOut} from './utils.js'
import vueCustomElement from 'vue-custom-element'
import i18n from './i18n'

Vue.use(VueAxios, axios);
Vue.use(VueRouter);
Vue.use(vueCustomElement);

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
  if(error.response != null && error.response.status == '403') {
    console.log(error.response)
    logOut(store)
    router.push({path: '/login' })
  }
  return Promise.reject(error);
});

const VueComponent = [
  CrusoeApp
]
VueComponent.forEach(comp => {
  console.log("Start adding ", comp.name, " to custome element ...")
  comp.vuetify = vuetify;
  comp.i18n = i18n;
  comp.store = store;
  comp.router = router;
  Vue.customElement(comp.name, comp)
  console.log("Finish adding ", comp.name, " to custome element")
  console.log("Finish adding ", comp, " to custome element")
})
const urlCdnStyle = [
  "https://fonts.googleapis.com/css?family=Material+Icons",
  "https://cdn.jsdelivr.net/npm/@mdi/font@4.x/css/materialdesignicons.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/svg-with-js.css",
  "https://cdn.rawgit.com/openlayers/openlayers.github.io/master/en/v6.0.1/css/ol.css",
  "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900"
]
// adding CDN css font url
urlCdnStyle.forEach(CdnStyleUrl => {
  console.log("add style cdn url : ", CdnStyleUrl)
  let styleTag = document.createElement("link");
  styleTag.href = CdnStyleUrl;
  styleTag.rel = "stylesheet"
  document.getElementsByTagName('head')[0].appendChild(styleTag);
})