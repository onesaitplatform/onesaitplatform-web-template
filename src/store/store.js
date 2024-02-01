import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import login from './modules/login'
import configuration from './modules/configuration'
import filters from './modules/filters'
import moment from 'moment'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    busy: false,
    mqPhone: window.matchMedia('(max-width: 767px)'),
    currentDate: moment().format('LL')
  },
  getters: {
    isBusy: state => state.busy,
    isMobile: state => state.mqPhone.matches
  },
  mutations: {
    'SET_BUSYNESS' (state, payload) {
      state.busy = payload
    }
  },
  modules: {
    login,
    configuration,
    filters
  },
  plugins: [createPersistedState()]
})
