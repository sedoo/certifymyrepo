import Vue from 'vue'
import VueRouter from "vue-router";
import { store } from './store/store'

import MyProfile from './views/MyProfile.vue'
import Administration from './views/Administration.vue'
import Dashboard from './views/Dashboard.vue'
import MyRepositories from './views/MyRepositories.vue'
import MyRepository from './views/MyRepository.vue'
import MyCertificationReports from './views/MyCertificationReports.vue'
import MyCertificationReport from './views/MyCertificationReport.vue'
import Login from './views/Login.vue'

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'hash',
    routes: [{
            path: '/administration',
            name: "administration",
            component: Administration,
            meta: {requiresAuth: true}
        },
        {
            path: '/dashboard',
            name: "dasbord",
            component: Dashboard,
            meta: {requiresAuth: true}
        },
        {
            path: '/repositories',
            name: "repositories",
            component: MyRepositories,
            meta: {requiresAuth: true}
        },
        {
            path: '/repository',
            name: "repository",
            component: MyRepository,
            meta: {requiresAuth: true}
        },
        {
            path: '/profile',
            name: "profile",
            component: MyProfile,
            meta: {requiresAuth: true}
        },
        {
            path: '/certificationReports/:id',
            name: "certificationReports",
            component: MyCertificationReports,
            meta: {requiresAuth: true}
        },
        {
          path: '/myReport',
          name: "myReport",
          component: MyCertificationReport,
          meta: {requiresAuth: true}
        },
        {
            path: '/login',
            name: "login",
            component: Login,
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

export default router;