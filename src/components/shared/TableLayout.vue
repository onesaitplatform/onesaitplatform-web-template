<template><!DOCTYPE html>
  <ods-module class="table-layout" ref="module" shadow="never" :class="{ 'table-layout--full-height': fullHeight || withScrollBar, 'table-layout--with-header': hasComplexHeaderSlot || hasHeaderSlot }">
    <template v-if="hasHeaderSlot">
      <div class="table-layout__header">
        <slot name="header"></slot>
      </div>
    </template>
    <div class="table-layout__header" v-else-if="hasComplexHeaderSlot">
      <div class="table-layout__header-item table-layout__header-item--left" v-if="hasHeaderLeftSlot">
        <slot name="headerLeft"></slot>
      </div>
      <div class="table-layout__header-item table-layout__header-item--right" v-if="hasHeaderRightSlot">
        <slot name="headerRight"></slot>
      </div>
    </div>
    <div class="table-layout__table" ref="tableBody" :class="{ 'table-layout__table--full-height': fullHeight, 'table-layout__table--with-bg': withBackground }">
      <slot :paginatedData="paginatedData"></slot>
    </div>
    <ods-row class="table-layout__footer" ref="footer" type="flex" justify="end" v-if="pagination !== 'none'" :class="{ 'table-layout__footer--disabled': paginationDisabled }">
      <ods-pagination :disabled="paginationDisabled" :layout="layout" :small="paginationSmall" :current-page="page_" :page-size="pageSize_" :page-sizes="pageSizes" :page-count="pageCount" :total="totalElements ? totalElements : totalItems" @current-change="handlePageChange" @size-change="handlePageSizeChange"></ods-pagination>
    </ods-row>
  </ods-module>
  </template>

<script>
/**
 * @description TableLayout.
 * @component
 * @vue-data {Number} page_ - Used to internal control the number of page is showing.
 * @vue-data {Number} pageSize_ - Used to internal control the number of rows is showing per page.
 * @vue-prop {Boolean} [loading=false] - For show a loading effect in table.
 * @vue-prop {Boolean} [header=false] - If show header.
 * @vue-prop {String} [query=''] - regExp to search value in data of table is showing.
 * @vue-prop {String} [pagination='server'] - Type of pagination applicated it cans be 'none', 'client', 'server'.
 * @vue-prop {Boolean} [paginationDisabled=false] - Use this property to disable the functionality of pagination though the paginator is show.
 * @vue-prop {Number} [page=1] - Number or page It is showing. This prop is use with '.sync' modification because when pagination is in server this value is modificate inside of component and update outside of component.
 * @vue-prop {Number} [pageSize=100] - Number of items are show per page. This prop is use with '.sync' modification because when pagination is in server this value is modificate inside of component and update outside of component.
 * @vue-prop {Number} [minimumPageSize= 10] - This value is use for to create a list of values for a select component to chage the pageSize. The list start for minimumPageSize, next value is minimumPageSize * 2 and so on.
 * @vue-prop {Array} data - Array of values that they are showing into ods-table child.
 * @vue-prop {Boolean} [paginationSmall=true] - When show pagination, that it is show in her small variant.
 * @vue-prop {Number} [totalElements=0] - Number total of elements. This prop is used to calculete a number of pages that is necesary to show all values. When pagination is server this value is necesary because "data" is contain only a partial section of all values to show.
 * @vue-prop {Boolean} [fullHeight=false] - If tableLayout is grow as maximum to height of container and so ods-table child use vertical scroll to show all info if this is higher than container.
 * @vue-event {Object} pagination - Emit Pagination info when click in one pagination number. Example { page: 2, pageSize: 100 }
 **/
