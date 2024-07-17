import Vue from 'vue'
import App from './App.vue'
import i18n from './lang/i18n.js' // eslint-disable-line
import router from './router'
import Keycloak from 'keycloak-js'
import AsyncComputed from 'vue-async-computed'
import ODS from '@ods/ods' // eslint-disable-line
import { closest } from './utils/ie' // eslint-disable-line
import { truncate, formatDate } from './utils/filters' // eslint-disable-line
import Meta from 'vue-meta'
import '@ods/ods/lib/theme-onesait/index.css'
import store from './store/store.js'
Vue.config.productionTip = false

closest()
Vue.use(AsyncComputed) // async computed properties added
Vue.use(require('vue-moment')) // momentjs for date treatment
Vue.$router = router

// vue-meta
const metaOptions = { tagIDKeyName: 'id', refreshOnceOnNavigation: true }
Vue.use(Meta, metaOptions) // load css and script on demand on components
Vue.use(ODS, { i18n: (key, value) => i18n.t(key, value) })

// KEYCLOAK OPTIONS
// eslint-disable-next-line no-unused-vars
/* eslint no-undef: "error" */
var keycloakRealmId = process.env.VUE_APP_KEYCLOAK_REALMID
var keycloakClientId = process.env.VUE_APP_KEYCLOAK_CLIENTID
var initOptions = {
  url: '/auth', realm: keycloakRealmId, clientId: keycloakClientId, onLoad: 'login-required'
}

if (process.env.VUE_APP_AUTH_TYPE === 'KEYCLOAK') {
  // KEYCLOAK AUTHORIZATION
  // eslint-disable-next-line no-unused-vars
  var keycloak = Keycloak(initOptions)
  keycloak.init({ onLoad: initOptions.onLoad }).then((auth) => {
    if (!auth) {
      window.location.reload()
    } else {
      console.log('Keycloak Authenticated ', window.location)
      // OAUTH TOKENs
      localStorage.setItem('vue-token', keycloak.token)
      localStorage.setItem('vue-refresh-token', keycloak.refreshToken)
    }
    // APP VUE WITH KEYCLOAK
    var osvm = new Vue({
      i18n,
      store,
      router,
      render: h => h(App)
    }).$mount('#app')
    // define App to operate externally
    window.osvm = osvm
  }).catch((e) => {
    console.log('Keycloak ERROR: ', e)
  })
} else {
  // APP VUE WITHOUT KEYCLOAK
  var osvm = new Vue({
    i18n,
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
  // define App to operate externally
  window.osvm = osvm
}
