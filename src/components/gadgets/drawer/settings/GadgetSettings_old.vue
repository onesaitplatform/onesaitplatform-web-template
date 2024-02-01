<template lang="pug">
.gadget-settings
    ods-form
      .gadget-settings__group.ods-pb-3(v-if="showGeneralConfig")
        ods-form-item.ods-mt-0.ods-pb-1(:label="$t('name')")
          ods-input(
            type="text"
            v-model="name_"
            @change="(value) => $emit('update:name', value)")
        ods-form-item.ods-py-1(:label="$t('datasource')")
          ods-select(
            v-model="datasource_"
            value-key="identification"
            @change="(value) => $emit('update:datasource', { name: value.identification, refresh: 0, type: 'query' })")
            ods-option(
              v-for="d in datasources"
              :key="`datasource-${d.identification}`"
              :value="d"
              :label="d.identification")
      .gadget-settings__group.ods-pb-2(
          v-for="section in sections_"
          :class="section.parentSection ? 'subsection' : ''"
          :style="section.elements.length === 0 ? 'border-bottom: none;' : ''"
          :key="section.name"
          )
        p.ods-txt-title-100.ods-pb-1(:class="section.parentSection ? 'section-with-subsections' : 'section-only'") {{ section.name }}
        ods-form-item.ods-flex.ods-flex-col.ods-items-start.ods-py-2(
          v-for="(param, i) in section.elements"
          :key="`param-${param.name}` + i + '_' + param.section"
          :label="!isCheckbox(param) && !isRadio(param) ? $t(`${param.name}`) : ''"
          size="default")
          component(
            :is="isRadio(param) ? 'ods-radio-group' : isSelect(param) ? 'ods-select' : 'div'"
            :multiple="isTable(param)"
            v-model="param.value"
            @change="(value) => (isTable(param) ? changeColumns(param.name, value, section.name, i) : isRadio(param) || isSelect(param) ? $emit('update:settings', { label: param.name, value, section: section.name }) : null)")
            component(
              v-for="(input, i) in getInput(param)"
              :is="getInput(param)[i]"
              :key="`settings-input-${input}-${i}`"
              v-model="isSelect(param) ? (param.type === 'ds-field' ? datasourceFields[i].name : param.options[i].value) : param.value"
              v-bind="getProps(param, i)"
              @change="(value) => $emit('update:settings', { label: param.name, value, section: section.name })")
              span(v-if="isRadio(param)") {{ $t(`${param.options[i].value}`) }}
              .ods-flex.ods-justify-between(
                v-if="isSelect(param) && param.name === 'dateFormat'")
                span.ods-mr-4.ods-txt-body-300 {{ param.options[i].value }}
                span.ods-txt-placeholder(:style="{ color: '#505D66' }") {{ new Date() | formatDate(param.options[i].value) }}
          ods-tree.draggable-tree(
            ref="DraggableTree"
            v-if="isTable(param)"
            :data="getColumns(param)"
            draggable
            @node-drag-end="handleDragEnd"
            :allow-drop="allowDrop")
            template(v-slot:default="{ node, data }")
              .gadget-settings__drag-item.draggable-item.ods-flex
                ods-icon.ods-mr-2(name="drag" size="14")
                .draggable-item__box
                  .ods-txt-subtitle-100.ods-mb-2 {{ $t("column", { i: columns.findIndex((c) => c.value === data.value) + 1 }) }}
                  ods-tag {{ data.value }}
                  ods-input.ods-flex.ods-flex-wrap.ods-my-2(
                    type="text"
                    :label="$t('columnsName')"
                    full
                    v-model="data.label")
</template>

<script>
import i18n from './lang'
import { FormatDateFilter } from '@/utils/filters'
import { getDatasourceFields } from '@/services/datasources/datasources'

