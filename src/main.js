import Vue from 'vue'
import App from './App.vue'
import VueRouter from "vue-router";
import vuetify from './plugins/vuetify';
import axios from "axios";
import VueAxios from "vue-axios";


Vue.config.productionTip = false


import MyProfile from './views/MyProfile.vue'
import MyRepositories from './views/MyRepositories.vue'
import MyCertificationReports from './views/MyCertificationReports.vue'

Vue.use(VueAxios, axios);

Vue.use(VueRouter);

const service ="http://localhost:8485/"

const router = new VueRouter({
    mode: 'history',
    routes: [{
            path: '/repositories',
            name: "repositories",
            component: MyRepositories,
            props: { service: service }
        },
        {
            path: '/profile',
            name: "profile",
            component: MyProfile
        },
        {
            path: '/certificationReports',
            name: "certificationReports",
            component: MyCertificationReports,
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
