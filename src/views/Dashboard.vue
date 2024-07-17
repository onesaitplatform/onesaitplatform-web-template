<template>
  <div class="containerD">
    <!-- TOOLBAR COMPONENT -->
    <tool-bar-filter v-if="showToolBar" :dynFilters="globalFilters.filter(x => x.destination === 'topBarFilter')" :dashboardId="currentDashboardId" :editmode="handleEditMode" :showFilters="showFilters" :location="'topBarFilter'" :options="options" @show:datasources="showDatasources" />
    <div class="containerD__layout ods-flex ods-flex-wrap">
      <!--- SIDERBAR COMPONENT -> FILTERS, GADGETS -> TREE -->
      <side-bar-filter v-if="showSideBar"
       :showFilters="showFilters"
       :favorites="favorites"
       :dynFilters="globalFilters.filter(x => x.destination === 'sideBarFilter')"
       :dashboardId="dashboardId"
       :editmode="handleEditMode"
       :location="'sideBarFilter'"
       :datasources="datasources"
       :options="options"
       :close="closeSideBar"
       @add:datasource="updateGadgetDatasource"
       @drag:gadget="(g, e) => addGadget(g, e)"
       @open:add-fav-modal="(identification) => openAddFavModal(identification)"
       @open:remove-fav-modal="(gadget) => openRemoveFavModal(gadget)"
       v-on="$listeners"
       class="container__side-filter" />
       <!-- DASHBOARD WRAPPER -->
      <div  class="container__dashboard">
        <dashboard-wrapper v-if="dashboard != null" id="inst1" :editmode="handleEditMode" :dashboardReady="dashboardReady" :dashboard="dashboard" :params="params" :token="token" :platformbase="platformbase" :initialDatalink="initialDatalink" i18n="true"></dashboard-wrapper>
      </div>
      <!-- GADGET DRAWER -->
      <gadget-drawer v-model="drawer.visible" :gadget="gadget" :datasources="datasources" @update:name="updateGadgetName" @update:header="updateGadgetHeader" @update:datasource="updateGadgetDatasource" @update:settings="updateGadgetSettings" @close-end="closeDrawer"></gadget-drawer>

      <!-- DATASOURCES -->
      <datasource-drawer v-model="datasourceDrawer.visible" :gadget="gadget" :datasources="datasources" :init="datasourceDrawer.init" :counter="datasourceDrawer.counter" :ontologies="ontologies" :dashboard="dashboard" :options="options" :direction="'btt'" :width="'60%'" @close-end="closeDrawer" @reload:datasources="reloadDatasources" ></datasource-drawer>

      <!-- MODALS -->
      <add-fav-gadget-modal v-model="addFavModal.visible" @add:fav-gadget="(identification) => addFavGadget({ ...addFavModal.gadget, identification })"></add-fav-gadget-modal>
      <remove-fav-gadget-modal v-model="removeFavModal.visible" @remove:fav-gadget="removeFavGadget(removeFavModal.gadget)"></remove-fav-gadget-modal>
      <delete-gadget-modal v-model="deleteModal.visible" @delete:gadget="deleteGadget"></delete-gadget-modal>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import {
  addFavGadget,
  removeFavGadget,
  getGadget
} from '@/services/gadgets/gadgets'
import { getDashboard } from '@/services/dashboards/dashboards'
import { getDatasources } from '@/services/datasources/datasources'
import { getOntologies } from '@/services/ontologies/ontologies'
import dashboardWrapper from '../components/dashboard/VueWrapperComponent'
import ToolBarFilter from '../components/dashboard/filter/ToolBarFilter'
import SideBarFilter from '../components/dashboard/filter/SideBarFilter'
import GadgetDrawer from '@/components/gadgets/drawer/GadgetDrawer'
import DatasourceDrawer from '@/components/datasources/DatasourceDrawer'
import AddFavGadgetModal from '@/components/gadgets/modals/AddFavGadgetModal'
import RemoveFavGadgetModal from '@/components/gadgets/modals/RemoveFavGadgetModal'
import DeleteGadgetModal from '@/components/gadgets/modals/DeleteGadgetModal'
import { HTTP_PLATFORM } from '../store/modules/http'

