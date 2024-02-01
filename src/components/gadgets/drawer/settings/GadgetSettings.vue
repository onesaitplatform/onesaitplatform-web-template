<template >
  <div class="gadget-settings">
      <ods-form>
        <!-- GADGET MAIN INFO -->
        <div class="gadget-settings__group ods-pb-3" v-if="showGeneralConfig">
          <ods-form-item class="ods-mt-0 ods-pb-1" :label="$t('name')">
            <ods-input type="text" v-model="name_" @change="(value) => $emit('update:name', value)"></ods-input>
          </ods-form-item>
          <!-- show/hide gadget header -->
          <ods-form-item class="ods-mt-0 ods-pb-1">
            <ods-checkbox v-model="header_" @change="(value) => $emit('update:header', value)">
              {{ $t('header_label') }}
            </ods-checkbox>
          </ods-form-item>
          <ods-form-item class="ods-py-1" :label="$t('datasource')">
            <ods-select v-model="datasource_"  @change="(value) => $emit('update:datasource', { name: value.identification, refresh: 0, type: 'query' })">
              <ods-option v-for="(d,index) in datasources" :key="`datasource-${d.identification}` + index " :value="d" :label="d.identification"></ods-option>
            </ods-select>
          </ods-form-item>
        </div>
        <!-- GADGET´S SECTIONS-->
        <ods-accordion v-model="mainSections" :accordion="false" :size="size !== 'default' ? size : null">
          <ods-accordion-item v-for="section in sections_" :key="section.name" :name="section.name" :title="Capitalize(section.title)">
            <gadget-section v-if="section.type ==='section'" :mainSettings="settings" :settings="settings.parameters[section.name]" :elements="section.elements" :path="section.name" :name="section.name" :datasource="datasource" :datasources="datasources" :datasourceFields="datasourceFields" v-on="$listeners" ></gadget-section>
            <gadget-section-array v-if="section.type === 'section-array'" :path="section.name" :mainSettings="settings" :settings="settings.parameters[section.name]" :elements="section.elements" :name="section.name" :datasource="datasource" :datasources="datasources" :datasourceFields="datasourceFields" v-on="$listeners" ></gadget-section-array>
          </ods-accordion-item>
        </ods-accordion>
      </ods-form>
      </div>
  </template>

<script>
import i18n from './lang'
import { FormatDateFilter } from '@/utils/filters'
import { Capitalize } from '@/utils/functions'
import { getDatasourceFields } from '@/services/datasources/datasources'
import GadgetSection from './GadgetSection'
import GadgetSectionArray from './GadgetSectionArray'

