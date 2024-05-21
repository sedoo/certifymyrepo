import Vue from 'vue'
import VueRouter from "vue-router";

import MyProfile from './views/MyProfile.vue'
import MyInformation from './views/MyInformation.vue'
import Administration from './views/Administration.vue'
import Dashboard from './views/Dashboard.vue'
import MyRepositories from './views/MyRepositories.vue'
import MyRepository from './views/MyRepository.vue'
import MyCertificationReports from './views/MyCertificationReports.vue'
import MyCertificationReport from './views/MyCertificationReport.vue'
import HomePage from "./views/HomePage.vue"
import Contact from "./views/ContactApp.vue"
import RequestValidation from "./views/RequestValidation.vue"

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'hash',
    routes: [
        {
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
          path: '/information',
          name: "information",
          component: MyInformation,
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
          path: "/homepage",
          name: "homepage",
          component: HomePage
        },
        {
          path: "/contact",
          name: "contact",
          component: Contact
        },
        {
          path: "/requestValidation/:repositoryId/:userId",
          name: "requestValidation",
          component: RequestValidation
        },
        { path: '/', redirect: '/homepage' }
    ]
})

export default router;