import { SearchMethod } from '@/mixins/methods'
export default {
  name: 'TableLayout',

  mixins: [SearchMethod],

  props: {
    loading: {
      type: Boolean,
      default: false
    },

    query: {
      type: String,
      default: ''
    },

    pagination: {
      type: String,
      default: 'server',
      validator: (val) => ['none', 'client', 'server'].includes(val)
    },

    paginationDisabled: {
      type: Boolean,
      default: false
    },

    page: {
      type: Number,
      default: 1
    },

    pageSize: {
      type: Number,
      default: 100
    },

    minimumPageSize: {
      type: Number,
      default: 25
    },

    data: {
      type: Array,
      required: true
    },

    paginationSmall: {
      type: Boolean,
      default: true
    },

    totalElements: {
      type: Number,
      default: 0
    },

    fullHeight: {
      type: Boolean,
      default: false
    },

    withBackground: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      page_: 1,
      pageSize_: 0,
      key: 0
    }
  },

  computed: {
    withScrollBar () {
      return this.totalElements > this.pageSize
    },

    layout () {
      const defaultItems = ['total']
      const optionalItems = ['sizes', 'pager', 'prev', 'next']
      // return this.totalElements <= this.pageSize_ ? defaultItems.join(', ') : [...defaultItems, ...optionalItems].join(', ')
      return [...defaultItems, ...optionalItems].join(', ')
    },

    totalItems () {
      return this.filteredData.length
    },

    paginatedData () {
      return this.pagination === 'client'
        ? this.filteredData.slice(
          this.pageSize_ * this.page_ - this.pageSize_,
          this.pageSize_ * this.page_
        )
        : this.filteredData
    },

    filteredData () {
      return this.query === '' ? this.data : this.search(this.data, this.query)
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

    pageCount () {
      return Math.floor(this.totalElements / this.pageSize)
    },

    hasHeaderLeftSlot () {
      return !!this.$slots.headerLeft
    },
    hasHeaderRightSlot () {
      return this.$slots.headerRight
    },
    hasComplexHeaderSlot () {
      return this.hasHeaderLeftSlot || this.hasHeaderRightSlot
    },
    hasHeaderSlot () {
      return !!this.$slots.header
    }
  },

  watch: {
    // loading (val) {
    //   const target = this.$refs.tableBody.querySelector('.ods-scrollbar__view')
    //   val ? this.showLoading(target) : this.hideLoading()
    // },

    paginatedData (data) {
      if (!data.length) this.page_ = 1
    },

    page: {
      immediate: true,
      handler: function (page) {
        this.page_ = page
        this.controlScrollHeight()
      }
    },

    pageSize: {
      immediate: true,
      handler: function (pageSize) {
        this.pageSize_ = pageSize
      }
    },

    data: {
      handler: function () {
        this.controlScrollHeight()
      }
    },

    filteredData: {
      handler: function () {
        this.controlScrollHeight()
      }
    }
  },

  mounted () {
    if (this.fullHeight) {
      window.addEventListener('resize', this.controlScrollHeight, false)
    }
  },

  unmounted () {
    if (this.fullHeight) {
      window.removeEventListener('resize', this.controlScrollHeight, false)
    }
  },

  methods: {
    controlScrollHeight () {
      this.$nextTick(() => {
        // Search table
        const OdsTable = this.$el.querySelector('[data-name="OdsTable"]')
        if (!OdsTable) return
        // Search ods-scrollbar in table
        const odsScrollbar = OdsTable.querySelector('.ods-scrollbar')
        // __vue__ contain the info of ods-table vue component
        const OdsTableVueComponent = OdsTable.__vue__
        // To force a recalculate height set null height of scrollbar
        odsScrollbar.style.height = null
        if (this.fullHeight) {
          const container = this.$el.parentElement
          const parentContainer = container.parentElement
          if (container && parentContainer) {
            container.style.height = null
            // If parent of table is higher than her parent set grandparent height to parent element
            if (parentContainer.offsetHeight < container.offsetHeight) {
              container.style.height = `${parentContainer.offsetHeight}px`
            }
          }
          // resizeListener recalculate heights within the ods-table component
          OdsTableVueComponent.resizeListener()
          // It happens sometimes that resizeListener not set height to within ods-scrollbar in this case it set the height manually
          if (!odsScrollbar.style.height) {
            odsScrollbar.style.height = `${
              OdsTable.offsetHeight -
              OdsTable.querySelector('.ods-table__header-wrapper').offsetHeight
            }px`
          }
        } else {
          OdsTableVueComponent.resizeListener()
        }
        // call method of ods-scrollbar to update the size of scrollbars
        odsScrollbar.__vue__.update()
      })
    },

    handlePageSizeChange (pageSize) {
      this.pageSize_ = pageSize
      this.handlePageChange(this.page_)
    },

    handlePageChange (page) {
      this.page_ = page
      this.$emit('update:page', page)
      this.$emit('update:pageSize', this.pageSize_)
      this.$emit('pagination', { page, pageSize: this.pageSize_ })
      // this.$scrollTo(this.$el, 500, { offset: -103 })
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .ods-pagination {
  & .ods-pagination__leftwrapper {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  & .ods-pagination__sizes {
    margin-right: auto;
  }
  & .ods-select .ods-input__suffix .ods-select__caret {
    height: 100%;
  }
  & .btn-prev .ods-icon,
  & .btn-next .ods-icon {
    font-size: rem(14);
  }
}

.table-layout {
  position: relative;
  z-index: 0;
  // padding-top: grid(2);
  background-color: transparent;
  padding-bottom: 0;
  border: 0;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  width: 100%;

  &--with-header {
    padding-top: 0;
  }
  &--full-height {
    height: 100%;
  }
  * {
    box-sizing: border-box;
  }
  ::v-deep .ods-module__body {
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    & .ods-module__body {
      padding: 0;
    }
  }
  &__header {
    display: flex;
    align-items: center;
    min-height: rem(48);
    &-item {
      display: flex;
      justify-content: center;
      &--left {
        // margin-right: auto;
        flex-direction: column;
      }
      &--right {
        margin-left: auto;
        flex-direction: column;
      }
    }
  }
  ::v-deep .ods-module__body {
    padding: 0;
    display: flex;
    flex: 1 1 0%;
  }
  * {
    box-sizing: border-box;
  }
  &__table {
    overflow: hidden;
    max-height: 100%;
    ::v-deep .ods-scrollbar__bar.is-horizontal {
      display: none;
    }
    &--full-height {
      height: 100%;
      overflow: hidden;
      display: flex;
      flex: 1 1 0%;
    }
    &.table-layout__table--with-bg {
      ::v-deep .ods-table {
        &__row {
          background-color: var(--color-bg-primary);
        }
      }
    }

    ::v-deep .ods-table {
      &__row {
        background-color: var(--color-bg-secondary);
      }
      td:not(.ods-table__expanded-cell) {
        padding: 0;
        font-size: $txt-body-300-size;
        font-weight: $txt-body-300-weight;
        color: var(--color-txt-primary);
      }
      th {
        .cell {
          font-size: $txt-body-300-size;
          font-weight: $txt-body-300-weight;
          color: var(--color-txt-secondary);
          min-height: auto;
          padding: 0 rem(8);
        }
      }
      .cell {
        min-height: rem(32);
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        padding: rem(8);
        word-break: break-word;
      }
      .caret-wrapper {
        display: flex;
        justify-content: center;
        height: rem(18);
      }

      &__expand-icon {
        width: rem(16);
        height: rem(16);
        // i {
        //   font-size: rem(16);
        //   line-height: rem(20);
        // }
      }
      &__expand-column {
        .ods-table__expand-icon {
          display: none;
        }
      }

      td.table-dropdown__col {
        .cell {
          padding: 0 rem(8);
        }
      }

      &__empty-block {
        background-color: var(--color-bg-secondary);
      }

      &__expanded-cell {
        padding: 0;

        &:hover {
          td {
            border-bottom: 1px solid var(--color-border-hard-divisor);
            background-color: initial;
          }
        }
      }

      td.selected {
        background-color: var(--color-bg-hover-2);
        border-bottom: 2px solid var(--color-border-interactive);
      }

      tr.hover-row {
        > td {
          // border-bottom: 1px solid var(--color-border-interactive);
        }
      }

      tr.expanded:hover + tr {
        > td {
          // background-color: var(--color-bg-hover-2);
          // border-bottom: 1px solid var(--color-border-interactive);
        }
      }
      .table-child {
        &.ods-table td:not(.ods-table__expanded-cell) {
          // border: 0;
          // color: var(--color-txt-secondary);
        }
      }
    }
  }
  &__footer {
    align-self: stretch;
    &--disabled {
      opacity: 0.5;
    }
  }

  ::v-deep .ods-loading-spinner {
    width: auto;
  }

  ::v-deep .ods-select.state-picker {
    .ods-input {
      .ods-input__inner {
        background-color: transparent;
        // transition: background-color .20s ease;
      }
      &:hover,
      &.is-focus {
        .ods-input__inner {
          background-color: var(--color-bg-hover-2);
        }
      }
    }
  }

  ::v-deep .ods-pagination {
    &__total {
      min-height: rem(32);
    }
  }
}
</style>
