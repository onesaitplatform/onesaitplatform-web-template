// CONFIGURATION STORE

// IMPORT SECTION
import { HTTP_PLATFORM } from './http'

// CONFIGURATION STATE
const externalConfigurationId = process.env.VUE_APP_PLATFORM_CONFIGURATION
const state = {
  configurationId: externalConfigurationId, // for version 3.2.1>
  loading: false,
  configuration: [],
  applicationList: [],
  currentApplication: '',
  currentNavigation: {},
  currentFilters: {},
  productInfoLocal: { suite: 'platform', product: 'Application', productModule: '', secondary: false, negative: false, simple: false, onesait: false, accentBlock: false }, // let {} to load default logo
  productInfo: {}
}

// CONFIGURATION GETTERS
const getters = {
  getCurrentConfiguration (state) {
    return state.configuration
  },
  getCurrentApplication (state) {
    return state.currentApplication
  },
  getConfigurationEndpoint () {
    return process.env.VUE_APP_CONFIGURATION
  },
  getConfigurationId (state) {
    return state.configurationId
  },
  getAppI18nId (state) {
    const currentApp = state.currentApplication
    return (state.configuration).filter(app => app.realmId === currentApp).map(item => item.i18n)[0] || ''
  },
  getCurrentNavigation (state) {
    const currentApp = state.currentApplication
    return (state.configuration).filter(app => app.realmId === currentApp).map(item => item.navigation)[0] || {}
  },
  getAllowedComponents (state) {
    const currentApp = state.currentApplication
    return (state.configuration).filter(app => app.realmId === currentApp).map(item => item.components)[0] || {}
  },
  getHiddenDatasources (state) {
    const currentApp = state.currentApplication
    return (state.configuration).filter(app => app.realmId === currentApp).map(item => item.hiddenDatasources)[0] || []
  },
  getCurrentFilters (state) {
    const currentApp = state.currentApplication
    return (state.configuration).filter(app => app.realmId === currentApp).map(item => item.globalFilters)[0] || {}
  },
  getCurrentAppTitle (state) {
    const currentApp = state.currentApplication
    return (state.configuration).filter(app => app.realmId === currentApp).map(item => item.title)[0] || {}
  },
  getCurrentCustomization (state) {
    const currentApp = state.currentApplication
    return (state.configuration).filter(app => app.realmId === currentApp).map(item => item.customization)[0] || {}
  },
  getCurrentGadgetsTree (state) {
    const currentApp = state.currentApplication
    return (state.configuration).filter(app => app.realmId === currentApp).map(item => item?.gadgetTree)[0] || []
  },
  getCurrentApp (state) {
    const currentApp = state.currentApplication
    return (state.configuration).filter(app => app.realmId === currentApp)[0] || {}
  },
  getCurrentProductInfo (state) {
    const currentApp = state.currentApplication
    if (currentApp !== '' && currentApp !== undefined) { return (state.configuration).filter(app => app.realmId === currentApp)[0].productInfo || state.productInfoLocal } else { return state.productInfoLocal }
  }
}

// CONFIGURATION ACTIONS
const actions = {

  // GET PLATFORM CONFIGURATION
  async getConfiguration ({ commit, getters, state }) {
    try {
      // type will be EXTERNAL_CONFIG on new platform version.
      const endpoint = getters.getConfigurationEndpoint + getters.getConfigurationId + '/type/EXTERNAL_CONFIG/environment/default'
      // const endpoint = getters.getConfigurationEndpoint + getters.getConfigurationId for 2.1 version
      const configurationData = await HTTP_PLATFORM.get(endpoint)
      console.log('CONFIGURATION: retrieve APP Configuration')
      var configStr = configurationData.data.yml || '{}'
      var config = configStr.replace(/\s+/g, ' ').trim()
      // error parsing control
      var configuration = JSON.parse(config)
      if (configuration instanceof SyntaxError) {
        console.log('ERROR ON CENTRALIZED CONFIGURATION FILE')
        return { error: 'syntax Error' }
      } else {
        // Correct configuration file
        // set App Configuration, application list
        commit('SET_CONFIGURATION', configuration)
        commit('SET_APPLICATION_LIST', configuration.map(x => x.realmId))
        // set or try to set product Info
        var productInfo = {}
        if (configuration.map(x => x.realmId).productInfo !== undefined && Object.keys(configuration.map(x => x.realmId).productInfo).length > 0) { productInfo = configuration.map(x => x.realmId).productInfo }
        commit('SET_CURRENT_PRODUCT', productInfo)
        return configuration
      }
    } catch (error) {
      console.log(error)
      return error
    }
  },
  // SET CURRENT APPLICATION ( APP, NAVIGATION , FILTERS)
  setCurrentApplication ({ commit, getters, state }, app) {
    commit('SET_CURRENT_APPLICATION', app)

    const navigation = (state.configuration).filter(app => app.realmId === app).map(item => item.navigation)[0]
    commit('SET_CURRENT_NAVIGATION', navigation)

    const filters = (state.configuration).filter(app => app.realmId === app).map(item => item.globalFilters)[0]
    commit('SET_CURRENT_FILTERS', filters)

    // set i18n for reload
    var currentI18n = getters.getAppI18nId
    sessionStorage.setItem('currentI18n', currentI18n)
  },

  // SET CURRENT NAVIGATION
  setCurrentNavigation ({ commit }, navigation) {
    commit('SET_CURRENT_NAVIGATION', navigation)
  },
  // SET CURRENT FILTERS
  setCurrentFilters ({ commit }, filters) {
    commit('SET_CURRENT_FILTERS', filters)
  }
}

// CONFIGURATION MUTATIONS
const mutations = {
  'SET_FILTER' (state, payload) {
    state.filter = payload
  },
  'SET_CONFIGURATION' (state, payload) {
    state.configuration = payload
  },
  'SET_APPLICATION_LIST' (state, payload) {
    state.applicationList = payload
  },
  'SET_CURRENT_APPLICATION' (state, payload) {
    state.currentApplication = payload
  },
  'SET_CURRENT_NAVIGATION' (state, payload) {
    state.currentNavigation = payload
  },
  'SET_CURRENT_FILTERS' (state, payload) {
    state.currentFilters = payload
  },
  'SET_CURRENT_PRODUCT' (state, payload) {
    state.productInfo = payload
  }
}

// EXPORT SECTION
export default {
  state,
  getters,
  actions,
  mutations
}
