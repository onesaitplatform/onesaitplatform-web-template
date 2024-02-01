// LOGIN STORE
import { HTTP_PLATFORM } from '../../store/modules/http'
import { api } from '@/store'

// state
const state = {
  loading: false,
  isPasswordText: false,
  mqPhone: window.matchMedia('(max-width: 767px)'),
  navigation: [],
  languages: [],
  messages: [],
  applications: [],
  i18nId: process.env.VUE_APP_PLATFORM_I18n || '',
  user: {},
  token: '',
  keyCloakToken: '',
  load: false
}

// login type [ default, realm ]
const loginType = {
  type: process.env.VUE_APP_LOGIN_TYPE
}

// Endpoints for user actions
const loginEndpoints = {
  userData: process.env.VUE_APP_USERINFO,
  userRealmData: process.env.VUE_APP_USERINFO_REALM,
  userRealmElements: process.env.VUE_APP_USERINFO_REALM_ELEMENTS,
  availableUserApps: process.env.VUE_APP_USER_AVAILABLE_APPS
}

// getters
const getters = {
  getLoaderState (state) {
    return state.loading
  },
  getIsMobile (state) {
    return state.mqPhone.matches
  },
  getIsPasswordForm (state) {
    return state.isPasswordText
  },
  getLoginType () {
    return loginType.type
  },
  getUserDataEndpoint () {
    return loginEndpoints.userData
  },
  getUserDataRealmEndpoint () {
    return loginEndpoints.userRealmData
  },
  getUserDataRealmElements () {
    return loginEndpoints.userRealmElements
  },
  getAvailableUserApps () {
    return loginEndpoints.availableUserApps
  },
  getNavigation (state) {
    console.log('****state get navigation', state.navigation)
    return state.navigation
  },
  getI18n (state) {
    return state.i18nId
  },
  getLanguages (state) {
    return state.languages
  },
  getMessages (state) {
    return state.messages
  },
  getUser (state) {
    return state.user
  },
  getLoginToken (state) {
    return state.keyCloakToken
  },
  getRealmsApp (state) {
    return state.applications
  },
  isMultipleApp (state) {
    const apps = getters.getRealmsApp(state)
    return apps.length > 0
  },
  getLoad (state) {
    return state.load
  }
}

