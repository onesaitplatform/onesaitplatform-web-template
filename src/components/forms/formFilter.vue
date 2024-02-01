<!-- GLOBAL FILTER FORM GENERATOR -->
<template>
  <div :style="setFormStyle">
    <component v-for="(field, index) in filters"
     :key="`${componentKey}-${index}`"
     :is="field.schema.fieldType"
     :value="field.filter.activeFilter"
     :field="field"
     :dashboardId="dashboardId"
     :location="location"
     :total="filters.length"
     v-bind="field"
     >
    </component>
  </div>
</template>

<script>
import SelectList from './selectList'
import datePicker from './datePicker'
export default {
  name: 'FormFilter',
  components: { SelectList, datePicker },
  props: {
    filters: { type: Array, required: true },
    dashboardId: { type: String, required: true },
    location: { type: String, required: true }
  },
  data () {
    return {
      componentKey: 0
    }
  },
  computed: {
    setFormStyle () {
      return (this.location && this.location === 'topBarFilter') ? { display: 'inline-flex' } : {}
    }
  },
  methods: {
    handleAllFields () {
      var list = this.filters.map(x => x.id)
      console.log('HANDLE FIELDS ON FORM GENERATOR...')
      for (let i = 0; i < list.length; i++) {
        console.log('FIELD: ', list[i])
      }
      if (list.length > 0) { this.forceRerender() }
    },
    forceRerender () {
      this.componentKey += 1
    }
  },
  mounted () {
    // READ FIELDS INFO AND INIT THE FIELDS OR MAKE OTHER ACTIONS (enable,disabled,visible,...) TO OTHER FIELDS
    // this.handleAllFields()
  }
}
</script>