export default {
  name: 'GadgetSettings',

  i18n,

  mixins: [FormatDateFilter],

  props: {
    name: {
      type: String,
      default: ''
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

  data () {
    return {
      name_: '',
      datasource_: '',
      settings_: [],
      sections_: [],
      datasourceFields: [],
      columns: [],
      columns_: [],
      // for color-picker inputs
      predefinedColors: [
        '#ff4500',
        '#ff8c00',
        '#ffd700',
        '#90ee90',
        '#00ced1',
        '#1e90ff',
        '#c71585',
        'rgba(255, 69, 0, 0.68)',
        'rgb(255, 120, 0)',
        'hsv(51, 100, 98)',
        'hsva(120, 40, 94, 0.5)',
        'hsl(181, 100%, 37%)',
        'hsla(209, 100%, 56%, 0.73)',
        '#c7158577'
      ]
    }
  },

  computed: {
    isRadio () {
      return (param) => {
        return param.type === 'selector' && param.options.length < 4
      }
    },
    isCheckbox () {
      return (param) => {
        return param.type === 'checkbox'
      }
    },
    isColorPicker () {
      return (param) => {
        return param.type === 'color-picker'
      }
    },
    isSelect () {
      return (param) => {
        return (
          (param.type === 'selector' && param.options.length > 3) ||
          param.type === 'ds-field'
        )
      }
    },
    isTable () {
      return (param) => {
        return param.type === 'ds-field' && param.name === 'columns'
      }
    },
    getInput () {
      return (param) => {
        const formInput = this.isColorPicker(param) ? ['ods-color-picker'] : this.isCheckbox(param) ? ['ods-checkbox'] : this.isRadio(param) ? ['ods-radio-button', 'ods-radio-button', 'ods-radio-button'].filter((r, i) => i < param.options.length) : param.type === 'input-text' ? ['ods-input'] : param.type === 'input-number' ? ['ods-input-number'] : this.isSelect(param) ? param.type === 'ds-field' ? Array(this.datasourceFields.length).fill('ods-option') : Array(param.options.length).fill('ods-option') : ['ods-input']
        return [...formInput]
      }
    },
    getProps () {
      return (param, i) => {
        const inputProps = this.isColorPicker(param) ? { label: this.$t(`${param.name}`), showAlpha: true, predefine: this.predefinedColors, size: 'default' } : this.isCheckbox(param) ? { label: this.$t(`${param.name}`) }
          : this.isRadio(param)
            ? { label: param.options[i].value }
            : this.isSelect(param)
              ? param.type === 'ds-field'
                ? {
                  label: this.datasourceFields[i].name,
                  value: this.datasourceFields[i].name
                }
                : {
                  label: this.$t(`${param.options[i].value}`),
                  value: param.options[i].value
                }
              : {}
        return inputProps
      }
    },
    getColumns () {
      return (param) => {
        const columns = this.columns.filter((c) =>
          param.value.includes(c.value)
        )
        return columns.sort((a, b) => {
          return param.value.indexOf(a.value) - param.value.indexOf(b.value)
        })
      }
    },
    setParams () {
      return (params, section, sectionParent) => {
        return params.filter(x => x.type !== 'section').map((param) => {
          return {
            ...param,
            value: sectionParent ? this.settings.parameters[sectionParent][section][param.name] : this.settings.parameters[section][param.name],
            section: section
          }
        })
      }
    }
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
        var subsections = []

        // func recursive to get all sections inside sections , and section-array
        var getSubSections = function (sections) {
          const existSubSections = (section) => { return section.elements.filter(x => x.type === 'section').length > 0 }

          // iterate on section elements
          sections.forEach(function (section, indexSection) {
            if (existSubSections(section)) {
              console.log('Section ', section.name, ' has ', section.elements.filter(x => x.type === 'section').length, 'subSections:')
              console.log(section.elements.filter(x => x.type === 'section').map(y => y.name).join('\n'))
              section.elements.filter(x => x.type === 'section').forEach(function (subsection, indexSubSection) {
                subsections.push({ ...subsection, parentSection: section.name })
              })
            }
          })
          return subsections
        }

        var allSections = []
        var allSubSections = getSubSections(sections)
        console.log('subSections:', allSubSections, allSections)
        // add sections and subsections to one flat sections array
        for (let i = 0; i < sections.length; i++) {
          if (allSubSections.filter(x => x.parentSection === sections[i].name).length > 0) {
            // add section
            allSections.push(sections[i])
            // add all subsections
            allSubSections.filter(x => x.parentSection === sections[i].name).forEach(elem => allSections.push(elem))
          } else {
            // common section (no subsections)
            allSections.push(sections[i])
          }
        }
        console.log('ALLSECTIONS: ', allSections)

        // find and add sub sections for each section
        this.sections_ = allSections.map((section) => {
          return {
            ...section,
            elements: this.setParams(section.elements, section.name, section.parentSection ? section.parentSection : '')
          }
        })
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
}
</style>
