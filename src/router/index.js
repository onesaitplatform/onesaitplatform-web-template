import Vue from 'vue'
import Router from 'vue-router'
import { publicPath } from '../../vue.config'
import store from '../store/store'
import Login from '@/views/login/Login'

Vue.use(Router)

/* function to add breadcrumbs to a view */
const setBreadcrumbParams = to => {
  // eslint-disable-next-line no-unused-vars
  const breadcrumbParams = {
    dashboardId: 'dashboardId', // dinamically changed if a dashboard is routed
    componentId: 'componentId' // dinamically changed if a component is routed
  }
  // get messages from i18n to get breadcrums defined for each element in route
  // this elements can be: Dashboards or components or single pages.
  const messages = store.getters.getMessages || []
  const breadcrums = Object.keys(messages).length > 0 ? messages.en?.breadcrumb : {}

  // apply breadcrums for each matched route
  to.matched.forEach(e => {
    // detect element
    var type = to.params?.formcode ? 'form' : to.params?.dashboardId ? 'dashboard' : 'other'
    switch (type) {
      case 'form':
        to.meta.breadcrumbTextKey = to.params.formcode in breadcrums ? to.params.formcode : e.meta.breadcrumbTextKey
        break
      case 'dashboard':
        console.log('DASHBOARD: ', to.params.dashboardId)
        to.meta.breadcrumbTextKey = to.params.dashboardId in breadcrums ? to.params.dashboardId : 'default'
        break
      case 'other':
        to.meta.breadcrumbTextKey = e.meta.breadcrumbTextKey
        break
    }
  })
}

const route = new Router({
  mode: 'history',
  base: publicPath,
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
      redirect: { name: 'login-form' },
      children: [
        {
          path: '',
          name: 'login-form',
          component: () => import('@/components/login/LoginForm')
        },
        {
          path: 'password',
          name: 'password-form',
          component: () => import('@/components/login/LoginPasswordForm')
        }
      ]
    },
    {
      path: '/user',
      name: 'User',
      component: () => import('@/views/User'),
      meta: {
        private: true,
        breadcrumbTextKey: 'userAccount'
      }
    },
    {
      path: '/users',
      name: 'Users',
      component: () => import('@/views/Users'),
      meta: {
        private: true,
        breadcrumbTextKey: 'users'
      }
    },
    {
      path: '/AdminDashboards',
      name: 'AdminDashboards',
      component: () => import('@/views/Admin'),
      props: true,
      meta: {
        private: true,
        breadcrumbTextKey: 'AdminDashboards'
      }
    },
    {
      path: '/test',
      name: 'Test',
      component: () => import('@/views/Test'),
      props: true,
      meta: {
        private: true,
        breadcrumbTextKey: 'test'
      }
    },
    {
      path: '/notifications',
      name: 'Notifications',
      component: () => import('@/views/Notifications'),
      props: true,
      meta: {
        private: true,
        breadcrumbTextKey: 'notifications'
      }
    },
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home'),
      meta: {
        private: true,
        breadcrumbTextKey: 'home'
      }
    },
    {
      path: '/dashboard',
      name: 'Dashboards',
      component: () => import('@/views/Dashboard'),
      meta: {
        private: true,
        breadcrumbTextKey: 'dashboard'
      }
    },
    {
      path: '/dashboard/:dashboardId',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard'),
      props: (route) => ({
        edit: route.params.edit || route.params.id === 'new'
      }),
      meta: {
        private: true,
        breadcrumbTextKey: 'dashboardId'
      }
    },
    {
      path: '/forms/:formcode/:dataoid?',
      name: 'Forms',
      component: () => import('@/views/Forms'),
      meta: {
        private: true,
        breadcrumbTextKey: 'formcode'
      }
    }
  ]
})

route.beforeEach((to, from, next) => {
  // add meta breadcrum if dashboard:
  // if (to.matched[0].meta.breadcrumbTextKey === 'dashboard') { to.matched[0].meta.breadcrumbTextKey = to.params.dashboardId }

  if ((to.matched.length === 0) && (to.path === '/index.html')) {
    if (!sessionStorage.getItem('sessionToken')) {
      next({ name: 'Login' })
    } else {
      sessionStorage.setItem('prevRoute', from.path)
      next()
    }
  }
  if (to.matched.some(record => record.meta.private)) {
    if (!sessionStorage.getItem('sessionToken')) {
      next({ name: 'Login' })
    } else {
      sessionStorage.setItem('prevRoute', from.path)
      next()
    }
  } else {
    sessionStorage.setItem('prevRoute', from.path)
    next()
  }
  if (from === Router.START_LOCATION && sessionStorage.getItem('sessionToken')) {
    // initial navigation after reloading and loaded, check and add Auth to the servers.
    sessionStorage.setItem('isReloaded', 1)
    // if (sessionStorage.getItem('messages') !== '') this.$i18n.locale=localStorage.Lang;
    store.dispatch('setJWTToken', sessionStorage.getItem('sessionToken'))
  } else {
    sessionStorage.setItem('isReloaded', 0)
  }
  setBreadcrumbParams(to)
})

export default route
