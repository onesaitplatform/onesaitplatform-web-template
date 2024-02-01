// IMPORT
import moment from 'moment'

// FILTERS STORE
// CONFIGURATION STATE
const state = {
  globalFilter: [],
  isGlobalFilterLoaded: false,
  filterList: [],
  initialDataLink: {},
  role: '',
  isAdmin: false
}

// Datasources for user role and configuration actions
const roleDs = {
  userDS: process.env.VUE_APP_USERDS,
  appDS: process.env.VUE_APP_APPDS
}

// GETTERS
const getters = {
  getGlobalFilters (state) {
    return state.globalFilter
  },
  getGlobalIsLoaded (state) {
    return state.isGlobalFilterLoaded
  },
  getFilterList (state) {
    return state.filterList
  },
  getInitialDataLink (state) {
    return state.initialDataLink
  },
  getRole (state) {
    return state.role
  },
  getIsAdmin (state) {
    return state.isAdmin
  },
  getUserRoleDS () {
    return roleDs.userDS
  },
  getAppRoleDS () {
    return roleDs.appDS
  }
}

// AUXILIARY FUNCTIONS
var getFiltersByApp = function (field, role, appVersion) {
  var filterResult = []
  if (appVersion === 0) {
    return filterResult
  }
  if (appVersion < 2) {
    // previous version using user_entity
    return typeof role !== 'object' ? [] : typeof role === 'string' ? [{ field: field, exp: "'" + role + "'", op: '=' }] : [{ field: field, exp: role, op: '=' }]
  } else {
    // new version using user_app_config: role is an object with multiples keys that can filter the DS
    // if field match with any key of role, then apply this filter
    for (var key in role) {
      if (field === key) {
        // match field filter
        const filter = role[key]
        var multipleFilters = []
        for (let i = 0; i < filter.length; i++) {
          // IN FILTER(1)
          if (filter[i].operator && filter[i].operator.toUpperCase() === 'IN') {
            // IN operator
            const inValue = filter[i].type && filter[i].type.toUpperCase() === 'STRING' ? '(' + filter[i].values.map(x => "'" + x + "'").join() + ')' : '(' + filter[i].values.join() + ')'
            filterResult = [{ field: field, exp: inValue, op: 'IN' }]
            return filterResult
          } else if (filter[i].operator && filter[i].operator.toUpperCase() === 'BETWEEN') {
            // TO-DO: BETWEEN FILTER (1)
            const betweenValue = filter[i].type && filter[i].type.toUpperCase() === 'STRING' ? filter[i].values.map(x => "'" + x + "'").join(' and ') : filter[i].values.join(' and ')
            filterResult = [{ field: field, exp: betweenValue, op: 'BETWEEN' }]
            return filterResult
          } else {
            // STANDARD FILTER (1 or 2 for intervals)
            var standardMultipleValue = filter[i].type.toUpperCase() === 'STRING' ? '"' + filter[i].values[0] + '"' : filter[i].type.toUpperCase() === 'NUMBER' ? filter[i].values[0] : filter[i].values[0]
            var standardMultipleOp = filter[i].operator
            multipleFilters.push({ field: field, exp: standardMultipleValue, op: standardMultipleOp })
          }
          filterResult = multipleFilters
        }
        // Return filter
        return filterResult
      } else {
        // no-match
        return filterResult
      }
    }
  }
}

// AUX for fields date and daterange that have dynamic date fields configuration
var getDynamicDate = function (date, format) {
  var ranges = {
    today: moment().format(format).toString(),
    yesterday: moment().subtract(1, 'day').format(format).toString(),
    startWeek: moment().startOf('week').format('dddd') === 'Sunday' ? moment().startOf('week').add('d', 1).format(format).toString() : moment().startOf('week').format(format).toString(),
    endWeek: moment().endOf('week').format(format).toString(),
    oneWeekAgo: moment().subtract(7, 'day').format(format).toString(),
    startMonth: moment().startOf('month').format(format).toString(),
    endMonth: moment().subtract(1, 'month').startOf('month').format(format).toString(),
    oneMonthsAgo: moment().subtract(1, 'months').format(format).toString(),
    firstDayMonthAgo: moment().subtract(1, 'months').startOf('month').format(format),
    firstDayTwoMonthsAgo: moment().subtract(2, 'months').startOf('month').format(format),
    twoMonthsAgo: moment().subtract(2, 'months').format(format).toString(),
    threeMonthsAgo: moment().subtract(3, 'months').format(format).toString(),
    sixMonthsAgo: moment().subtract(6, 'months').format(format).toString(),
    nineMonthsAgo: moment().subtract(9, 'months').format(format).toString(),
    yearAgo: moment().subtract(1, 'year').format(format).toString(),
    startYear: moment().startOf('year').format(format).toString()
  }
  return ranges[date] || date
}

