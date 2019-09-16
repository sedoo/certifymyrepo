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
import VueApexCharts from 'vue-apexcharts'

Vue.use(VueAxios, axios);

Vue.use(VueRouter);

Vue.component('apexchart', VueApexCharts)

const service ="http://localhost:8485/"

//Enable request interceptor
axios.interceptors.request.use(function (config) {
    // token orcid 123456789
    config.headers = { Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJTRURPTyIsImlhdCI6MTU2ODM1NzQxNiwiZXhwIjoxOTE1NDI2MjE2LCJhdWQiOiJ3d3cuY2VydGlmeW15cmVwby5mciIsInN1YiI6ImJhbGJhbEBzZWRvby5mciIsIm9yY2lkIjoiMTIzNDU2Nzg5In0.tICn1mMZx76epOe6YGqU7yOccbmnGFaAV4OzBqZNX5k`};
    // token Thomas
    //config.headers = { Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJTRURPTyIsImlhdCI6MTU2ODI5MjkxMywiZXhwIjoxOTE1MzYxNzE3LCJhdWQiOiJ3d3cuY2VydGlmeW15cmVwby5mciIsInN1YiI6IlRob21hcyAiLCJvcmNpZCI6IjAwMDAtMDAwMS04OTk3LTg3NjYifQ.qoJ5uxWu8vEmZzinDbssRP4I1GL1nGM-HhRRixTG2K0`};
  return config;
})

const router = new VueRouter({
    mode: 'history',
    routes: [{
            path: '/repositories',
            name: "repositories",
            component: MyRepositories,
            props: { service: service }
        },
        {
            path: '/repository',
            name: "repository",
            component: MyRepository,
            props: { service: service }
        },
        {
            path: '/profile',
            name: "profile",
            component: MyProfile
        },
        {
            path: '/certificationReports/:id/:name',
            name: "certificationReports",
            component: MyCertificationReports,
            props: { service: service }
        },
        {
            path: '/editMyReport',
            name: "editMyReport",
            component: MyCertificationReport,
            props: { service: service }
        }
    ]
})
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
  vuetify,
  render: h => h(App)
}).$mount('#app')
