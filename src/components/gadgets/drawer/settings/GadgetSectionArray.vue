<template>
  <div v-show="changed" class="gadget-section-array">
    <p v-if="desc" class="gadget-section-array_description">{{ desc }}</p>
    <div>
        <ods-row v-for="(arrayitem, index) in settings" v-bind:key="index" class="section-row">
          <ods-col>
            <gadget-section :settings="arrayitem" :mainSettings="mainSettings" :elements="getElements(index)" :path="path + '.' + index" :name="name + index" :index="index" :datasource="datasource" :datasources="datasources" :datasourceFields="datasourceFields" v-on="$listeners" ></gadget-section>
          </ods-col>
          <ods-col class="btn-remove">
            <ods-button type="text" class="ods-button ods-tooltip ods-button--neutral ods-button--medium ods-button--only-icon ods-button--icon-right is-round" @click="remove(index)"><img src="/controlpanel/static/images/dashboards/remove.svg"/></ods-button>
          </ods-col>
        </ods-row>
      <ods-row>
        <ods-col class="btn-add">
          <ods-button class="ods-button ods-button--neutral ods-button--small ods-button--only-icon is-round" type="text" @click="add()"><i style="color: #606266" class="ods-icon-plus"></i> Add</ods-button>
        </ods-col>
      </ods-row>
    </div>
  </div>
</template>

<script>
// import GadgetSection from './GadgetSection'
export default {
  name: 'GadgetSectionArray',
  components: {
    GadgetSection: () => import('./GadgetSection')
  },
  props: {
    name: {
      type: String,
      default: ''
    },
    desc: {
      type: String,
      default: ''
    },
    path: {
      type: String,
      default: '',
      required: true
    },
    datasource: {
      type: Object,
      default: () => {},
      required: true
    },
    datasources: {
      type: Array,
      default: () => [],
      required: true
    },
    datasourceFields: {
      type: Array,
      default: () => []
    },

    // local settings
    settings: {
      required: true
    },
    // entire gadget settings needed for autogenerate and model-selector fields
    mainSettings: {
      type: Object,
      default: () => {},
      required: true
    },
    elements: {
      type: Array,
      default: () => [],
      required: true
    }
  },
  data () {
    return {
      value: [],
      changed: true
    }
  },
  watch: {},
  methods: {
    remove (index) {
      this.settings.splice(index, 1)
      this.changed = false
      setTimeout(() => { this.changed = true }, 10) // force render again
    },
    add () {
      var that = this
      // if this section-array has a autogenerate-id we need to push inside with value as index of new element.
      if (this.elements.filter(x => x.type === 'autogenerate-id').length > 0) {
        var autoArr = this.elements.filter(x => x.type === 'autogenerate-id')
        var autoObj = {}
        const newIndex = this.settings.length
        for (let i = 0; i < autoArr.length; i++) {
          autoObj[autoArr[i].name] = '' + newIndex
        }
        this.settings.push(autoObj)
        // has to update model
        for (const prop in autoObj) {
          console.log(`ADD: key: ${prop}, value: ${autoObj[prop]}, path: ${that.path}.${newIndex}`)
          // that.$emit('update:settings', { name: prop, value: autoObj[prop], path: that.path })
        }
      } else {
        this.settings.push({})
      }
      this.changed = false
      setTimeout(() => { this.changed = true }, 10) // force render again
    },
    getElements (index) {
      var localElements = JSON.parse(JSON.stringify(this.elements))
      this.recSetParams(localElements, this.settings[index], index)
      return localElements
    },
    // Get moded and params and add values to the model on all sections and sections-array
    recSetParams (model, params, index) {
      var that = this
      model.forEach(function (m) {
        if (m.type !== 'section' && m.type !== 'section-array') {
          if (m.type === 'autogenerate-id' && index > 0) {
            m.value = index
          } else {
            m.value = params[m.name] ? params[m.name] : m.default
          }
        } else {
          if (m.type === 'section') {
            console.log('SECTION OR SECTION ARRAY: ', m.elements, params[m.name])
            that.recSetParams(m.elements, params[m.name])
          } else {
            m.value = [{}]
          }
        }
      })
    }
  },
  computed: {}
}
</script>

<style lang="scss" scoped>
.section-row {
  border-bottom: 1px dotted #CCC;
}
.section-row:last-child {
  border-bottom: none;
}
.btn-remove{ text-align: right;}
.btn-add {
  text-align: left;
  margin-top: 12px;
}
::v-deep .ods-color-picker__panel {
    z-index: 99999 !important;
  }
</style>