export default {
  name: 'GadgetSettings',

  i18n,

  mixins: [FormatDateFilter],

  props: {
    name: {
      type: String,
      default: ''
    },
    header: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      default: ''
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
    settings: {
      type: Object,
      default: () => {}
    },
    sections: {
      type: Array,
      default: () => [],
      required: true
    },
    showGeneralConfig: {
      type: Boolean,
      default: true
    }
  },
  components: {
    GadgetSection,
    GadgetSectionArray
  },
  data () {
    return {
      name_: '',
      datasource_: '',
      settings_: [],
      sections_: [],
      datasourceFields: [],
      columns: [],
      columns_: [],
      mainSections: [],
      size: 'default'
    }
  },
  computed: {
  },
  watch: {
    category: {
      immediate: true,
      handler (category) {
        if (category && !category.includes('ods')) this.$emit('update:name', `ods-${this.category}`)
      }
    },
    name: {
      immediate: true,
      handler (name) {
        this.name_ = name
      }
    },
    header: {
      immediate: true,
      handler (header) {
        this.header_ = header
      }
    },
    datasource: {
      immediate: true,
      handler (datasource) {
        this.datasource_ = datasource.name || datasource.identification
        this.datasourceFields = []
        this.getDatasourceFields(this.datasource_)
      }
    },
    settings: {
      immediate: true,
      handler (settings) {
        const sections = JSON.parse(JSON.stringify(this.sections))
        // find and add sub sections for each section
        this.sections_ = this.getModel(sections)
      }
    },
    columns: {
      deep: true,
      handler (columns) {
        if (!this.sections_.find((s) => s.name === 'columns')) return
        const values = this.sections_
          .find((s) => s.name === 'columns')
          .elements.find((e) => e.name === 'columns').value
        const cols = columns
          .filter((c) => values.includes(c.value))
          .sort((a, b) => {
            return values.indexOf(a.value) - values.indexOf(b.value)
          })
        this.$emit('update:settings', {
          label: 'columns',
          value: JSON.parse(JSON.stringify(cols.map((c) => c.value))),
          section: 'columns'
        })
        this.$emit('update:settings', {
          label: 'columnsNames',
          value: JSON.parse(JSON.stringify(cols.map((c) => c.label))),
          section: 'columns'
        })
      }
    },
    getColumns: {
      immediate: true,
      deep: true,
      handler (columns) {
        if (!this.sections_.find((s) => s.name === 'columns')) return
        this.columns_ = JSON.parse(JSON.stringify(columns))
      }
    }
  },
  methods: {
    Capitalize,
    // Get moded and params and add values to the model on all sections and sections-array
    recSetParams (model, params) {
      var that = this
      model.forEach(function (m) {
        if (m.type !== 'section' && m.type !== 'section-array') {
          if (params) {
            m.value = params[m.name] ? params[m.name] : m.default
            console.log('PARAM: ', m.value)
          } else {
            m.value = m.default ? m.default : ''
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
    },

    // get sections and set params by path
    getModel (sections) {
      this.recSetParams(sections, this.settings.parameters)
      return sections
    },
    allowDrop (draggingNode, dropNode, dropType) {
      return dropType !== 'inner'
    },
    handleDragEnd (draggingNode, dropNode, dropType, ev) {
      if (dropType !== 'inner') {
        const cols =
          this.$refs.DraggableTree.length &&
          this.$refs.DraggableTree[0]._data.root.data
        this.$emit('update:settings', {
          label: 'columns',
          value: JSON.parse(JSON.stringify(cols.map((c) => c.value))),
          section: 'columns'
        })
        this.$emit('update:settings', {
          label: 'columnsNames',
          value: JSON.parse(JSON.stringify(cols.map((c) => c.label))),
          section: 'columns'
        })
      }
    },

    changeColumns (label, value, section, i) {
      this.$emit('update:settings', { label, value, section })
      const columnsNames = this.columns
        .filter((c) => value.includes(c.value))
        .map((c) => c.label)
      this.$emit('update:settings', {
        label: 'columnsNames',
        value: columnsNames,
        section
      })
    },

    async getDatasourceFields (id) {
      const fields = await getDatasourceFields(id)
      this.datasourceFields = fields
      if (!this.sections_.find((s) => s.name === 'columns')) return
      const columns = this.sections_
        .find((s) => s.name === 'columns')
        .elements.find((e) => e.name === 'columns').value
      const columnsNames = this.sections_
        .find((s) => s.name === 'columns')
        .elements.find((e) => e.name === 'columnsNames').value
      const cols = columns.map((c, i) => {
        return { value: c, label: columnsNames[i] }
      })
      this.columns = fields.map(({ name }, i) => {
        return {
          value: name,
          label:
            (cols.find((c) => c.value === name) &&
              cols.find((c) => c.value === name).label) ||
            ''
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.gadget-settings {
  padding-right: rem(16);
  margin-bottom: rem(64);
  &__group {
    border-bottom: 1px solid var(--color-border-hard-divisor);
    margin-bottom: rem(12);
  }
  ::v-deep .ods-form-item {
    &__content {
      width: 100%;
    }
    &__label {
      float: none;
      text-align: left;
    }
  }

  ::v-deep .ods-tree {
    &-node {
      margin-top: rem(16);
      &__content {
        padding: 0;
        width: 100%;
        .draggable-item {
          // width: 100%;
          padding: rem(8);
          background-color: var(--color-bg-primary);
          border: 1px solid var(--color-border-soft-divisor);

          &:hover {
            border-color: var(--color-border-interactive);
          }
        }
        .ods-icon-drag {
          color: var(--color-txt-avatar);
        }
      }
    }
  }
  .section-with-subsections{
    border-bottom: 1px dashed #555;
    text-align: center;
  }

  .section-only{
    border-bottom: 1px solid var(--color-border-hard-divisor);
    margin-bottom: rem(12);
  }

  .subsection{
    background-color: #f9f9f9;
    padding: 0.5rem 1rem;
    border: 1px solid #c0c4cc;
    border-radius: 4px;
  }
  .ods-accordion {
    padding: 0!important;
  }
  .ods-accordion-item__header {
    padding: 0.8rem!important;
  }

  ::v-deep .ods-color-picker__panel {
    z-index: 99999 !important;
  }
}
</style>