// ACTIONS
const actions = {
  // RESET GLOBAL FILTERS
  resetGlobalFilters ({ commit, state }) {
    commit('RESET_LOADERS')
    commit('RESET_GLOBAL_FILTERS')
  },

  updateOutsideGlobalFilter ({ commit, state }, payload) {
    commit('UPDATE_GLOBAL_FILTER', { id: payload.filterId, key: 'filter', elem: 'activeFilter', data: payload.value })
  },

  // SET GLOBAL FILTER FROM CONF. AND SET IN FILTERS
  initGlobalFilters ({ commit, rootGetters }) {
    var currentGlobalFilter = rootGetters.getCurrentFilters
    commit('SET_GLOBAL_FILTER', currentGlobalFilter)

    // SET FILTER LIST
    var filters = currentGlobalFilter.length > 0 ? currentGlobalFilter.map(x => x.id).sort((a, b) => a.filterOrder - b.filterOrder) : []
    commit('SET_FILTER_LIST', filters)

    // SET LOADED (to avoid load again)
    commit('SET_GLOBAL_LOADED', true)
  },

  // SET DATA ROLE (some filters need to filter by role)
  async initDataRole ({ commit, getters, rootGetters }, action) {
    try {
      var currentRole = ''
      var user = '"' + action.user + '"'
      var app = '"' + rootGetters.getCurrentApplication + '"'
      var roleApp = []
      var appVersion = (rootGetters.getCurrentApp).appVersion ? (rootGetters.getCurrentApp).appVersion : 0
      if (appVersion === 0) {
        // NO SECURITY PLUGIN
        commit('SET_ROLE_FILTER', currentRole)
        commit('IS_ADMIN_ROLE', false)
        return currentRole
      }
      if (appVersion < 2) {
        // previous version using user_entity
        console.log('NORMAL VERSION...user_entity: ', getters.getUserRoleDS)
        const role = await window.DSApi.inst1.api.ds.from(getters.getUserRoleDS).filter('user_entity.user', user).exec()
        currentRole = role[0].user_entity.org_niv1
        commit('SET_ROLE_FILTER', currentRole)
        if (currentRole === '#admin') { commit('IS_ADMIN_ROLE', true) } else { commit('IS_ADMIN_ROLE', false) }
        return currentRole
      } else {
        // new version using user_app_config
        console.log('NEW VERSION...user_app_config', getters.getAppRoleDS)
        // mount filters: user and appId (realm)
        const filters = [{ field: 'user', exp: user }, { field: 'app', exp: app }]
        roleApp = await window.DSApi.inst1.api.ds.from(getters.getAppRoleDS).filter(filters).exec()
        currentRole = JSON.parse(roleApp[0].config)
        if (roleApp[0].role === '#admin') { commit('IS_ADMIN_ROLE', true) } else { commit('IS_ADMIN_ROLE', false) }
        commit('SET_ROLE_FILTER', currentRole)
        return currentRole
      }
    } catch (error) {
      console.log(error)
      return error
    }
  },

  // SET DATA TO FILTER ITEM
  async initDataFilter ({ commit, getters, rootGetters }, data) {
    try {
      // console.log('Is Admin? ', getters.getIsAdmin, ' User: ', (rootGetters.getUser).user)
      var filterId = data.filterId
      var dashboardId = data.dashboardId
      var appVersion = (rootGetters.getCurrentApp).appVersion ? (rootGetters.getCurrentApp).appVersion : 0
      var filterConfiguration = (getters.getGlobalFilters).filter(x => x.id === filterId).map(y => y.filter)[0]
      var filterSchema = (getters.getGlobalFilters).filter(x => x.id === filterId).map(y => y.schema)[0]
      // if filter is not authorized in this dashboard is not loaded
      var authorizations = filterSchema.authorizations
      var authorizated = true
      if (authorizations.length > 0) {
        authorizated = authorizations.filter(x => x === dashboardId).length > 0
      }
      var filterData = []
      var roleFilter = []

      if (filterConfiguration.source !== '' && authorizated) {
        // init data Filter

        // if Admin load DS
        if (getters.getIsAdmin) {
          roleFilter = []
          filterData = await window.DSApi.inst1.api.ds.from(filterConfiguration.source).filter(roleFilter).exec()
          filterData = filterData.length > 0 ? filterData.map(x => ({ ...x, id: Math.random() })) : filterData // set uniqueID
          commit('UPDATE_GLOBAL_FILTER', { id: filterId, key: 'filter', elem: 'dataSource', data: filterData }) // original data
          commit('UPDATE_GLOBAL_FILTER', { id: filterId, key: '', elem: 'data', data: filterData }) // real data (can be filtered)
        } else {
          // if not Admin load filters depends on appVersion
          if (filterConfiguration && filterConfiguration.isFilterable === true) {
            var type = filterConfiguration.isFilterable ? filterConfiguration.filterBy : ''
            if (type === 'role') {
              // filter by role
              var role = getters.getRole
              roleFilter = getFiltersByApp(filterConfiguration.field, role, appVersion)
              // console.log('Role Filter to APPLY: ', JSON.stringify(roleFilter))
              filterData = await window.DSApi.inst1.api.ds.from(filterConfiguration.source).filter(roleFilter).exec()
              filterData = filterData.length > 0 ? filterData.map(x => ({ ...x, id: Math.random() })) : filterData // set uniqueID
              commit('UPDATE_GLOBAL_FILTER', { id: filterId, key: 'filter', elem: 'dataSource', data: filterData }) // original data
              commit('UPDATE_GLOBAL_FILTER', { id: filterId, key: '', elem: 'data', data: filterData }) // real data (can be filtered)

              // if just one value, hide and set activeFilter
              if (filterData.length === 1) {
                commit('UPDATE_GLOBAL_FILTER', { id: filterId, key: 'filter', elem: 'activeFilter', data: filterSchema.multi ? [filterData[0][filterSchema.key !== '' ? filterSchema.key : filterConfiguration.field]] : filterData[0][filterSchema.key !== '' ? filterSchema.key : filterConfiguration.field] }) // check multiple or single and normal or key field (centralized configuration)
                commit('UPDATE_GLOBAL_FILTER', { id: filterId, key: 'schema', elem: 'isVisible', data: false })
              }
            }
          } else {
            // no-filter
            role = getters.getRole
            roleFilter = getFiltersByApp(filterConfiguration.field, role, appVersion)
            filterData = await window.DSApi.inst1.api.ds.from(filterConfiguration.source).filter(roleFilter).exec()
            filterData = filterData.length > 0 ? filterData.map(x => ({ ...x, id: Math.random() })) : filterData
            commit('UPDATE_GLOBAL_FILTER', { id: filterId, key: 'filter', elem: 'dataSource', data: filterData }) // no-filter  original data
            commit('UPDATE_GLOBAL_FILTER', { id: filterId, key: '', elem: 'data', data: filterData }) // no-filter real data (can be filtered)

            // if just one value, hide and set activeFilter
            if (filterData.length === 1) {
              commit('UPDATE_GLOBAL_FILTER', { id: filterId, key: 'filter', elem: 'activeFilter', data: filterSchema.multi ? [filterData[0][filterSchema.key !== '' ? filterSchema.key : filterConfiguration.field]] : filterData[0][filterSchema.key !== '' ? filterSchema.key : filterConfiguration.field] }) // check multiple or single and normal or key field (centralized configuration)
              commit('UPDATE_GLOBAL_FILTER', { id: filterId, key: 'schema', elem: 'isVisible', data: false })
            }
          }
        }

        // return filters
        return filterData
      } else {
        // console.log(filterConfiguration.id, filterConfiguration.source === '' ? ' Filter with no datasource needed.' : ' Filter not Authorized for this Dashboard')
      }
      // return data
      return filterData
    } catch (error) {
      console.log(error)
      return error
    }
  },

  // FILTER DATA IN FILTER ITEM BY OTHER FILTER
  async filterDataFilter ({ commit, getters }, action) {
    try {
      var filterId = action.id
      var filterValue = action.value
      var filterField = action.field
      var filterData = (getters.getGlobalFilters).filter(x => x.id === filterId).map(y => y.filter.dataSource)[0]
      // console.log('filterData:', JSON.stringify(filterData), filterField, filterValue)
      var newDataFiltered = Array.isArray(filterValue) ? filterData.filter(function (e) { return filterValue.includes(e[filterField]) }) : filterData.filter(x => x[filterField] === filterValue) || filterData
      commit('UPDATE_GLOBAL_FILTER', { id: filterId, key: '', elem: 'data', data: newDataFiltered })
      return newDataFiltered
    } catch (error) {
      console.log(error)
    }
  },

  // NEW SEND FILTER VECTORIAL
  sendNewFilter ({ commit, getters, rootGetters }, payload) {
    if (!window.DSApi) { console.log('dashboard is not already loaded, skip filters'); return false }
    // read from filters, mount array of filters and send it.
    var filterId = payload.filterId || 'external-filters'
    var dashboardId = payload.dashboardId
    var filterConfiguration = getters.getGlobalFilters
    var allowed = []
    var filters = {}
    var item = {}

    // AUXILIAR FUNCTIONS
    var isAuthorized = function (item) {
      var authorizations = item.schema.authorizations || []
      var authorization = true
      if (authorizations.length > 0) {
        authorization = authorizations.filter(x => x === dashboardId).length > 0
        if (!authorization) { console.log('Filter Field ', item.id, ' is not authorized.') }
        return authorization
      } else {
        return true
      }
    }
    // get operator from filter
    var getOp = function (item) {
      var filterOp = '='
      filterOp = item.schema.fieldType === 'datePicker' ? 'between' : item.schema.multi ? 'IN' : '='
      return filterOp
    }
    // get value from filter
    var getValue = function (item) {
      var filterValue = ''
      var parsedValue = ''
      var keyParser = (data) => {
        if ((typeof data === 'string' && data === '') || (typeof data === 'object' && data.length === 0)) { return data } else { if (typeof data === 'string') { return data.split('-')[1] } else { return data.map(x => x.split('-')[1]) } }
      }
      if (item.schema.fieldType === 'datePicker') {
        filterValue = item.filter.activeFilter === '' ? '' : item.filter.activeFilter[0] + ' and ' + item.filter.activeFilter[1]
      } else if (item.schema.fieldType === 'SelectList') {
        if (item.schema.multi) {
          if (item.filter.activeFilter.length === 0) {
            filterValue = null
          } else {
            // TO-DO: rellenar valor para multiple teniendo en cuenta el key
            if (item.schema.key !== '' && item.schema.key !== undefined) { parsedValue = keyParser(item.filter.activeFilter) } else { parsedValue = item.filter.activeFilter } // if key for UniqueID
            filterValue = item.schema.type === 'string' ? '(' + parsedValue.map(x => "'" + x + "'").join(',') + ')' : '(' + parsedValue.join(',') + ')'
          }
        } else {
          // TO-DO: rellenar valor para simple teniendo en cuenta el key
          if (item.schema.key !== '' && item.schema.key !== undefined) { parsedValue = keyParser(item.filter.activeFilter) } else { parsedValue = item.filter.activeFilter } // if key for UniqueID
          if (item.filter.activeFilter === '') { parsedValue = null }
          filterValue = parsedValue
        }
      }
      return filterValue
    }

    // 1) filter from globalFilters only authorized for this dashboard.
    allowed = filterConfiguration.filter(x => isAuthorized(x))

    // 2) mount object of available Filters like filters = { idAsociacion: { value: "('W')", op: 'IN', name: 'IdAsociacion', typeAction: 'filter' }, IdTipoEmpresa: { value: "('W_GRD')", op: 'IN', name: 'IdTipoEmpresa', typeAction: 'filter' } }
    for (let i = 0; i < allowed.length; i++) {
      item = allowed[i]
      var itemFieldId = filterConfiguration.filter(x => x.id === item.id).map(y => y.filter.field)[0]
      filters[itemFieldId] = { name: itemFieldId, typeAction: 'filter', op: getOp(item), value: getValue(item) }
    }

    // 3) send multiple sendFilters
    if (JSON.stringify(filters) === sessionStorage.getItem('lastFilter')) {
      console.log('Skip sendFilter, no changes')
    } else {
      console.log('|--> Allowed Filters: ', allowed.map(x => x.id).join(','))
      console.log('     |--> Send Filters: ', filterId, dashboardId, filterConfiguration, filters)
      window.DSApi.inst1.api.sendFilter(filterId, filters)
      sessionStorage.setItem('lastFilter', JSON.stringify(filters))
    }
  },

  // SEND FILTER TO DASHBOARD
  sendFilter ({ commit, getters }, filter) {
    if (window.DSApi === undefined) { console.log('waiting for DSApi in sendFilter...'); return false }
    var filterId = filter.filterId
    var filterValue = filter.value
    var filterOp = filter.op || ''
    var filterConfiguration = (getters.getGlobalFilters).filter(x => x.id === filterId)[0]
    var externalFilterId = filterConfiguration.filter.id
    var sendValueEnable = filterConfiguration.filter.isSendingValues !== undefined ? filterConfiguration.filter.isSendingValues : false

    // AUX: for fields that use key (when field not have uniqueId key generates one´s with format: {parent-value} always the 2nd value is the filter value. )
    var keyParser = (data) => {
      if ((typeof data === 'string' && data === '') || (typeof data === 'object' && data.length === 0)) {
        return data
      } else {
        if (typeof data === 'string') { return data.split('-')[1] } else { return data.map(x => x.split('-')[1]) }
      }
    }

    // field types
    if (filterConfiguration.schema.fieldType === 'datePicker') {
      if (filterValue === '') { filterValue = null }
      window.DSApi.inst1.api.sendFilter(externalFilterId, filterConfiguration.filter.field, filterValue, filterOp)
      if (sendValueEnable) { window.DSApi.inst1.api.sendValue('SV-' + externalFilterId, filterConfiguration.filter.field, '{field: ' + filterConfiguration.filter.field + ', value:' + filterValue + ', operator: "' + filterOp + '"}') }
      commit('UPDATE_GLOBAL_FILTER', { id: filterId, key: 'filter', elem: 'activeFilter', data: filterValue })
    } else if (filterConfiguration.schema.fieldType === 'SelectList') {
      // SelectList
      if (filterConfiguration.schema.multi) {
        var activeValue = ''
        // multiple-value filter
        if (filterValue.length === 0) {
          // special filter null
          window.DSApi.inst1.api.sendFilter(externalFilterId, filterConfiguration.filter.field, null, 'IN')
          if (sendValueEnable) { window.DSApi.inst1.api.sendValue('SV-' + externalFilterId, filterConfiguration.filter.field, null); console.log('SENDING SENDVALUE: SV-' + externalFilterId) }
          commit('UPDATE_GLOBAL_FILTER', { id: filterId, key: 'filter', elem: 'activeFilter', data: [] })
        } else {
          // normal multi-value to SQL(IN) sentence
          if (filterConfiguration.schema.key !== '' && filterConfiguration.schema.key !== undefined) { activeValue = keyParser(filterConfiguration.filter.activeFilter) } else { activeValue = filterConfiguration.filter.activeFilter } // if key for UniqueID
          var multiValue = filterConfiguration.schema.type === 'string' ? '(' + activeValue.map(x => "'" + x + "'").join(',') + ')' : '(' + activeValue.join(',') + ')'
          window.DSApi.inst1.api.sendFilter(externalFilterId, filterConfiguration.filter.field, multiValue, 'IN')
          if (sendValueEnable) { window.DSApi.inst1.api.sendValue('SV-' + externalFilterId, filterConfiguration.filter.field, '{field: ' + filterConfiguration.filter.field + ', value:' + multiValue + ', operator: "IN"}'); console.log('SENDING SENDVALUE: SV-' + externalFilterId) }
          commit('UPDATE_GLOBAL_FILTER', { id: filterId, key: 'filter', elem: 'activeFilter', data: filterValue })
        }
      } else {
        // single-value filter
        if (filterConfiguration.schema.key !== '' && filterConfiguration.schema.key !== undefined) { activeValue = keyParser(filterConfiguration.filter.activeFilter) } else { activeValue = filterConfiguration.filter.activeFilter } // if key for UniqueID
        if (filterValue === '') { activeValue = null }
        window.DSApi.inst1.api.sendFilter(externalFilterId, filterConfiguration.filter.field, activeValue)
        if (sendValueEnable) { window.DSApi.inst1.api.sendValue('SV-' + externalFilterId, filterConfiguration.filter.field, '{field: ' + filterConfiguration.filter.field + ', value:' + activeValue + ', operator: "="}'); console.log('SENDING SENDVALUE: SV-' + externalFilterId) }
        commit('UPDATE_GLOBAL_FILTER', { id: filterId, key: 'filter', elem: 'activeFilter', data: filterValue === null ? '' : filterValue })
      }
    }
  },

  // UPDATE GLOBAL FILTER PROPERTIES
  updateGlobalFilters ({ commit, state }, payload) {
    commit('UPDATE_GLOBAL_FILTER', payload)
  },

  // CHECK FILTERS (INITIAL DATALINK)
  checkInitialFilters ({ commit, getters, state }, payload) {
    var currentGlobalFilter = getters.getGlobalFilters
    var filters = getters.getFilterList
    var field = {}
    var initial = []
    var initialDataLink = {}
    var dashboardId = payload.id || ''

    // AUX: for datePicker fields
    var dateParser = (value, format) => {
      var date
      format = format === '' ? 'yyyymm' : format
      if (typeof value === 'number') {
        date = new Date(value)
      } else {
        date = value
      }
      let month = (date.getMonth() + 1).toString()
      const year = date.getFullYear().toString()
      month = month.length === 1 ? `0${month}` : month
      const day = date.getDay() < 10 ? '0' + date.getDay() : date.getDay()
      if (format === 'yyyymm') {
        return parseInt(year + month)
      } else if (format === 'yyyymmdd' || format === 'YYYYMMDD') {
        return parseInt(year + month + day)
      } else if (format === 'yyyymmddhh' || format === 'yyyymmddhh') {
        let hour = date.getHours()
        hour = hour < 10 ? '0' + hour : hour
        return parseInt(year + month + day + hour)
      }
    }

    // AUX: for fields that use key (when field not have uniqueId key generates one´s with format: {parent-value} always the 2nd value is the filter value. )
    var keyParser = (data) => {
      if ((typeof data === 'string' && data === '') || (typeof data === 'object' && data.length === 0)) {
        return data
      } else {
        if (typeof data === 'string') {
          return data.split('-')[1]
        } else {
          return data.map(x => x.split('-')[1])
        }
      }
    }

    // AUX to get only authorized Fields.
    var getAuthorized = (dashboardId) => {
      var filters = getters.getGlobalFilters
      return filters.filter(function (field) {
        if (field.schema.authorizations.length === 0) {
          return true
        } else if (dashboardId !== undefined && field.schema.authorizations.length > 0 && field.schema.authorizations.filter(x => x === dashboardId).length > 0) {
          return true
        } else { return false }
      }).map(y => y.id)
    }
    // get only authorized filter field for this dashboard.
    filters = getAuthorized(dashboardId)

    // Iterate all fields , if any has activeFilter Value setted, then add it to the initialDataLink
    for (let i = 0; i < filters.length; i++) {
      field = currentGlobalFilter.filter(x => x.id === filters[i])[0]

      if (field.schema.fieldType === 'datePicker') {
        const dateOp = 'between'
        var dateParserDef = field.schema.dateParser && field.schema.dateParser !== '' ? field.schema.dateParser : 'yyyymm' // only for date fields
        // Daterangepicker filter
        var dateValue = field.filter.activeFilter === null ? '' : field.filter.activeFilter
        if (dateValue !== '') {
          if (field.schema.dateManager === 'custom') {
            if (field.schema.dateType === 'daterange' || field.schema.dateType === 'datetimerange') {
              if (!field.filter.activeFilterIsDynamic) {
                dateValue = dateValue[0] + ' and ' + dateValue[1]
              } else {
                dateValue = getDynamicDate(dateValue[0], dateParserDef) + ' and ' + getDynamicDate(dateValue[1], dateParserDef)
              }
            } else {
              if (!field.filter.activeFilterIsDynamic) {
                dateValue = dateValue + ' and ' + dateValue
              } else {
                dateValue = getDynamicDate(dateValue, dateParserDef) + ' and ' + getDynamicDate(dateValue, dateParserDef)
              }
            }
          } else {
            const now = new Date()
            var dateNowParsed = dateParser(now, dateParserDef)
            if (!field.filter.activeFilterIsDynamic) {
              dateValue = dateValue + ' and ' + dateNowParsed
            } else {
              dateValue = getDynamicDate(dateValue, dateParserDef) + ' and ' + dateNowParsed
            }
          }
          initial = { field: field.filter.field, value: dateValue, op: dateOp }
          if (initialDataLink[field.filter.id] === undefined) { initialDataLink[field.filter.id] = [] }
          initialDataLink[field.filter.id].push(initial)
          // remove entry if field has authorizations and is not authorized for this dashboardId
          if (dashboardId !== undefined && field.schema.authorizations.length > 0 && field.schema.authorizations.filter(x => x === dashboardId).length === 0) { initialDataLink[field.filter.id].pop() }
        } else {
          // ### NEW FUNCTIONALITY ### check for default Value when no filter is defined, additionally set activeFilter.
          var activeDateValue = []
          if (field.schema.dateType === 'daterange' || field.schema.dateType === 'datetimerange') {
            if (field.filter.defaultFilter && field.filter.defaultFilter.length > 0) {
              if (!field.filter.activeFilterIsDynamic) {
                dateValue = field.filter.defaultFilter[0] + ' and ' + field.filter.defaultFilter[1]
                activeDateValue = [field.filter.defaultFilter[0], field.filter.defaultFilter[1]]
              } else {
                dateValue = getDynamicDate(field.filter.defaultFilter[0], dateParserDef) + ' and ' + getDynamicDate(field.filter.defaultFilter[1], dateParserDef)
                activeDateValue = [parseInt(getDynamicDate(field.filter.defaultFilter[0], dateParserDef)), parseInt(getDynamicDate(field.filter.defaultFilter[1], dateParserDef))]
              }
              initial = { field: field.filter.field, value: dateValue, op: dateOp }
              if (initialDataLink[field.filter.id] === undefined) { initialDataLink[field.filter.id] = [] }
              initialDataLink[field.filter.id].push(initial)
              // remove entry if field has authorizations and is not authorized for this dashboardId
              if (dashboardId !== undefined && field.schema.authorizations.length > 0 && field.schema.authorizations.filter(x => x === dashboardId).length === 0) { initialDataLink[field.filter.id].pop() }
              if (initialDataLink[field.filter.id]) { commit('UPDATE_GLOBAL_FILTER', { id: field.id, key: 'filter', elem: 'activeFilter', data: activeDateValue }) }
            }
          } else {
            if (field.filter.defaultFilter && field.filter.defaultFilter !== '') {
              if (!field.filter.activeFilterIsDynamic) {
                dateValue = field.filter.defaultFilter + ' and ' + field.filter.defaultFilter
                activeDateValue = parseInt(field.filter.defaultFilter)
              } else {
                dateValue = getDynamicDate(field.filter.defaultFilter, dateParserDef) + ' and ' + getDynamicDate(field.filter.defaultFilter, dateParserDef)
                activeDateValue = parseInt(getDynamicDate(field.filter.defaultFilter, dateParserDef))
              }
              initial = { field: field.filter.field, value: dateValue, op: dateOp }
              if (initialDataLink[field.filter.id] === undefined) { initialDataLink[field.filter.id] = [] }
              initialDataLink[field.filter.id].push(initial)
              // remove entry if field has authorizations and is not authorized for this dashboardId
              if (dashboardId !== undefined && field.schema.authorizations.length > 0 && field.schema.authorizations.filter(x => x === dashboardId).length === 0) { initialDataLink[field.filter.id].pop() }
              if (initialDataLink[field.filter.id]) { commit('UPDATE_GLOBAL_FILTER', { id: field.id, key: 'filter', elem: 'activeFilter', data: activeDateValue }) }
            }
          }
        }
      } else if (field.schema.fieldType === 'SelectList') {
        // selectField filter
        var activeValue = ''
        if (field.schema.multi) {
          if (field.filter.activeFilter.length > 0) {
            if (field.schema.key && field.schema.key !== '') { activeValue = keyParser(field.filter.activeFilter) } else { activeValue = field.filter.activeFilter }
            var multiValue = field.schema.type === 'string' ? '(' + activeValue.map(x => "'" + x + "'").join(',') + ')' : '(' + activeValue.join(',') + ')'
            initial = { field: field.filter.field, value: multiValue, op: 'IN' }
            if (initialDataLink[field.filter.id] === undefined) { initialDataLink[field.filter.id] = [] }
            initialDataLink[field.filter.id].push(initial)
            // remove entry if field has authorizations and is not authorized for this dashboardId
            if (dashboardId !== undefined && field.schema.authorizations.length > 0 && field.schema.authorizations.filter(x => x === dashboardId).length === 0) { initialDataLink[field.filter.id].pop() }
          }
        } else {
          if (field.filter.activeFilter !== '') {
            if (field.schema.key && field.schema.key !== '') { activeValue = keyParser(field.filter.activeFilter) } else { activeValue = field.filter.activeFilter }
            var singleValue = field.filter.activeFilter
            initial = { field: field.filter.field, value: singleValue, op: '=' }
            if (initialDataLink[field.filter.id] === undefined) { initialDataLink[field.filter.id] = [] }
            initialDataLink[field.filter.id].push(initial)
            // remove entry if field has authorizations and is not authorized for this dashboardId
            if (dashboardId !== undefined && field.schema.authorizations.length > 0 && field.schema.authorizations.filter(x => x === dashboardId).length === 0) { initialDataLink[field.filter.id].pop() }
          }
        }
      }
    }
    // Set initialDataLink even if is void (setup)
    commit('SET_INITIAL_DATALINK', initialDataLink)
  }
}

