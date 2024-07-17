<template>
    <div class="datasource-output" v-loading="loading" :loading-title="$t('loadingOutput')" :style="output.length > 0 ? {alignItems: 'flex-start'} : {alignItems: 'center'}">
        <div class="output-content" v-if="output.length > 0 && !loading">
            <!-- new content -->
            <div class="gadget-app-table" style="padding:12px; width:100%; height:100%">
              <!-- TABLE TOOLBAR -->
              <div class="table-toolBar">
                <div class="table-toolBar_header">
                  <h2 class="table-title">{{ title + '(' + outputTitle + ')' }}</h2>
                </div>
                <div class="table-toolBar_actions">
                  <div class="filters">
                    <ods-input v-model="search.main" prefix-icon="ods-icon-search" placeholder="search" class="filter-item" v-on:input="handleFilters()"></ods-input>
                  </div>
                </div>
                <div class="table-toolBar_options">
                  <ods-button v-if="checkHidden" size="mini" :type="toolBarButtons" @click="dialogOptionsColumnsVisible = true" icon="ods-icon-list"></ods-button>
                </div>
              </div>
              <!-- MAIN TABLE -->
              <ods-table ref="tableOutput" overflow="show_tip" :data="paginatedData.filter(tableDatafilter)" :height="height" :stripe="stripe" :border="border" :fit="fit" :size="size"
              highlight-current-row style="width: 100%" :tree-props="{children: 'children', hasChildren: 'hasChildren'}"  :default-sort="sortColumn" :show-header="header"
              :summary-method="getSummaries" :show-summary="summary" @select="handleSelect" @select-all="handleSelectAll" @selection-change="handleSelectionChange" :empty-text="emptyText" lazy>
                <!-- INDEX, SELECTION AND EXTRA FIELDS COLUMNS -->
                <ods-table-column v-if="checkSelection" type="selection" width="80"></ods-table-column>
                <ods-table-column v-if="checkNumeric" type="index" width="60"></ods-table-column>
                <!-- MAIN COLUMNS -->
                <!-- eslint-disable-next-line vue/no-use-v-if-with-v-for -->
                <ods-table-column v-for="(column, index) in columns" :key="index" :label="column.label ? column.label : column.field" :prop="column.field"  v-if="![column.field].some(x => hiddenColumns.includes(x))"
                  :formatter="typeof column.formatter === 'function' ? column.formatter : null"
                  :width="(column.width == -1 ? null : (column.width + 'px'))" sortable :show-overflow-tooltip="column.ellipsis" :header-align="!column.align ? 'left' : column.align"  :align="!column.align ? 'left' : column.align">
                  <template v-slot:default="{ row }" v-if="typeof column.formatter !== 'function'">
                    <component v-if="checkFormatter(column.formatter)" :is="column.formatter" :row="row" :column="column.field" :format="column.format">
                      <!-- formatted output from formatter func. -->
                    </component>
                    <div v-else-if="!checkFormatter(column.formatter)">
                      <span :style="{ 'font-weight': (column.bold ? 'bold' : 'inherit') }">{{ handleCell(row, column) }}</span>
                    </div>
                  </template>
                </ods-table-column>
              </ods-table>
              <!-- PAGINATION -->
              <ods-pagination :current-page="page" :page-size="pageSize" :page-sizes="pageSizes" :page-count="pageCount" :total="totalItems" @current-change="handlePageChange" @size-change="handlePageSizeChange"></ods-pagination>

              <!-- SHOW/HIDE COLUMNS dialog -->
              <ods-drawer title="Show/Hide Columns" :visible.sync="dialogOptionsColumnsVisible" :append-to-body="true"
                :modal="true" :modal-append-to-body="false" direction="rtl" :show-close="true" :size="'20%'"
                :with-header="true">
                <ods-scrollbar style="height:calc(100% - 90px)" :wrapStyle="scrollbarWrapStyle" :viewStyle="scrollbarViewStyle">
                  <div style="padding: 12px">
                    <ol>
                      <li v-for="(column, index) in columns" :key="index" class="li-column">
                        {{ column.label }}: <ods-switch v-model="column.visible"  class="switch-column" @change="toggleColumns(column.field)"></ods-switch>
                      </li>
                    </ol>
                  </div>
                </ods-scrollbar>
              </ods-drawer>
            </div>
            <!-- end new content -->
        </div>
        <div v-else class="no-output family">
            <p class="ods-txt-title-150 ods-mb-1"><b>{{ $t('noQuery') }}</b></p>
            <p>{{ $t('noQueryMsg') }}</p>
        </div>
    </div>
</template>

