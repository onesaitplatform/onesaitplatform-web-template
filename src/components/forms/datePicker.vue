<template>
   <div class="dyn-filter datePicker" v-if="showField" :style="setFilterStyle">
      <label v-if="total > 1" for="dateSelected" class="ods-form-item__label" style="margin-top:6px"> {{this.field.schema.label}} </label>
      <ods-date-picker
        @change="dateCustom"
        :type="this.field.schema.dateType || 'month'"
        :range-separator="rangeSeparator"
        v-model="dateSelected"
        :default-time="isDateTimeRange ? defaultTime: []"
        :canSelectSeconds="isDateTimeRange ? canSelectSeconds : false"
        :picker-options="applyPickerOptions"
        ref="datePicker">
      </ods-date-picker>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import moment from 'moment'
export default {
  name: 'datePicker',
  props: {
    field: { type: Object, required: true },
    dashboardId: { type: String, required: true },
    total: { type: Number, required: true }
  },
  data: function () {
    return {
      dateSelected: [],
      dateNoParse: false,
      today: moment().format(this.dateFormat).toString(),
      yesterday: moment().subtract(1, 'day').format(this.dateFormat).toString(),
      startWeek: moment().startOf('week').format('dddd') === 'Sunday' ? moment().startOf('week').add('d', 1).format(this.dateFormat).toString() : moment().startOf('week').format(this.dateFormat).toString(),
      endWeek: moment().endOf('week').format(this.dateFormat).toString(),
      oneWeekAgo: moment().subtract(7, 'day').format(this.dateFormat).toString(),
      startMonth: moment().startOf('month').format(this.dateFormat).toString(),
      endMonth: moment().subtract(1, 'month').startOf('month').format(this.dateFormat).toString(),
      oneMonthsAgo: moment().subtract(1, 'months').format(this.dateFormat).toString(),
      twoMonthsAgo: moment().subtract(2, 'months').format(this.dateFormat).toString(),
      firstDayMonthAgo: moment().subtract(1, 'months').startOf('month').format(this.dateFormat),
      firstDayTwoMonthsAgo: moment().subtract(2, 'months').startOf('month').format(this.dateFormat),
      threeMonthsAgo: moment().subtract(3, 'months').format(this.dateFormat).toString(),
      sixMonthsAgo: moment().subtract(6, 'months').format(this.dateFormat).toString(),
      nineMonthsAgo: moment().subtract(9, 'months').format(this.dateFormat).toString(),
      yearAgo: moment().subtract(1, 'year').format(this.dateFormat).toString(),
      startYear: moment().startOf('year').format(this.dateFormat).toString(),
      showField: true,
      defaultTime: ['00:00:00', '23:59:59'],
      canSelectSeconds: false
    }
  },
  computed: {
    ...mapGetters({
      getGlobalFilters: 'getGlobalFilters'
    }),
    filters () {
      return this.$parent.filters
    },
    rangeSeparator () {
      var separator = this.field.schema.rangeSeparator && (this.field.schema.dateType === 'daterange' || 'datetimerange') ? this.field.schema.rangeSeparator : ' '
      return separator
    },
    isDateTimeRange () {
      return this.field.schema.dateType === 'datetimerange'
    },
    applyPickerOptions () {
      var options = this.field.schema.applyPickerOptions ? this.pickerOptions : false
      return options
    },
    dateFormat () {
      var format = this.field.schema.dateFormat && this.field.schema.dateFormat !== '' ? this.field.schema.dateFormat : 'YYYYMM'
      return format
    },
    activeFilter () {
      var data = this.getGlobalFilters
      return data.filter(x => x.id === this.field.id).map(y => y.filter.activeFilter)[0]
    },
    setFilterStyle () {
      return (this.field.destination && this.field.destination === 'topBarFilter') ? { 'margin-right': '24px' } : {}
    },
    // OPTIONS FOR DATEPICKER
    pickerOptions () {
      var that = this
      var options = {}
      options.disabledDate = function (time) {
        if (time.getTime() > Date.now()) {
          return true
        } else {
          if (time.getTime() < that.$moment().subtract(1, 'year').valueOf()) {
            return true
          } else {
            return false
          }
        }
      }
      if (this.field.schema.dateType === 'daterange') {
        options.shortcuts = []
      } else {
        options.shortcuts = [{
          text: 'Últimos 6 meses',
          onClick (picker) { picker.$emit('pick', that.$moment().subtract(5, 'months').valueOf()); that.dateHandler('6') }
        },
        {
          text: 'Últimos 12 meses',
          onClick (picker) { picker.$emit('pick', that.$moment().subtract(11, 'months').valueOf()); that.dateHandler('12') }
        }]
      }

      return options
    }
  },
  methods: {
    ...mapActions([
      'filterDataFilter',
      'sendFilter',
      'updateGlobalFilters'
    ]),
    // IS AUTHORIZED
    isAuthorized (dashboardId) {
      if (!dashboardId) { return true }
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
    // INIT FIELD AND CONNECTIONS
    handleField () {
      // console.log('handleField() |--> ', this.field.id)
      // assign value, persistence filters
      // ckeck for daterange
      if (this.field.schema.dateType === 'daterange' || this.field.schema.dateType === 'datetimerange') {
        if (this.field.filter.activeFilter.length > 0) {
          // this.dateNoParse = true
          this.dateSelected = [this.$moment(this.field.filter.activeFilter[0], this.dateFormat).toDate(), this.$moment(this.field.filter.activeFilter[1], this.dateFormat).toDate()]
        } else if (this.field.filter.defaultFilter && this.field.filter.defaultFilter.length > 0) {
          // TO-DO: montar el dateSelected segun si es dynamic o no mandando array de fechas, mejor encapsular todo en una mini funcion.
          // check Default Multiple-Value
          // this.dateNoParse = true
          this.getDateDefaultFilter('daterange')
        }
      } else {
        if (this.field.filter.activeFilter !== '' && this.field.filter.activeFilter !== null) {
          // this.dateNoParse = true
          this.dateSelected = this.$moment(this.field.filter.activeFilter, this.dateFormat).toDate()
        } else if (this.field.filter.defaultFilter && this.field.filter.defaultFilter !== '') {
          // TO-DO: montar el dateSelected segun si es dynamic o no mandandola fecha, mejor encapsular todo en una mini funcion.
          // check Default single-Value
          // this.dateNoParse = true
          this.getDateDefaultFilter('date')
        }
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
          console.log('|--> filter to update: ', items[i])
          this.filterDataFilter({ id: items[i], field: this.field.filter.field, value: this.dateSelected })
        }
      }
    },

    // HANDLE ENABLE OR DISABLE RELATED FIELDS
    handleEnableDisableFields () {
      // console.log('handleEnableDisableFields() |--> ', this.field.id)
      if (this.field.schema.filterTo.length > 0) {
        var fields = this.field.schema.filterTo
        var disabled = false
        for (let i = 0; i < fields.length; i++) {
          if (this.field.schema.multi) {
            // multiple-value field
            disabled = this.field.filter.activeFilter.length === 0
          } else {
            // single-value field
            disabled = this.field.filter.activeFilter === ''
          }
          // apply disabled state
          this.updateGlobalFilters({ id: fields[i], key: 'schema', elem: 'isDisabled', data: disabled })
          // console.log('  |--> Field ', fields[i], 'disabled: ', disabled)
        }
      }
    },

    // DATA DEFAULTFILTER VALUE SET IF ABLE
    getDateDefaultFilter (type) {
      var format = this.field.schema.dateParser
      // if authorized
      if (this.dashboardId !== '') {
        if (type === 'daterange') {
          // check if defaultFilter, activeFilterDynamic, then [ startValue, endValue ]
          if (this.field.filter.defaultFilter && this.field.filter.defaultFilter.length > 0) {
            this.dateSelected = this.field.filter.activeFilterIsDynamic ? [this.$moment(this.getDynamicDate(this.field.filter.defaultFilter[0], format)).toDate(), this.$moment(this.getDynamicDate(this.field.filter.defaultFilter[1], format)).toDate()] : [this.$moment(this.field.filter.defaultFilter[0]).toDate(), this.$moment(this.field.filter.defaultFilter[1]).toDate()]
            this.dateNoParse = false
          }
        } else {
          // type date
          if (this.field.filter.defaultFilter && this.field.filter.defaultFilter !== '') {
            this.dateSelected = this.field.filter.activeFilterIsDynamic ? this.$moment(this.getDynamicDate(this.field.filter.defaultFilter, format)).toDate() : this.$moment(this.field.filter.defaultFilter).toDate()
            this.dateNoParse = false
          }
        }
      } else {
        // console.log('defaultFilter for ', this.field.id, ' is not Applied.')
      }
    },

    // DATE HANDLER BETWEEN CUSTOM, 6 AND 12 MONTHS
    dateHandler (value) {
      this.updateGlobalFilters({ id: this.field.id, key: 'schema', elem: 'dateManager', data: value })
    },
    // DATE PARSER AUX
    dateParser (value) {
      const dateToParse = this.field.schema.dateParser && this.field.schema.dateParser !== '' ? this.field.schema.dateParser : 'yyyymm'
      var date
      if (typeof value === 'number') {
        date = new Date(value)
      } else {
        date = value
      }

      var month = (date.getMonth() + 1).toString()
      const year = date.getFullYear().toString()
      month = month.length === 1 ? `0${month}` : month
      const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
      if (dateToParse === 'yyyymm') {
        return parseInt(year + month)
      } else if (dateToParse === 'yyyymmdd' || dateToParse === 'YYYYMMDD') {
        return parseInt(year + month + day)
      } else if (dateToParse === 'yyyymmddhh' || dateToParse === 'YYYYMMDDHH') {
        let hour = date.getHours()
        hour = hour < 10 ? '0' + hour : hour
        return parseInt(year + month + day + hour)
      }
    },

    // AUX for fields date and daterange that have dynamic date fields configuration
    getDynamicDate (date, format) {
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
    },

    // DATECUSTOM: @change
    // filter other selectors if needed
    // |--> filter real data
    // send Filter and Update activeFilter property to generate persistence on filters on dashboard load.
    dateCustom (value) {
      // console.log('dateCustom(' + this.field.id + ') |--> Value: ', value, 'field: ', this.field.id, ' this field filter others: ', this.field.schema.filterTo, ' dateManager: ', this.field.schema.dateManager)
      var startDate = 0
      var endDate = 0
      // dateManager
      if (typeof value !== 'number') {
        this.updateGlobalFilters({ id: this.field.id, key: 'schema', elem: 'dateManager', data: 'custom' })
      }

      // check filters
      this.handleFilterFields()

      // Enable/disable other fields
      this.handleEnableDisableFields()

      // check for default value when value is null
      if (value === null && this.field.filter.defaultFilter) {
        if (this.field.schema.dateType === 'daterange' || this.field.schema.dateType === 'datetimerange') {
          if (this.field.filter.defaultFilter.length > 0) {
            startDate = this.field.filter.activeFilterIsDynamic ? this.$moment(this.getDynamicDate(this.field.filter.defaultFilter[0], this.field.schema.dateParser), this.field.schema.dateParser).toDate() : this.$moment(this.field.filter.defaultFilter[0], this.field.schema.dateParser).toDate()
            endDate = this.field.filter.activeFilterIsDynamic ? this.$moment(this.getDynamicDate(this.field.filter.defaultFilter[1], this.field.schema.dateParser), this.field.schema.dateParser).toDate() : this.$moment(this.field.filter.defaultFilter[1], this.field.schema.dateParser).toDate()
            value = [startDate, endDate]
            this.dateSelected = [startDate, endDate] // assign default value to datepicker in datarange mode
            this.$notify({
              title: 'Filter ' + this.field.id + ':',
              message: 'This filter has assigned a default date range',
              type: 'success',
              iconClass: 'ods-icon-filter',
              duration: 3000,
              position: 'top-right',
              showClose: true
            })
          }
        } else {
          if (this.field.filter.defaultFilter !== '') {
            value = this.field.filter.activeFilterIsDynamic ? this.$moment(this.getDynamicDate(this.field.filter.defaultFilter, this.field.schema.dateParser)).toDate() : this.$moment(this.field.filter.defaultFilter).toDate()
            this.dateSelected = value // assign default value to datepicker in date mode
            this.$notify({
              title: 'Filter ' + this.field.id + ':',
              message: 'This filter has a default date assingned',
              type: 'success',
              iconClass: 'ods-icon-filter',
              duration: 3000,
              position: 'top-right',
              showClose: true
            })
          }
        }
      }

      // parse Data before send Filter
      if (this.dateNoParse) { this.dateNoParse = false; return false } // not parse if date is activeFilter, then send filter initially
      var dateParsed = 0
      if (value === null) {
        this.sendFilter({ filterId: this.field.id, value: '', op: 'between' })
        this.updateGlobalFilters({ id: this.field.id, key: 'filter', elem: 'activeFilter', data: '' })
      } else {
        if (this.field.schema.dateManager === 'custom') {
          // modification to allow single or multiple data value (daterange)
          if (this.field.schema.dateType === 'daterange' || this.field.schema.dateType === 'datetimerange') {
            startDate = value[0]
            endDate = value[1]
            var startDateParsed = this.dateParser(startDate)
            var endDateParsed = this.dateParser(endDate)
            var activedFilter = [startDateParsed, endDateParsed]
          }
          this.sendFilter({ filterId: this.field.id, value: startDateParsed + ' and ' + endDateParsed, op: 'between' })
          this.updateGlobalFilters({ id: this.field.id, key: 'filter', elem: 'activeFilter', data: activedFilter })
        } else {
          const now = new Date()
          dateParsed = this.dateParser(new Date(value))
          this.updateGlobalFilters({ id: this.field.id, key: 'filter', elem: 'activeFilter', data: dateParsed })
          var dateNowParsed = this.dateParser(now)
          if (this.field.schema.dateManager === '6') {
            this.sendFilter({ filterId: this.field.id, value: dateParsed + ' and ' + dateNowParsed, op: 'between' })
            this.updateGlobalFilters({ id: this.field.id, key: 'schema', elem: 'dateManager', data: 6 })
          }
          if (this.field.schema.dateManager === '12') {
            this.sendFilter({ filterId: this.field.id, value: dateParsed + ' and ' + dateNowParsed, op: 'between' })
            this.updateGlobalFilters({ id: this.field.id, key: 'schema', elem: 'dateManager', data: 12 })
          }
        }
      }
    }
  },
  watch: {
    '$route.params.dashboardId': {
      // Watch for active Filter change and change value to avoid the select value when go disabled.
      immediate: true,
      handler (dashboardId) {
        // console.log('activeFilter changed...', activeFilter, ' in Field: ', this.field.id)
        if (dashboardId) {
          this.showField = this.isAuthorized(dashboardId)
          if (this.showField) { this.handleField() }
        } else { this.showField = true }
      }
    },
    activeFilter: {
      // Watch for active Filter change and change value to avoid the select value when go disabled.
      deep: true,
      handler (activeFilter) {
        if (activeFilter) {
          this.handleField() // if activeFilter is set on init or by default date set on dashboard, has to set it.
        }
      }
    }
  },
  mounted () {
    // READ FIELD INFO AND INIT THE FIELD OR MAKE OTHER ACTIONS (enable,disabled,visible,...) TO OTHER FIELDS
    this.handleField()
    // console.log('DATEPICKER FIELD: ', JSON.stringify(this.field))
  }
}
</script>
<style scoped lang="scss">
::v-deep .ods-input__icon.ods-range__close-icon {
    display: inline-block!important;
}
::v-deep .ods-input__prefix.ods-input__prefix--range {
  //display: inline-block !important;
  display: none!important;
}
</style>
