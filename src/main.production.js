import '@fortawesome/fontawesome-free/css/all.css'
import Vue from 'vue'
import VueRouter from "vue-router";
import vuetify from './plugins/vuetify.js';
import axios from "axios";
import VueAxios from "vue-axios";
import router from './router'
import VueI18n from 'vue-i18n'

// Importing the global css file
import "@/style/global.css"

import App from './CrusoeApp.vue'
import VueApexCharts from 'vue-apexcharts'
import 'es6-promise/auto'
import { store } from './store/store'
import vueCustomElement from 'vue-custom-element'
import i18n from './i18n'
import ContactApp from './views/ContactApp.vue'
import {Unidoo, UnidooKeycloak} from "@sedoo/unidoo";


Vue.use(VueI18n);
Vue.use(VueRouter);
Vue.use(vueCustomElement);
Vue.use(VueAxios, axios);
Vue.use(Unidoo, { vuetify, axios, iconfont: 'mdi' });
Vue.use(UnidooKeycloak, { axios });
Vue.component('apexchart', VueApexCharts);

Vue.prototype.$unidooInitKeycloak({
  ssoParams: {
    url: "https://sso.aeris-data.fr/auth",
    onLoad: "login-required",
    realm: "aeris",
    clientId: "gestionpic-vjs",
    resource: "gestionpic-vjs",
    authorizedDomains: ["http://localhost:8485", "https://api.sedoo.fr"]
  },
});

Vue.prototype.$service = process.env.VUE_APP_BACKEND_URL;

App.vuetify = vuetify;
App.i18n = i18n;
App.store = store;
App.router = router;
Vue.customElement('crusoe-app', App)

ContactApp.vuetify = vuetify;
ContactApp.i18n = i18n;
ContactApp.store = store;
Vue.customElement('contact-app', ContactApp)

Vue.config.productionTip = false;
Vue.config.devtools = false;


const urlCdnStyle = [
  "https://fonts.googleapis.com/css?family=Material+Icons",
  "https://cdn.jsdelivr.net/npm/@mdi/font@4.x/css/materialdesignicons.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/svg-with-js.css",
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