<script>
import i18n from '../lang'
export default {
  name: 'DatasourceOutput',
  i18n,
  components: {},

  props: {
    output: {
      type: Array,
      default: () => []
    },
    ontology: {
      type: String,
      default: ''
    },
    schema: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      search: {
        main: ''
      },
      areFiltersActive: false,
      searchStrategy: 'includes',
      filterPagination: '', // msg to show x of y records showing when filters applied
      toolBar: true,
      header: true,
      checkNumeric: true,
      checkHidden: true,
      checkSelection: false,
      multipleSelection: false,
      selectedRows: null,
      size: 'default',
      checkExtra: false,
      extraDatasource: false,
      toolBarButtons: 'neutral',
      stripe: false,
      border: false,
      fit: true,
      emptyText: 'No Data',
      GadgetHeight: '85%',
      table: true,
      hidden: [],
      totalFiltered: 0,
      page: 1,
      pageSize: 10,
      minimumPageSize: 10,
      currentPage: 1,
      summary: false,
      summaryText: 'Total',
      sortColumn: {
        prop: 0,
        order: 'descending'
      },
      // dialog for columns
      dialogOptionsColumnsVisible: false,
      scrollbarWrapStyle: { height: 'calc(100% - 125px)', padding: '10px' },
      scrollbarViewStyle: { padding: '12px' }
    }
  },
  computed: {
    title () {
      return this.$t('titleOutput') || ' Datasource Output Result'
    },
    outputTitle () {
      return ((this.totalFiltered > 0) && (this.totalFiltered < this.totalRecords)) ? this.totalFiltered + ' / ' + this.totalRecords : this.totalRecords
    },
    gadgetHeight () {
      return (this.$el && this.$el.clientHeight > 0) ? this.$el.clientHeight : ''
    },
    height () {
      return this.GadgetHeight || '85%'
    },
    tableColumns () {
      return this.columns.map(x => x.field)
    },
    hiddenColumns () {
      // return this.columns.filter(x => x.visible === false).map(y => y.field)
      return this.hidden
    },
    defaultSort () {
      if (this.tableColumns.length === 0) { return {} }
      if (this.sortColumn.field === '') { return { prop: this.tableColumns[0], order: 'descending' } }
      return { prop: this.sortColumn.field, order: this.sortColumn.order }
    },
    pageSizes () {
      return [
        this.minimumPageSize,
        this.minimumPageSize * 2,
        this.minimumPageSize * 3,
        this.minimumPageSize * 4,
        this.minimumPageSize * 5,
        this.minimumPageSize * 10
      ]
    },
    totalItems () {
      return this.filteredData.length
    },
    filteredData () {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.totalFiltered = this.output.filter(this.tableDatafilter).length
      return this.output.filter(this.tableDatafilter)
    },
    pageCount () {
      return Math.floor(this.totalItems / this.pageSize)
    },
    paginatedData () {
      return this.filteredData.slice(this.pageSize * this.page - this.pageSize, this.pageSize * this.page)
    },
    totalRecords: function () {
      return this.output.length
    },
    columns () {
      return this.schema ? this.schema.map((item) => ({
        label: item.name,
        field: item.name,
        visible: true,
        ellipsis: true,
        hasChildren: true, // to load additional datasources relations
        formatter: null, // to apply formatters
        prefix: '',
        postfix: '',
        align: 'center',
        bold: false
      })) : []
    }
  },
  watch: {
    output: function (newOutput) {
      console.debug('output: content change')
      if (newOutput) {
        // this.loading = true
        this.initOutput(newOutput)
      }
    }
  },
  methods: {
    // INIT MAIN OUTPUT into table system
    initOutput (output) {
      if (!output) { return false }
      console.log('OUTPUT: ', this.output)
      // this.loading = false
    },
    // OUTPUT TABLE METHODS
    handleSizeChange (val) {
      this.pageSize = val
    },
    handleCurrentChange (val) {
      this.page = val
    },
    handlePageChange (page) {
      this.page = page
    },
    handlePageSizeChange (pageSize) {
      this.pageSize = pageSize
      this.handlePageChange(this.page)
    },
    handleFilters () {
      const isEmptyObject = (obj) => { return !Object.values(obj).some(x => x !== null && x !== '') }
      this.areFiltersActive = !isEmptyObject(this.search)
    },
    // to-do: usar desde API
    findValues (jsonData, path) {
      path = path.replace(/\[(\w+)\]/g, '.$1')
      path = path.replace(/^\./, '') // strip a leading dot
      var pathArray = path.split('.')
      for (var i = 0, n = pathArray.length; i < n; ++i) {
        var key = pathArray[i]
        if (key in jsonData) {
          if (jsonData[key] !== null) {
            jsonData = jsonData[key]
          } else {
            return null
          }
        } else {
          return key
        }
      }
      return jsonData
    },
    tableDatafilter (element, index) {
      var founded = false
      if (!this.areFiltersActive) { return true }
      // main search iterate and tyr to find this value in some data of row
      if (this.search.main !== '') {
        const search = this.search.main.toLowerCase()
        for (let i = 0; i < this.tableColumns.length; i++) {
          let columnValue = this.findValues(element, this.tableColumns[i])
          columnValue = columnValue.toString().toLowerCase()
          if (columnValue.includes(search)) {
            founded = true
            break
          }
        }
        return founded
      } else {
        // iterate in other filters
        var filters = Object.keys(this.search)
        for (let i = 0; i < filters.length; i++) {
          if (filters[i] === 'main') { continue }
          const search = this.search[filters[i]].toString().toLowerCase()
          if (search) {
            let columnValue = this.findValues(element, filters[i])
            columnValue = columnValue.toString().toLowerCase()
            if (columnValue === search) {
              founded = true
            }
          }
        }
        return founded
      }
    },
    // control for multiple selection or single.
    handleSelectionChange (rows) {
      var avoided = false
      const ref = 'tableOutput'
      if (!this.multipleSelection) {
        // single-selection avoid +1 selection, keep last selected
        if (rows.length > 1) {
          this.$refs[ref].clearSelection()
          this.selectedRows = rows.pop()
          avoided = true
          this.$refs[ref].toggleRowSelection(this.selectedRows)
        }
      }
      if (!avoided) { this.selectedRows = rows }
    },
    // get selection (multiple or single and send filter if its configured)
    handleSelect (selection, row) {
      if (this.interactionFilter) {
        this.sendRowFilter(this.selectedRows)
      }
    },
    // get selection All check for all elements, when null
    handleSelectAll (selection) {
      if (this.interactionFilter) {
        this.sendRowFilter(this.selectedRows)
      }
    },
    // handle extra field value, it can be single or nested field.
    handleExtraValue (row, field) {
      if (field && field.includes('.')) {
        var arr = field.split('.')
        var value = row[arr[0]][arr[1]]
        return value
      } else {
        return row[field]
      }
    },
    // summary row calculation
    getSummaries (param) {
      const that = this
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = that.summaryText
          return
        }
        const values = data.map(item => Number(item[column.property]))
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0)
        } else {
          sums[index] = ''
        }
      })
      return sums
    },
    checkFormatter (formatter) {
      if (!formatter) { return false }
      if (formatter && formatter === 'none') { return false } else { return true }
    },
    toggleColumns (field) {
      if (this.hidden.indexOf(field) !== -1) {
        this.hidden.splice(this.hiddenColumns.indexOf(field), 1)
      } else {
        this.hidden.push(field)
      }
    },
    // handle data row for column data in cell
    handleCell (row, column) {
      var data = this.findValues(row, column.field)
      var complexValue = function (data) {
        console.log('COMPLEX: ', typeof data)
        if (typeof data !== 'object') {
          return data
        } else {
          // is complex
          console.log('COMPLEX DATA: ', JSON.stringify(data))
          return Object.keys(data).length === 1 ? data[Object.keys(data)[0]] + '(' + Object.keys(data)[0] + ')' : JSON.stringify(data)
        }
      }
      if (!(typeof data === 'undefined' || data === null)) {
        // return column.prefix + this.transform(data, column.format) + column.postfix
        return column.prefix + complexValue(data) + column.postfix
      } else {
        return column.noValueText
      }
    },
    formatCompactNumber (number) {
      if (isNaN(number)) { return number }
      var locale = 'en'
      const formatter = Intl.NumberFormat(locale, { notation: 'compact' })
      return formatter.format(number)
    }
  },
  mounted () {
    this.initOutput(this.output)
  },
  unmount () {

  }
}
</script>

  <style scoped>
  .datasource-output {
    width: 100%;
    height: auto;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 250px;
  }
  .output-content {
    padding: 0;
    width: 100%;
    height: auto;
  }
  .no-output {
    padding: 0;
  }
  td:not(:has(button)) {
    padding-top: .25rem !important;
}
.ods-pagination__label {
  display: none;
}

