import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/login/Login'
import User from '@/views/User.vue'
import Dashboard from '@/views/Dashboard.vue'
import Admin from '@/views/Admin.vue'
import Test from '@/views/Test.vue'
import Users from '@/views/Users.vue'
import LoginForm from '@/components/login/LoginForm'
import Form from '@/views/Forms.vue'
import LoginPasswordForm from '@/components/login/LoginPasswordForm'
import { publicPath } from '../../vue.config'
import store from '../store/store'

Vue.use(Router)

/* function to add breadcrumbs to a view */
const setBreadcrumbParams = to => {
  const breadcrumbParams = {
    userInfo: sessionStorage.getItem('userInfo'),
    randomStr: sessionStorage.getItem('randomStr'),
    dashboardId: 'dashboardId' // dynamicalle changed if dashboard is routed
  }

  const messages = store.getters.getMessages || []

  to.matched.forEach(e => {
    var breadcrums = Object.keys(messages).length > 0 ? messages.en?.breadcrumb : {}
    for (const param in breadcrumbParams) {
      if (param === 'dashboardId') {
        if (to.params.dashboardId in breadcrums) {
          to.meta.breadcrumbTextKey = to.params.dashboardId ? to.params.dashboardId : to.meta.breadcrumbTextKey
        } else {
          to.meta.breadcrumbTextKey = 'default'
        }
      } else if (e.meta.breadcrumbParam === param) {
        to.params[e.meta.breadcrumbParam] = breadcrumbParams[param]
      }
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
          component: LoginForm
        },
        {
          path: 'password',
          name: 'password-form',
          component: LoginPasswordForm
        }
      ]
    },
    {
      path: '/user',
      name: 'User',
      component: User,
      meta: {
        private: true,
        breadcrumbTextKey: 'userAccount'
      }
    },
    {
      path: '/users',
      name: 'Users',
      component: Users,
      meta: {
        private: true,
        breadcrumbTextKey: 'users'
      }
    },
    {
      path: '/admin',
      name: 'Admin',
      component: Admin,
      props: true,
      meta: {
        private: true,
        breadcrumbTextKey: 'admin'
      }
    },
    {
      path: '/test',
      name: 'Test',
      component: Test,
      props: true,
      meta: {
        private: true,
        breadcrumbTextKey: 'test'
      }
    },
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: {
        private: true,
        breadcrumbTextKey: 'home'
      }
    },
    {
      path: '/dashboard',
      name: 'Dashboards',
      component: Dashboard,
      meta: {
        private: true,
        breadcrumbTextKey: 'dashboard'
      }
    },
    {
      path: '/dashboard/:dashboardId',
      name: 'Dashboard',
      component: Dashboard,
      props: (route) => ({
        edit: route.params.edit || route.params.id === 'new'
      }),
      meta: {
        private: true,
        breadcrumbTextKey: 'dashboardId'
      }
    },
    {
      path: '/forms/:formcode?/:dataoid?',
      name: 'Forms',
      component: Form,
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
  setBreadcrumbParams(to)
})

export default route