// actions
const actions = {

  // LOADER
  loader ({ commit }, actions) {
    commit('SET_LOADER', actions)
  },

  // PRE LOGIN: make platform login
  async preLogin ({ commit }, data) {
    try {
      const params = new URLSearchParams()
      var userAuth = ''
      params.append('username', data.username)
      params.append('password', data.password)
      params.append('grant_type', 'password')
      params.append('scope', 'openid')
      userAuth = btoa('onesaitplatform:onesaitplatform')
      const response = await HTTP_PLATFORM.post('/oauth-server/oauth/token', params, { headers: { Authorization: 'Basic ' + userAuth, 'Cache-Control': 'no-cache', Pragma: 'no-cache' } })
      return response
    } catch (error) {
      console.log('prelogin() Error: ', error)
      return error
    }
  },

  // LOAD AVAILABLE USER APPLICATIONS
  async loadAvailableApplications ({ commit, getters, rootGetters }, actions) {
    try {
      // reset Apps
      commit('RESET_APPLICATIONS')

      // get user Apps
      var userAppsEndPoint = getters.getAvailableUserApps
      const userApps = await HTTP_PLATFORM.get(userAppsEndPoint)
      var userAppArr = userApps.data || []

      // get configuration Apps
      var commonApp = (rootGetters.getCurrentConfiguration).map(x => x.realmId) || []

      // set available Apps
      const suitesApp = userAppArr.filter(function (obj) { return commonApp.indexOf(obj) !== -1 })
      commit('SET_APPLICATIONS', suitesApp)
      return suitesApp
    } catch (error) {
      console.log(error)
      return error
    }
  },

  // APP LOGIN: make a login against App/Realm
  async login ({ commit }, data) {
    try {
      const params = new URLSearchParams()
      var userAuth = ''
      params.append('username', data.username)
      params.append('password', data.password)
      params.append('grant_type', 'password')
      params.append('scope', 'openid')

      // APP LOGIN
      var realmKey = data.secret ? data.secret : data.realmId
      var realmId = data.realmId
      var clientId = data.clientId ? data.clientId : data.realmId
      var authToken = '' + realmId + ':' + realmKey
      userAuth = window.btoa(authToken)
      params.append('client_Id', clientId)
      const response = await HTTP_PLATFORM.post('/oauth-server/oauth/token', params, { headers: { Authorization: 'Basic ' + userAuth, 'Cache-Control': 'no-cache', Pragma: 'no-cache' } })
      commit('SET_TOKEN_SERVICE', { token: response.data.access_token })
      return response
    } catch (error) {
      console.log(error)
      return error
    }
  },

  // KEYCLOAK FROM PLATFORM
  setJWTToken ({ commit }, data) {
    commit('SET_TOKEN', data)
    commit('SET_TOKEN_SERVICE', { token: data })
  },

  // KEYCLOAK SET USER INFO FROM KEYCLOAK AUTH
  setKUser ({ commit }, user) {
    commit('SET_USER', user)
  },

  // GET DASHBOARDS from user on an App (environment.)
  async getDashboards ({ commit }, app) {
    var urlDashboards = getters.getUserDataRealmElements() + '/' + app.project + '/resources/role/' + app.role
    const elements = await HTTP_PLATFORM.get(urlDashboards)
    const dashboards = elements.data.filter(x => x.resourceType === 'DASHBOARD').map(o => ({ name: o.resource, id: o.resource }))
    commit('SET_NAVIGATION', dashboards)
    return dashboards
  },

  // GET USER APP Info
  async getAppUserUserInfo ({ commit, rootGetters }, app) {
    var urlUserInfo = getters.getUserDataRealmEndpoint() + '/' + app.realmId + '/users/' + app.username
    const info = await HTTP_PLATFORM.get(urlUserInfo)
    sessionStorage.username = info.data[0].username
    sessionStorage.usermail = info.data[0].mail
    sessionStorage.role = info.data[0].role
    const user = { user: info.data[0].username, username: info.data[0].fullName, email: info.data[0].mail, role: info.data[0].role }
    commit('SET_USER', user)
    return user
  },
  // GET I18N LANGUAGES FROM PLATFORM
  async getI18nData ({ commit, getters, rootGetters }, app) {
    var that = app
    try {
      const i18nId = rootGetters.getAppI18nId || ''
      var messages = {}
      var languages = []
      if (i18nId) {
        const i18nApiEndPoint = '/controlpanel/api/internationalizations/' + i18nId + '/'
        const i18nData = await HTTP_PLATFORM.get(i18nApiEndPoint, { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } })
        if (i18nData.data.jsoni18n && i18nData.data.jsoni18n.languages && Object.keys(i18nData.data.jsoni18n.languages).length > 0) {
          var i18nFiles = i18nData.data.jsoni18n.languages
          var i18Label = ''
          // iterate and mount messages object (es,en,...)
          Object.keys(i18nFiles).forEach(key => {
            // create new message file
            i18Label = '' + (key).toLowerCase()
            messages[i18Label] = {}
            messages[i18Label] = i18nFiles[key]
            languages.push(i18Label.toLowerCase())
          })
          commit('SET_LANGUAGES', languages)
          sessionStorage.setItem('languages', JSON.stringify(languages))
          sessionStorage.setItem('messages', JSON.stringify(messages))
          // apply locales
          for (const key in messages) {
            // mount messages
            var i18n = {
              ...that._i18n.getLocaleMessage(key),
              ...messages[key]
            }
            that._i18n.setLocaleMessage(key, i18n)
          }
          commit('SET_MESSAGES', messages)
          return messages
        } else {
          console.log('no i18n messages identificator founded.')
        }
      }
    } catch (error) {
      console.log(error)
      return false
    }
  },

  // LOAD APP ENVIRONMENT
  // Load i18n, dashboards, navigation and filters on Selected App
  async loadEnvironment ({ dispatch, commit, getters, rootGetters }, app) {
    try {
      console.log('|--> loading environment for App:')
      // console.log('|--> ', JSON.stringify(app))
      // dashboards
      // eslint-disable-next-line no-unused-vars
      const dashboards = await dispatch('getDashboards', app)
      console.log('  |--> Loadind Available Dashboards.')

      // session App User info
      // eslint-disable-next-line no-unused-vars
      const sessionInfo = await dispatch('getAppUserUserInfo', app)
      console.log('  |--> Loading User Session Info.')

      // navigation
      // eslint-disable-next-line no-unused-vars
      const currentNavigation = rootGetters.getCurrentNavigation
      console.log('  |--> Loading Available Navigation.')

      // filters
      // eslint-disable-next-line no-unused-vars
      const currentFilters = rootGetters.getCurrentFilters
      console.log('  |--> Loading Available Filters.')

      // get favorite and route
      var showFavorites = true
      var customization = rootGetters.getCustomization || {}
      if (customization && customization.showfavorites !== 'undefined') {
        showFavorites = customization.showfavorites
      } else {
        showFavorites = false
      }
      if (showFavorites) {
        var dashboardRoute = app.username + '_' + app.realmId + '_fav'
      } else {
        var config = rootGetters.getCurrentApp
        // can be an string (dashboardId) or an object (dashboard or component)
        if (config && config.initialNavigation && Array.isArray(config.initialNavigation)) {
          const role = sessionStorage.getItem('role')
          const initHomePage = config.initialNavigation.find((element) => element.role === role)
          console.log('  |--> Available InitHomePage:', initHomePage)
          dashboardRoute = initHomePage
        } else {
          const initHomePage = config && config.initialNavigation ? config.initialNavigation : 'DER1-HOME'
          console.log('  |--> Available InitHomePage:', initHomePage)
          dashboardRoute = initHomePage
        }
        commit('SET_LOAD', true)
        return dashboardRoute
      }
    } catch (error) {
      console.log('Loading Environment error: ', error)
      return error
    }
  },

  // UPDATE APPLICATIONS
  updateApplications ({ commit }) {
    var availableApps = JSON.parse(localStorage.getItem('vuex'))
    if (availableApps.login.applications !== undefined && availableApps.login.applications.length > 0) {
      console.log('updating applications to make reactive for suites menus...', availableApps.login.applications)
      commit('SET_APPLICATIONS', availableApps.login.applications)
    }
  }
}

// mutations
const mutations = {
  'SET_LOADER' (state, actions) {
    state.loading = actions.loader === true
    state.isPasswordText = actions.password === true
  },
  'SET_USER' (state, user) {
    state.user = user
  },
  'SET_TOKEN' (state, token) {
    state.keyCloakToken = token
  },
  'SET_NAVIGATION' (state, payload) {
    console.log('****state SET_NAVIGATION', payload)
    state.navigation = payload
  },
  'SET_LANGUAGES' (state, payload) {
    state.languages = payload
  },
  'SET_MESSAGES' (state, payload) {
    state.messages = payload
  },
  'SET_APPLICATIONS' (state, payload) {
    for (let i = 0; i < payload.length; i++) {
      state.applications.push(payload[i])
    }
  },
  'RESET_APPLICATIONS' (state) {
    state.applications = []
  },
  'SET_LOAD' (state, payload) {
    state.load = payload
  },
  'SET_TOKEN_SERVICE' (state, { token }) {
    api.setToken(token)
    state.token = token
    sessionStorage.setItem('keycloakToken', token)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
