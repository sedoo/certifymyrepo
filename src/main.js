import '@fortawesome/fontawesome-free/css/all.css'
import Vue from 'vue'
import App from './CrusoeApp.vue'
import vuetify from './plugins/vuetify.js';
import axios from "axios";
import VueAxios from "vue-axios";
import VueRouter from 'vue-router'
import VueI18n from 'vue-i18n'

// Importing the global css file
import "@/style/global.css"

Vue.config.productionTip = false

import VueApexCharts from 'vue-apexcharts'
import 'es6-promise/auto'
import { store } from './store/store'
import i18n from './i18n'
import router from './router'
import {Unidoo, UnidooKeycloak} from "@sedoo/unidoo";

Vue.use(VueRouter)
Vue.use(VueI18n)
Vue.use(VueAxios, axios)
Vue.use(Unidoo, { vuetify, axios, iconfont: 'mdi' });
Vue.use(UnidooKeycloak, { axios });

Vue.prototype.$unidooInitKeycloak({
  ssoParams: {
      url: "https://sso.aeris-data.fr/auth",
      realm: "aeris",
      onLoad: "login-required",
      clientId: "crusoe-vjs",
      resource: "crusoe-vjs",
      authorizedDomains: ["http://localhost:8080", "http://localhost:8485", "https://api.sedoo.fr"]
  },
});

Vue.component('apexchart', VueApexCharts)

Vue.prototype.$service = process.env.VUE_APP_BACKEND_URL;

new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: h => h(App, {props: {type: 'internal'}})
}).$mount('#app')
