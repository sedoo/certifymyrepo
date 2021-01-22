import '@fortawesome/fontawesome-free/css/all.css'
import Vue from 'vue'
import VueRouter from "vue-router";
import vuetify from './plugins/vuetify.js';
import axios from "axios";
import VueAxios from "vue-axios";

Vue.config.productionTip = false


import CrusoeApp from './views/crusoe-app.vue'
import MyProfile from './views/MyProfile.vue'
import MyRepositories from './views/MyRepositories.vue'
import MyRepository from './views/MyRepository.vue'
import MyCertificationReports from './views/MyCertificationReports.vue'
import MyCertificationReport from './views/MyCertificationReport.vue'
import Login from './views/Login.vue'
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

var service = 'https://services.sedoo.fr/certifymyrepo'

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

const router = new VueRouter({
    mode: 'hash',
    routes: [{
            path: '/repositories',
            name: "repositories",
            component: MyRepositories,
            props: { service: service },
            meta: {requiresAuth: true}
        },
        {
            path: '/repository',
            name: "repository",
            component: MyRepository,
            props: { service: service },
            meta: {requiresAuth: true}
        },
        {
            path: '/profile',
            name: "profile",
            component: MyProfile,
            props: { service: service },
            meta: {requiresAuth: true}
        },
        {
            path: '/certificationReports/:id',
            name: "certificationReports",
            component: MyCertificationReports,
            props: { service: service },
            meta: {requiresAuth: true}
        },
        {
          path: '/myReport',
          name: "myReport",
          component: MyCertificationReport,
          props: { service: service },
          meta: {requiresAuth: true}
        },
        {
            path: '/login',
            name: "login",
            component: Login,
            props: { service: service }
        },
        { path: '/', redirect: '/login' }
    ]
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    if (!store.getters.getLogged) {
      next({ name: 'login' })
    } else {
      next() // go to wherever I'm going
    }
  } else {
    next() // does not require auth, make sure to always call next()!
  }
})

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