// MUTATIONS
const mutations = {
  'RESET_LOADERS' (state) {
    state.isGlobalFilterLoaded = false
  },
  'RESET_GLOBAL_FILTERS' (state) {
    Object.assign(state.globalFilter, [])
  },
  'SET_GLOBAL_FILTER' (state, payload) {
    state.globalFilter = payload
  },
  'SET_GLOBAL_LOADED' (state, payload) {
    state.isGlobalFilterLoaded = payload
  },
  'SET_FILTER_LIST' (state, payload) {
    state.filterList = payload
  },
  'SET_ROLE_FILTER' (state, payload) {
    state.role = payload
  },
  'IS_ADMIN_ROLE' (state, payload) {
    state.isAdmin = payload
  },
  'SET_INITIAL_DATALINK' (state, payload) {
    state.initialDataLink = payload
  },
  'UPDATE_GLOBAL_FILTER' (state, payload) {
    var data = {}
    data[payload.elem] = payload.data
    if (payload.key !== '') {
      Object.assign(state.globalFilter.filter(x => x.id === payload.id)[0][payload.key], data)
    } else {
      Object.assign(state.globalFilter.filter(x => x.id === payload.id)[0], data)
    }
  }
}
// EXPORT SECTION
export default {
  /* eslint no-undef: "error" */
  state,
  getters,
  actions,
  mutations
}
