<script>
export default {
  name: 'TableLayoutCommons',

  data () {
    return {
      pageSize: 100,
      totalElements: 0,
      totalPages: 0,
      sort: []
    }
  },

  computed: {
    getPopoverPlacement () {
      return (ref, index) => {
        const cell = this.$refs[`${ref}-${index}`]
        if (!cell) return
        const cellPosition = cell.$el.offsetParent.offsetTop
        const parent = cell.$parent.$el
        const parentHeight = parent.offsetHeight
        if (parentHeight - cellPosition < 130) {
          return 'top'
        }
        return 'bottom'
      }
    }
  },

  mounted () {
    // Search first element of APP that is data-name="OdsMain" to add tableModule data for that css apply specifict styles in this
    const odsMainEl = document.querySelector('[data-name="OdsMain"]')
    if (odsMainEl) odsMainEl.dataset.tableModule = true
  },

  unmounted () {
    const odsMainEl = document.querySelector('[data-name="OdsMain"]')
    odsMainEl && delete odsMainEl.dataset.tableModule
  },

  methods: {
    addRowToData ({ item, data, sort, getDataFunction }) {
      const mode = sort === 'asc' ? 'push' : 'unshift'
      if (
        this.totalPages &&
        this.pageSize &&
        this.totalElements &&
        this.totalElements === this.pageSize * this.totalPages
      ) {
        getDataFunction()
      } else {
        data[mode](item)
        this.totalElements++
      }
    },

    updateRowInData ({ item, data, searchFunction }) {
      const updatedItem = data.find(searchFunction)
      Object.keys(updatedItem).forEach((key) => (updatedItem[key] = item[key]))
    },

    async removeRowInData ({ deleteFunction, data, searchFunction, getDataFunction }) {
      await deleteFunction()
      if (data.length === this.pageSize && this.totalPages > 1) {
        getDataFunction()
      } else {
        data.splice(data.findIndex(searchFunction), 1)
        this.totalElements--
      }
    },
    /**
     * Controller for sort table. You need associate this method with event @sort-change of ods-table to listen de order and prop that component emit to use for order in api service.
     * parameters passed as arguments
     * @param {String} order     - The order to short it can be ['descending', 'descending', null]
     * @param {String} prop - The prop that it is use for ordenate the table
     * @param {Function} service - The function that contain a call to api service that it will be call when finish assignation the sort info to data (this.sort). Remember you need add sort info into the api call for that it work done
     * example
     *  @sort-change='({ order, prop }) => sortTable(order, prop, () => getCompanies({ page: 1, pageSize: pageSize }))'
     */
    sortTable (order, prop, service) {
      let ord = null
      switch (order) {
        case 'descending':
          ord = 'desc'
          break
        case 'ascending':
          ord = 'asc'
          break
        default:
          ord = null
      }
      const newOrder = ord ? `${prop},${ord}` : null

      if (this.sort.some((item) => item.includes(prop)) || !newOrder) {
        const itemIndex = this.sort.findIndex((item) => item.includes(prop))
        this.sort.splice(itemIndex, 1, newOrder)
      } else {
        this.sort = [newOrder]
      }
      this.sort = this.sort.reduce((acc, val) => {
        if (!acc.includes(val) && val) {
          acc.push(val)
        }
        return acc
      }, [])
      service()
    }
  }
}
</script>

<style lang="scss">
[data-table-module] {
  [ods-data='ods-content'] {
    > [data-name='OdsScrollbar'] {
      padding: grid(2.5);

      > .ods-scrollbar__view {
        height: 100%;
        padding: grid(0.25);
        box-sizing: border-box;
        overflow: hidden;
      }
    }
  }
}
// This class is need add to first element of view to fixed height functionality working well
.fixed-height-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