export default {
  name: 'Dashboard',
  components: {
    dashboardWrapper,
    ToolBarFilter,
    SideBarFilter,
    GadgetDrawer,
    DatasourceDrawer,
    AddFavGadgetModal,
    RemoveFavGadgetModal,
    DeleteGadgetModal
  },
  props: [
    'dashboardReady'
  ],
  data: function () {
    return {
      dashboard: null,
      token: sessionStorage.sessionToken,
      platformbase: process.env.VUE_APP_PLATFORM, // http://localhost:8000 por nginx, 8080 contra lab https://lab.onesaitplatform.com
      params: {},
      api: {},
      jsongadget: {},
      i18n: false,
      currentDashboard: '',
      currentDashboardId: '',
      isAdmin: false,
      favorites: [],
      dashboardId: '',
      dashboardStarted: false,
      initialDatalink: {}, // { 'external-entity': [{ field: 'codent', value: "'0062'", op: '=' }], 'external-segment': [{ field: 'segment', value: "('MEX_62_1')", op: 'IN' }] },      // Global Filters Info.
      errorCounter: 0,
      componentOptions: {},
      ontologies: [],
      // GADGET CREATION COMPONENTS
      gadget: {
        datasource: {}
      },
      datasources: [],
      sidebar: {
        visible: true
      },
      drawer: {
        visible: false
      },
      addFavModal: {
        visible: false,
        gadget: {}
      },
      removeFavModal: {
        visible: false,
        gadget: null
      },
      deleteModal: {
        visible: false,
        callback: null
      },
      dashboardKey: 0,
      editModeFromManagement: null,
      // DATASOURCES
      datasourceDrawer: {
        visible: false,
        init: true,
        counter: 1
      },
      closeSideBar: false
    }
  },
  watch: {
    '$route.params': {
      // Watch for dashboard
      immediate: true,
      handler (params) {
        // get internal id of dashboard
        if (!params.dashboardId) return false
        var vapp = this
        var routeParams = params
        if (routeParams.edit != null || routeParams.edit !== 'undefined') { this.editModeFromManagement = routeParams.edit }
        const internalIdEndPoint = '/controlpanel/api/dashboards/dashboard/' + routeParams.dashboardId
        HTTP_PLATFORM.get(internalIdEndPoint).then(function (response) {
          if (response && response.data.id) {
            // check for filters available on session, and trigger them for the new dashboard.
            vapp.currentDashboard = routeParams.dashboardId
            vapp.currentDashboardId = response.data.id
            vapp.dashboardId = routeParams.dashboardId
            // check for additional params
            if (Object.keys(vapp.$route.query).length > 0) {
              var params = Object.keys(vapp.$route.query)
              var paramsValues = Object.values(vapp.$route.query)
              var paramsMap = {}
              for (let i = 0; i < params.length; i++) {
                if (params[i] !== 'dashboardId') {
                  paramsMap[params[i]] = paramsValues[i]
                }
              }
              vapp.params = paramsMap
            }
            // check initial filters and apply , then load the dashboard
            vapp.checkFilters()
          }
        })
      }
    }
  },
  // METHODS FROM DASHBOARDS
  methods: {
    // ACTIONS FROM STORES
    ...mapActions([
      'initGlobalFilters',
      'initDataFilter',
      'initDataRole',
      'checkInitialFilters',
      'filterDataFilter'
    ]),
    // RETRIVE DASHBOARD COMPONENT OPTIONS
    getComponentOptions () {
      const componentId = 'AdminDashboards'
      const role = this.getUser?.role
      const COMPONENTS = this.getAllowedComponents ? this.getAllowedComponents : {}
      const defaultOptions = COMPONENTS.definition.filter(x => x.id === componentId).map(y => y.defaultOptions)[0] || {}
      const roleOptions = COMPONENTS.navigation.filter(x => x.role === role).map(y => y.allowed)[0].filter(z => z.id === componentId)[0]?.roleOptions || {}
      const options = { ...defaultOptions, ...roleOptions }
      this.componentOptions = options
    },

    // LOAD DASHBOARD INTO VUEWRAPPER
    swapBoard (dashboardId) {
      this.dashboard = dashboardId
    },

    // SAVE DASHBOARD API
    saveDashboard () {
      window.DSApi.inst1.api.disableEventEdit()
      window.DSApi.inst1.api.msgApi({ command: 'saveDashboard', authorization: this.token, information: { dashboard: this.dashboard } })
      this.$notify({
        title: 'Dashboard saved',
        message: 'Dashboard successfully saved.',
        type: 'success',
        iconClass: 'ods-icon-save',
        duration: 2500,
        position: 'top-right',
        showClose: true
      })
      // clear cache after saving and enable event Edit
      window.DSApi.inst1.api.clearCache(this.dashboard)
      window.DSApi.inst1.api.enableEventEdit()
    },

    // LOAD FAVORITES
    loadFavorites () {
      var vapp = this
      var favoritesByApp = []
      const getAllEndPoint = '/controlpanel/api/favoritegadget/getallbyapp'
      var filterApp = 'app=' + this.getCurrentApplication

      // PLATFORM FAVORITES API CALL
      HTTP_PLATFORM.get(getAllEndPoint).then(function (response) {
        if (response.data.length > 0) {
          favoritesByApp = response.data.map(({ identification, metainf }) => ({ identification, metainf })).filter(x => x.metainf === filterApp)
        }
        vapp.favorites = []
        for (let i = 0; i < favoritesByApp.length; i++) {
          vapp.favorites.push({ id: favoritesByApp[i].identification, title: favoritesByApp[i].identification, type: 'favoritegadget' })
        }
      })
    },

    //  TO-DO: MAKE DYNAMICAL, INITIAL FILTERS DATA LOAD
    async loadFilters () {
      // NEW WAY TO LOAD DATA
      try {
        var userInfo = this.getUser
        // eslint-disable-next-line no-unused-vars
        const filterRole = await this.initDataRole({ user: userInfo.user, api: window.DSApi.inst1.api })
        // console.log('FILTER ROLE: ', filterRole)
        var filters = this.getFilterList
        var filterData = {}
        for (let i = 0; i < filters.length; i++) {
          // load data for each filter
          filterData = { filterId: filters[i], dashboardId: this.currentDashboard }
          // eslint-disable-next-line no-unused-vars
          const setup = await this.initDataFilter(filterData)
          // check filters between fields
          // if field has filterTo, apply initially the filter for filters persistence
          var field = (this.getGlobalFilters).filter(x => x.id === filters[i])[0]
          if (field && field.schema.filterTo.length > 0 && field.filter.activeFilter) {
            var filtered = field.schema.filterTo
            for (let y = 0; y < filtered.length; y++) {
              var action = { id: filtered[y], field: field.filter.field, value: field.filter.activeFilter }
              this.filterDataFilter(action)
              // console.log('Apply persistence filter from ', filters[i], ' to: ', filtered[y])
            }
          }
        }
      } catch (error) {
        console.log(error)
        return error
      }
    },
    // DASHBOARD EVENT: dashboard loaded, when all gadgets are loaded. Events: 1.- dashboard loaded, 2.- addNewFavoriteGadget
    dashboardLoaded (event) {
      if (event.data === 'dashboardloaded') {
        // adjust dashboard after all gadgets are loaded
        window.dispatchEvent(new Event('resize'))

        // LOAD FAVORITES
        if (this.showFavorites) { this.loadFavorites() }

        // LOAD FILTERS
        if (this.showFilters) { this.loadFilters() }
      }

      if (event.data === 'addNewFavoriteGadget') {
        // RELOAD FAVORITES AFTER CREATE A NEW ONE
        // console.log('load favorites after create a new one...')
        if (this.showFavorites) { this.loadFavorites() }
      }
    },

    // CHECK AND APPLY FILTERS AND LOAD DASHBOARD FINALLY
    checkFilters () {
      if (this.showFilters) {
        // get initialdatalink
        this.checkInitialFilters({ id: this.currentDashboard })

        // set for initialdatalink
        this.initialDatalink = this.getInitialDataLink
      }
      // finally load dashboard
      console.log('loading Dashboard... ', this.currentDashboardId)
      this.swapBoard(this.currentDashboardId)
    },

    // DASHBOARD EVENT: gadget select
    gadgetSelect (e) {
      const vapp = this
      vapp.jsongadget = e.detail
    },

    // AUX: CHECK if a obj and key exists.-
    checkExists (key, obj) {
      obj = obj || window
      key = key.split('.') || key
      if (typeof obj !== 'object') {
        return false
      }
      while (key.length && (obj = obj[key.shift()]) && typeof obj === 'object' && obj !== null) {
        return (!key.length && typeof obj !== 'undefined')
      }
    },

    // RESIZE DASHBOARD
    resize () {
      if (this.checkExists('inst1', window.DSApi)) { window.DSApi.inst1.api.forceRender() }
    },
    checkSession (event) {
      if (event.type === 'ErrorConnect') {
        console.log('ERROR DE CONEXION o REFRESH TOKEN: redirect to login ', event)
        localStorage.removeItem('vuex')
        localStorage.removeItem('vue-token')
        localStorage.removeItem('vue-refresh-token')
        localStorage.clear()
        sessionStorage.clear()
        // logout by expiration notification
        if (this.errorCount() === 1) {
          var status = event.detail.status
          this.errorCount()
          var message = status === -1 || status === 404 ? 'Session expired, You must log-in again in the App' : status === 500 ? 'Network Problems.' : 'Error Connection.'
          this.$notify({
            title: 'The session has expired',
            message: message,
            type: 'success',
            iconClass: 'ods-icon-filter',
            duration: 10000,
            position: 'top-right',
            showClose: true
          })
        }
        sessionStorage.setItem('sessionOut', 1)
        sessionStorage.setItem('sessionOutMessage', message)
      }
      // logout and redirect
      if (status === -1 || status === 404) {
        const appId = process.env.VUE_APP_APPLICATION
        setTimeout(function () { window.location.href = '/web/' + appId + '/login' }, 4000)
      }
    },
    errorCount () {
      this.errorCounter++
      var count = this.errorCounter
      return count
    },
    // GADGET MANAGEMENT METHODS ---
    gadgetLoaded (event) {
      if (!this.dashboardStarted) { this.dashboardStarted = true }
      this.api = window.DSApi.inst1.api
      this.api.enableEventEdit()
      this.api.disableToolBar()
      // LOAD FILTERS
      this.loadFilters()
    },

    // create param object and set up values by default in a recursive way
    recSetParams (sections, formModel) {
      var that = this
      sections.forEach(function (s) {
        if (s.type !== 'section' && s.type !== 'section-array') {
          if (s.type === 'checkbox') {
            formModel[s.name] = s.default ? s.default : false
          } else if (s.type === 'input-number') {
            formModel[s.name] = s.default ? s.default : 0
          } else {
            formModel[s.name] = s.default ? s.default : ''
          }
        } else {
          if (s.type === 'section-array') {
            formModel[s.name] = []
          } else if (s.type === 'section') {
            formModel[s.name] = {}
            that.recSetParams(s.elements, formModel[s.name])
          }
        }
      })
    },

    getFormModel (sections) {
      const formModel = {}
      this.recSetParams(sections, formModel)
      return { parameters: formModel }
    },

    async addGadget (gadget, e) {
      const config = JSON.parse(gadget.config)
      const template = gadget.template ? gadget.template.identification || gadget.template : gadget.identification
      this.gadget.header = { title: { text: gadget.identification }, enable: false }
      this.gadget.sections = config.gform
      // e.dataTransfer.setData('title', gadget.identification)
      e.dataTransfer.setData('type', 'livehtml')
      e.dataTransfer.setData('id', 'livehtml_' + new Date().getTime())
      e.dataTransfer.setData(
        'config',
        JSON.stringify({
          params:
            config.params ||
            (config.parameters ? { parameters: config.parameters } : null) ||
            this.getFormModel(config.gform),
          // content: template.html,
          // contentcode: template.js,
          // sections: this.gadget.sections,
          template: template,
          subtype: 'vueJSODS',
          // category: gadget.category || template.identification,
          datasource: gadget.datasource || this.gadget.datasource
        })
      )
    },

    openRemoveModal (event) {
      this.deleteModal.visible = true
      this.deleteModal.callback = event.detail.callback
    },

    deleteGadget () {
      this.deleteModal.callback()
      this.deleteModal.visible = false
      this.sidebar.visible = true
      this.drawer.visible = false
    },

    openAddFavModal (gadget) {
      const config = JSON.parse(gadget.config)
      this.addFavModal.gadget = {
        ...gadget,
        idDatasource: config.datasource.name,
        idGadget: gadget.id,
        idGadgetTemplate: gadget.template.identification,
        type: 'livehtml'
      }
      this.addFavModal.visible = true
    },

    async addFavGadget (gadget) {
      try {
        await addFavGadget(gadget)
        this.dashboardKey++
      } finally {
        this.addFavModal.visible = false
      }
    },

    openRemoveFavModal (gadget) {
      this.removeFavModal.visible = true
      this.removeFavModal.gadget = gadget.favGadget
        ? gadget.favGadget.identification
        : gadget.text
    },

    async removeFavGadget (gadgetId) {
      try {
        await removeFavGadget(gadgetId)
        this.dashboardKey++
      } finally {
        this.removeFavModal.visible = false
        this.drawer.visible = false
      }
    },
    // gadget drawer
    async openDrawer (gadget) {
      this.gadget = {}
      this.drawer.visible = false
      this.sidebar.visible = false
      this.gadget = gadget.detail || gadget
      const template = await getGadget(this.gadget.template, {
        group: 'custom'
      })
      this.gadget.sections =
        gadget.sections || JSON.parse(template.config).gform
      this.drawer.visible = true
      const elements = this.$el.querySelectorAll('gridster-item')
      elements.forEach((el) => el.classList.add('gridster-item--no-selected'))
      const selected = this.$el.querySelector(
        `#${this.gadget.id} gridster-item`
      )
      if (selected) {
        selected.classList.add('gridster-item--selected')
        selected.classList.remove('gridster-item--no-selected')
      }
      window.DSApi.inst1.api.forceRender()
    },

    closeDrawer (type) {
      console.log('AFTER CLOSE DRAWER ON PARENT, ', type)
      if (type === 'datasource') {
        // datasource
        this.datasourceDrawer.init = true
        this.gadget = {}
        this.sidebar.visible = true
      } else {
        // gadget
        const elements = this.$el.querySelectorAll('gridster-item')
        elements.forEach((el) =>
          el.classList.remove(
            'gridster-item--no-selected',
            'gridster-item--selected'
          )
        )
        this.gadget = {}
        this.sidebar.visible = true
      }
    },

    updateGadgetName (name) {
      this.gadget.header.title.text = name
      window.DSApi.inst1.api.forceRender()
    },

    updateGadgetHeader (show) {
      this.gadget.header.enable = show
      window.DSApi.inst1.api.forceRender()
    },

    // update datasource or open drawer for datasources if #NEW or #EDIT-datasourceId
    updateGadgetDatasource (datasource) {
      console.log('DASHBOARD: ', datasource)
      if (datasource.name === '#NEW') {
        this.drawer.visible = false
        this.sidebar.visible = false
        this.closeSideBar = true
        this.showDatasources()
        return false
      }
      // update gadget datasource when is not a new one
      this.closeSideBar = false
      this.gadget.datasource = JSON.parse(JSON.stringify(datasource))
      window.DSApi.inst1.api.forceRender()
    },

    updateGadgetSettings (settings) {
      var pathsplit = settings.path.split('.')
      var objref = this.gadget.params.parameters
      var name = settings.name
      var value = settings.value
      if (pathsplit.length === 0) {
        objref[name] = value
      } else {
        for (let i = 0; i < pathsplit.length; i++) {
          var step = pathsplit[i]
          if (pathsplit.length - 1 === i) {
            objref[step][name] = value
          } else {
            objref = objref[step]
          }
        }
      }
      // update the gadget params and refresh with forceRender
      this.gadget.params = JSON.parse(JSON.stringify(this.gadget.params))
      window.DSApi.inst1.api.forceRender()
      // update ds to force update in data
      this.gadget.datasource = JSON.parse(JSON.stringify(this.gadget.datasource))
      window.DSApi.inst1.api.forceRender()
    },
    // datasources
    async getDatasources () {
      var config = {}
      this.datasources = []
      // tag system
      var tag = ''
      if (this.options) {
        tag = this.options.tag ?? ''
        if (tag) config.tag = tag
      }
      const datasources = await getDatasources(config)
      var datasourcesToHide = this.getHiddenDatasources || []
      // apply unique (api duplicate owner datasources with proyect datasources)
      this.datasources = datasources.filter((v, i, a) => a.findIndex(v2 => (v2.identification === v.identification)) === i)
      if (datasourcesToHide.length > 0) {
        console.log('ds: ', this.datasources, ' hide: ', datasourcesToHide)
        this.datasources = this.datasources.filter(x => !datasourcesToHide.includes(x.identification))
      }
    },
    reloadDatasources (counter) {
      console.log('Reloading Datasources after creation of new one in datasources management')
      this.datasourceDrawer.counter = counter + 1
      this.getDatasources()
    },
    showDatasources () {
      console.log('toggle datasources component')
      this.datasourceDrawer.visible = !this.datasourceDrawer.visible
    },
    hideDatasources () {
      console.log('hide datasources component')
      this.datasourceDrawer.visible = false
    },
    async loadOntologies () {
      var config = {}
      this.ontologies = []
      // project and role filter if tag system is enabled
      const project = process.env.VUE_APP_PROJECT
      const role = this.getUser?.role
      config.project = project
      config.role = role
      // tag system
      var tag = ''
      if (this.options) {
        tag = this.options.tag ?? ''
        if (tag) config.tag = tag
      }
      try {
        this.ontologies = await getOntologies(config)
      } catch (error) {
        console.log('Error Query Ontologies ', error)
        this.ontologies = []
      } finally {
        console.log('loadOntologies finished')
      }
    }
  },
  computed: {
    // COMPUTED STORE GETTERS
    ...mapGetters({
      isMultipleApp: 'isMultipleApp',
      getCurrentApplication: 'getCurrentApplication',
      globalFilters: 'getGlobalFilters',
      getGlobalFilters: 'getGlobalFilters',
      getFilterList: 'getFilterList',
      getUser: 'getUser',
      getGlobalIsLoaded: 'getGlobalIsLoaded',
      getInitialDataLink: 'getInitialDataLink',
      getCustomization: 'getCurrentCustomization',
      getHiddenDatasources: 'getHiddenDatasources',
      getAllowedComponents: 'getAllowedComponents'
    }),
    options () {
      return this.componentOptions
    },
    // SHOW OR HIDE TOOLBAR SECTIONS IF NO FILTERS AND VISUALIZATION MODE IS NOT EDIT.
    showToolBar () {
      var dashboardActive = this.$route.params.dashboardId || null
      var hasGlobalFilters = this.globalFilters.filter(x => x.destination === 'topBarFilter').map(y => y.schema.authorizations).filter(z => (z.includes(dashboardActive) || z.length === 0)).length > 0
      return hasGlobalFilters || this.handleEditMode // almost 1 filter and not edit mode
    },
    showSideBar () {
      var dashboardActive = this.$route.params.dashboardId || null
      var hasGlobalFilters = this.globalFilters.filter(x => x.destination === 'sideBarFilter').map(y => y.schema.authorizations).filter(z => (z.includes(dashboardActive) || z.length === 0)).length > 0
      return hasGlobalFilters || this.handleEditMode // almost 1 filter or edit mode
    },
    // ALLOW EDIT MODE FOR FAVORITE DASHBOARD
    handleEditMode: function () {
      var editMode = false
      var favoriteDashboard = this.isMultipleApp ? sessionStorage.username + '_' + this.getCurrentApplication + '_fav' : sessionStorage.username + '_fav'
      editMode = this.currentDashboard === favoriteDashboard
      // edit from dashboard management
      if (this.editModeFromManagement != null) { editMode = this.editModeFromManagement }
      return editMode
    },
    showFavorites () {
      var showFavorites = true
      var customization = this.getCustomization || {}
      if (customization && customization.showfavorites !== 'undefined') {
        showFavorites = customization.showfavorites
      }
      return showFavorites
    },

    showFilters () {
      var showFilters = true
      var customization = this.getCustomization || {}
      if (customization && customization.showFilters !== 'undefined') {
        showFilters = customization.showFilters
      }
      return showFilters
    },

    datasourcesShow () {
      return this.datasourceDrawer.visible
    },

    redirectDashboard () {
      if (sessionStorage.getItem('redirect') !== null || sessionStorage.getItem('redirect') !== undefined) {
        var redirectRoute = JSON.parse(sessionStorage.getItem('redirect'))
        return redirectRoute
      } else {
        return ''
      }
    }
  },

  created () {
    // DASHBOARDS COMPONENT OPTIONS (tags system)
    this.getComponentOptions()

    // LOAD DYN FILTERS IF NOT LOADED
    if (!this.getGlobalIsLoaded) { this.initGlobalFilters() }

    // LOAD DATASOURCES
    this.getDatasources()

    // LOAD ONTOLOGIES for datasources
    this.loadOntologies()

    // DASHBOARD KEY
    this.dashboardKey++
  },
  mounted () {
    window.addEventListener('gadgetloaded', this.gadgetLoaded)
    window.addEventListener('gadgetselect', this.openDrawer)
    window.addEventListener('newgadgetcreated', this.openDrawer)
    window.addEventListener('gadgetdelete', this.openRemoveModal)
    window.addEventListener('resize', this.resize)
    // window.addEventListener('gadgetselect', this.gadgetSelect)
  },

  beforeDestroy () {
    window.removeEventListener('gadgetloaded', this.gadgetLoaded)
    window.removeEventListener('gadgetselect', this.openDrawer)
    window.removeEventListener('newgadgetcreated', this.openDrawer)
    window.removeEventListener('gadgetdelete', this.openRemoveModal)
    window.removeEventListener('resize', this.resize)
    // window.removeEventListener('gadgetselect', this.gadgetSelect)
  },

  // add breadcrum info of dashboard
  // TO-DO: retry breadcrum object in i18n and if not exist dashboad key, use default.
  async beforeRouteEnter (to, from, next) {
    if (!to.params.dashboardId) next()
    const id = to.params.dashboardId
    const dashboard = await getDashboard(id)
    to.params.breadcrumb = dashboard.identification
    next()
  }
}
</script>

<style scoped lang="scss">
.containerD {
  &__layout {
    display: flex;
  }

  &__dashboard {
    width: 100%;
    overflow: hidden;
    margin: rem(8);
    position: relative;
    display:block;
  }
}
::v-deep .ods-accordion {
    padding: 0 rem(16);
    &-item {
      &:first-child {
        border-top: 0;
      }
      &__wrap {
        padding: 0 rem(8);
      }
      &__header {
        padding: rem(20) rem(8);
      }
      &__content {
        .settings-form {
          .ods-form-item {
            margin: rem(12) 0;
          }
        }
      }
    }
  }

  .gridster-item--selected {
    border: 1px solid red;
  }

  .gridster-item--no-selected {
    border: none;
  }
</style>
