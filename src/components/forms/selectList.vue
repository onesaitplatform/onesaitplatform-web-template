<!-- GLOBAL FILTER FORM ELEMENT - TYPE: SELECT -->
<template>
   <div class="dyn-filter selectList"  v-if="isAuthorized(dashboardId)" :style="setFilterStyle">
      <ods-select :id="field.id" :ref="field.id" v-if="field.schema.isVisible" v-model="selectedItem" :size="field.schema.size ? field.schema.size : 'exa'" :filterable="true" :disabled="this.isDisabled" :multiple="field.schema.multi" :clearable="field.schema.isClearable" :selectLabel="field.destination !== 'topBarFilter'? $t(field.schema.i18nLabel) : ''" :name="'' +field.id" :placeholder="$t(field.schema.i18nPlaceholder)"  @change="changeSelection($event)" >
        <ods-option  v-for="item in realData" :key="item[field.schema.key ? field.schema.key: field.schema.options.value]" :label="item[field.schema.options.label]"  :value="item[field.schema.key ? field.schema.key: field.schema.options.value]"></ods-option>
      </ods-select>
      <ods-divider v-if="field.schema.isVisible && field.destination !== 'topBarFilter' && isAuthorized(dashboardId)" :direction="'horizontal'" :contentPosition="'center'"></ods-divider>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'selectList',
  props: {
    field: { type: Object, required: true },
    dashboardId: { type: String, required: true }
  },
  data: function () {
    return {
      selectedItem: [],
      cachedOptions: []
    }
  },
  computed: {
    ...mapGetters({
      getGlobalFilters: 'getGlobalFilters'
    }),
    filters () {
      return this.$parent.filters
    },
    realData () {
      var data = this.getGlobalFilters
      return data.filter(x => x.id === this.field.id).map(y => y.data)[0]
    },
    activeFilter () {
      var data = this.getGlobalFilters
      return data.filter(x => x.id === this.field.id).map(y => y.filter.activeFilter)[0]
    },
    isDisabled () {
      var data = this.getGlobalFilters
      return data.filter(x => x.id === this.field.id).map(y => y.schema.isDisabled)[0]
    },
    setFilterStyle () {
      return (this.field.destination && this.field.destination === 'topBarFilter') ? { 'margin-right': '24px', display: 'inline-flex' } : {}
    }
  },
  watch: {
    activeFilter: {
      // Watch for active Filter change and change value to avoid the select value when go disabled.
      deep: true,
      handler (activeFilter) {
        if (activeFilter) {
          this.selectedItem = activeFilter
          // console.log('executing handleEnableDisable from watch...', this.field.id)
          this.handleEnableDisableFields()
        } else {
          if (this.field.schema.isDisabled) { this.selectedItem = this.field.schema.multi ? [] : '' }
        }
      }
    }
  },
  methods: {
    ...mapActions([
      'filterDataFilter',
      'sendFilter',
      'sendNewFilter',
      'updateGlobalFilters'
    ]),
    // IS AUTHORIZED
    isAuthorized (dashboardId) {
      var authorizations = this.field.schema.authorizations || []
      var authorization = true
      if (authorizations.length > 0) {
        authorization = authorizations.filter(x => x === dashboardId).length > 0
        // if (!authorization) { console.log('Filter Field ', this.field.id, ' is not authorized.') }
        return authorization
      } else {
        return true
      }
    },

    // for other fields in filterTo of the Field
    checkAuthorized (dashboardId, filterToElements) {
      var authorized = []
      var authorization = true
      var data = this.getGlobalFilters
      for (let i = 0; i < filterToElements.length; i++) {
        const authorizations = data.filter(x => x.id === filterToElements[i]).map(y => y.schema.authorizations)[0]
        if (authorizations.length > 0) {
          authorization = authorizations.filter(x => x === dashboardId).length > 0
          if (authorization) { authorized.push(filterToElements[i]) }
        } else {
          authorization = true
          authorized.push(filterToElements[i])
        }
      }
      return authorized
    },

    // INIT FIELD AND CONNECTIONS
    handleField () {
      // console.log('handleField() |--> ', this.field.id, ' dashboardId |--> ', this.dashboardId, ' Authorizations: ', this.field.schema.authorizations)
      // assign value, persistence filters
      if (this.field.schema.multi) {
        this.selectedItem = this.field.filter.activeFilter.length > 0 ? this.field.filter.activeFilter : []
      } else {
        this.selectedItem = this.field.filter.activeFilter !== '' ? this.field.filter.activeFilter : ''
      }
      // if has value and has related fields make filter between fields
      if (this.field.schema.filterTo.length > 0) {
        this.handleFilterFields()
        this.handleEnableDisableFields()
      }
    },

    // MAKE FILTER BETWEEN FIELDS
    handleFilterFields () {
      // console.log('handleFilterFields() |--> ', this.field.id)
      if (this.field.schema.filterTo && this.field.schema.filterTo.length > 0) {
        var items = this.field.schema.filterTo
        for (let i = 0; i < items.length; i++) {
          // console.log('|--> filter to update: ', items[i])
          this.filterDataFilter({ id: items[i], field: this.field.filter.field, value: this.selectedItem })
        }
      }
    },

    // HANDLE ENABLE OR DISABLE RELATED FIELDS
    handleEnableDisableFields () {
      // console.log('handleEnableDisableFields() |--> ', this.field.id)
      // NEW RESOLUTION, find all path, null values and finally send filter
      var allFilters = this.getGlobalFilters
      var allPath = []
      var schema = {}
      var isThelast = false

      // recursive add path of related fields
      var addFilterToPath = function (filters, app) {
        for (let i = 0; i < filters.length; i++) {
          if (!allPath.includes(filters[i])) {
            allPath.push(filters[i])
            schema = allFilters.filter(x => x.id === filters[i]).map(y => y.schema)[0]
            if (schema.filterTo.length > 0) {
              addFilterToPath(schema.filterTo, app)
            }
          }
        }
      }

      // if field has related fields
      if (this.field.schema.filterTo.length > 0) {
        // add root
        allPath.push(this.field.id)
        // check if the filterTo elements are authorized for this dashboardId
        var allowedFilterTo = this.checkAuthorized(this.dashboardId, this.field.schema.filterTo)
        // add path
        addFilterToPath(allowedFilterTo, this)
        isThelast = allPath.indexOf(this.field.id) === allPath.length - 1
        // console.log('FULL RELATED PATH: ', allPath.join('--> '))
        schema = {}
        var filterValue = ''
        var filterDisabled = false
        var parentValue = {}
        for (let i = 1; i < allPath.length; i++) {
          schema = allFilters.filter(x => x.id === allPath[i]).map(y => y.schema)[0]
          filterValue = schema.multi ? [] : ''
          if (this.field.schema.isVisible) { this.updateGlobalFilters({ id: allPath[i], key: 'filter', elem: 'activeFilter', data: filterValue }) } // if not visible is just 1 value record, so not remove child activeFilter
          // TO-DO: ver como hacer el disabled o el enabled segun convenga
          parentValue = allFilters.filter(x => x.id === allPath[i - 1]).map(y => y.filter.activeFilter)[0]
          const parentSchema = allFilters.filter(x => x.id === allPath[i - 1]).map(y => y.schema)[0]
          if (parentSchema.multi) {
            filterDisabled = parentValue.length === 0
          } else {
            filterDisabled = parentValue === ''
          }
          // console.log('parent: ', allPath[i - 1], ' parentValue: ', parentValue, ' --> child is ', allPath[i], ' and Disabled is: ', filterDisabled)
          this.updateGlobalFilters({ id: allPath[i], key: 'schema', elem: 'isDisabled', data: filterDisabled })
        }
        // finally sendFilter.
        if (isThelast) { this.sendNewFilter({ filterId: 'external-filters', dashboardId: this.dashboardId }) }
      } else {
        // console.log('FIELD ', this.field.id, 'is sending the new MultiSendFilter...')
        this.sendNewFilter({ filterId: 'external-filters', dashboardId: this.dashboardId })
      }
      // ------------------------------------------------------------------
    },

    // CHANGE SELECTION: @change
    // filter other selectors if needed
    // |--> filter real data
    // |--> disable/enable other filters
    // send Filter and Update activeFilter property to generate persistence on filters on dashboard load.
    changeSelection (value) {
      // activeFilter
      this.updateGlobalFilters({ id: this.field.id, key: 'filter', elem: 'activeFilter', data: value })

      // check filters
      this.handleFilterFields()

      // Enable/disable other fields and sendFilters if able
      this.handleEnableDisableFields()
    }
  },
  mounted () {
    // READ FIELD INFO AND INIT THE FIELD OR MAKE OTHER ACTIONS (enable,disabled,visible,...) TO OTHER FIELDS
    // console.log('SelecList ON MOUNTED...')
    this.handleField()
  }
}
</script>