.table-toolBar {
  display: grid;
  grid-template-columns: 250px 1fr auto;
  justify-content: center;
  column-gap: 0.5rem;
  row-gap: 0.5rem;
  justify-items: normal;
  margin-bottom: 12px;
}

.ods-table__expanded-cell {
  background-color: #f3f7ff;
}

.ods-table__expanded-cell > p {
  padding: 6px;
  margin-left: 12px;
  margin-bottom: 0px;
  line-height: 16px;
  font-size: .75rem;
  font-weight: 400;
  font-family: Poppins, 'Soho';
}

.ods-table__expanded-cell>p>span {
  font-size: .75rem;
  font-weight: 500;
}

.ods-table__expanded-cell[class*=cell] {
  padding: 0.50rem;
}

ods-button-group {
  margin-right: 6px
}

ods-table {
  font-size: 12px !important
}

.table-title {
  padding: 0;
  font-size: .80rem;
  font-weight: 500;
  font-style: normal;
  line-height: 1.7rem;
  left: 0;
  text-overflow: ellipsis;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  font-family: Poppins, Arial
}

.ods-button-group>.ods-button {
  float: left;
  position: relative;
}

.ods-button-group>.ods-button:first-child {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.ods-button-group>.ods-button:not(:last-child) {
  margin-right: -1px;
}

.ods-button-group .ods-button--primary:last-child {
  border-left-color: rgba(255, 255, 255, .5);
}

.ods-button+.ods-button {
  margin-left: 0 !important;
}

.ods-button-group .ods-button--primary:first-child {
  border-right-color: rgba(255, 255, 255, .5);
}

.ods-button-group>.ods-button+.ods-button {
  margin-left: 0;
}

.ods-table__footer-wrapper {
  margin-top: 4px !important;
}

.ods-table__footer-wrapper tbody td {
  background-color: #fff;
  font-weight: 600;
}

div.more-info>p {
  padding: 4px 4px 4px 0px;
  font-size: 12px;
  font-weight: 500;
}

div.more-info>p>span {
  font-weight: 600;
  color: #555
}

table td,
.table th {
  font-size: 12px;
  font-family: 'Soho', 'Poppins';
}

.ods-form-item__label {
  margin-bottom: 0.75rem;
}

pre {
  overflow: auto;
}

pre .string {
  color: #885800;
}

pre .number {
  color: blue;
}

pre .boolean {
  color: magenta;
}

pre .null {
  color: red;
}

pre .key {
  color: green;
}

.tableTitle {
  float: left;
  font-family: Poppins, "Soho";
  font-weight: 600;
  font-size: 17px;
  margin: 15px 10px 10px 0px;
}

.tableFilter {
  float: left;
  margin: 10px 0px 10px 0px;
}

.tableShow {
  float: right;
  margin: 10px 0px 10px 0px;
}

.ods-table-column--selection .cell {
  padding-left: 1.75rem !important;
  padding-right: 1rem !important;
  display: flex !important;
}

.table-toolBar_header {
  display: grid;
  justify-self: left;
  order: 1;
}

.table-toolBar_actions {
  display: grid;
  justify-self: right;
  grid-auto-flow: column;
  order: 2;
}

.table-toolBar_options {
  display: grid;
  justify-self: right;
  grid-auto-flow: column;
  order: 3;
}

.ods-icon-sm {
  font-size: .85rem;
}

.li-column {
  margin: 0 0 4px 0;
  border-bottom: 1px dotted #888888;
  line-height: 1rem;
  padding: 6px 0px;
  font-size: 0.75rem;
}

.switch-column {
  margin-top: -2px;
  float: right;
}

.li-column:last-child {
  border-bottom: none;
}

.ods-drawer__header {
  margin-bottom: 1rem;
  padding: 1rem;
  padding-bottom: 0;
}

.ods-drawer__header>span {
  font-family: Poppins, 'Soho';
  font-weight: 400;
  font-size: .85rem;
}
.filters {
  display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
}

div.filters > .ods-select .ods-input__inner:read-only {
  border: none;
}

div.filters > .ods-input--prefix > .ods-input__inner {
  border: none;
}
.filter-item {
  width: 125px;
  margin: 0 0.3rem;
}

.ods-pagination__filters {
  display: -webkit-inline-box;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  height: 100%;
  border-right: 1px solid var(--color-bg-hard-divisor);
  padding: 0 0.5rem;
}

.ods-pagination__filters__label {
  font-size: .625rem;
  font-weight: 400;
  font-style: italic;
  line-height: 1rem;
  color: var(--color-txt-secondary);
  padding-left: 0.25rem;
  padding-right: .5rem;
}

.hide { display: none; visibility:hidden; }
.show { display: inline-flex; visibility: visible; }
div.cell > div.ods-progress--circle .ods-progress__text {
  margin-left: 30px;
  display: inline-flex;
  flex-wrap: nowrap;
  min-width: 40px;
}
</style>
