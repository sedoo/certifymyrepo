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

const service ="http://localhost:8485/"

App.service = service

//Enable request interceptor
axios.interceptors.request.use(function (config) {
    if(store.getters.getUser != null ) {
      //console.log('Interceptor Token: '+store.getters.getUser.token)
      config.headers = { Authorization: 'Bearer '+store.getters.getUser.token}
    }
    //
    //config.headers = { Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJUaG9tYXMgUm9tdWFsZCIsImlzcyI6IlNlZG9vIiwiaWF0IjoxNTY5MzExOTgzLCJleHAiOjE1NjkzMTM3ODMsIm9yY2lkIjoiMDAwMC0wMDAxLTg5OTctODc2NiJ9.D0KdYyT6fDM3xz2qs3RW1yitRE_ynQXR1eK7rKSh2U4`};
    // token orcid 123456789
    //config.headers = { Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJTRURPTyIsImlhdCI6MTU2ODM1NzQxNiwiZXhwIjoxOTE1NDI2MjE2LCJhdWQiOiJ3d3cuY2VydGlmeW15cmVwby5mciIsInN1YiI6ImJhbGJhbEBzZWRvby5mciIsIm9yY2lkIjoiMTIzNDU2Nzg5In0.tICn1mMZx76epOe6YGqU7yOccbmnGFaAV4OzBqZNX5k`};
    // token Thomas
    //config.headers = { Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJTRURPTyIsImlhdCI6MTU2ODI5MjkxMywiZXhwIjoxOTE1MzYxNzE3LCJhdWQiOiJ3d3cuY2VydGlmeW15cmVwby5mciIsInN1YiI6IlRob21hcyAiLCJvcmNpZCI6IjAwMDAtMDAwMS04OTk3LTg3NjYifQ.qoJ5uxWu8vEmZzinDbssRP4I1GL1nGM-HhRRixTG2K0`};
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

//router.replace({ path: 'certifymyrepo', redirect: '/' })

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
  render: h => h(App)
}).$mount('#app')
