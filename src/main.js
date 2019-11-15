import '@fortawesome/fontawesome-free/css/all.css'
import Vue from 'vue'
import App from './App.vue'
import VueRouter from "vue-router";
import vuetify from './plugins/vuetify';
import axios from "axios";
import VueAxios from "vue-axios";

Vue.config.productionTip = false


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



Vue.use(VueAxios, axios);
Vue.use(VueRouter);

Vue.component('apexchart', VueApexCharts)
Vue.component('certifymyrepo-token-refresher', TokenRefresher)

//const service ="http://localhost:8485/"

var service = ''
if(process.env.NODE_ENV == 'development') {
  service = 'http://localhost:8485/'
} else if (process.env.NODE_ENV == 'production') {
  service = 'https://services.sedoo.fr/certifymyrepo/'
}


//Enable request interceptor
axios.interceptors.request.use(function (config) {
    if(store.getters.getUser != null ) {
      config.headers = { Authorization: 'Bearer '+store.getters.getUser.token}
    }
    return config;
})

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
        }
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

//router.replace({ path: '/', redirect: '/login' })

Vue.use(vuetify, {
    options: {
        customProperties: true
    },
    theme: {
        primary: '#2196f3',
        secondary: '#3f51b5',
        accent: '#673ab7',
        error: '#f44336',
        warning: '#e91e63',
        info: '#00bcd4',
        success: '#009688'
    },
     icons: {
       iconfont: 'fa',
     }
})



new Vue({
  router,
  store,
  vuetify,
  render: h => h(App, {props: {service: service}})
}).$mount('#app')
