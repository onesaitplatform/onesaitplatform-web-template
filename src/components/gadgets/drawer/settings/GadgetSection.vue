<template>
  <div class="gadget-section">
    <p v-if="desc" class="gadget-section_description">{{ desc }}</p>
    <ods-form-item class="ods-flex ods-flex-col ods-items-start ods-py-2" :class="param.required ? 'is-required' : ''" v-for="(param, i) in elements" :key="'settings-input-' + name + '-' + i" :label="!isCheckbox(param) && !isSection(param) ? param.title : ''" size="default" :style="adjustDesc(param)">
       <!-- PARAMETERS -->
       <p v-if="!param.elements && !isRadio(param) && !isCheckbox(param) && !isSelect(param) && param.type !== 'input-text' && param.type !== 'input-number' && param.type !== 'ds-field' && param.type !== 'color-picker' && param.type !== 'autogenerate-id' && param.type !== 'model-selector'">type {{ param.type }} name {{ param.name }} label {{ param.title }}</p>

        <!-- INPUT -->
        <ods-input v-if="param.type == 'input-text'" :value="param.value"  :detail="param.desc ? param.desc : ''" @input="(value) => ( $emit('update:settings', { name: param.name, 'value': value, path:path }))" style="width: 100%;"/>
        <!-- INPUT AUTOGENERATE-ID -->
        <ods-input v-if="param.type == 'autogenerate-id'" :disabled="true" :value="param.value" @input="(value) => ( $emit('update:settings', { name: param.name, 'value': value, path:path }))" style="width: 100%;"/>

        <!-- NUMBER -->
        <ods-input type="number" v-if="param.type == 'input-number'" :min="param.min" :max="param.max" :precision="param.precision ? param.precision : 1" :value="param.value" :detail="param.desc ? param.desc : ''" @input="(value) => ( $emit('update:settings', { name: param.name, 'value': value, path:path }))" style="width: 100%;"/>

        <!-- COLOR PICKER -->
        <ods-color-picker v-if="param.type == 'color-picker'" :predefine="predefinedColors" :name="param.value + '_color_' + i"  v-bind="{ id: 'settings-input-' + param.name + '-' + i, label: param.name }" v-model="param.value" :show-alpha="true" :disabled="false" :value="param.value" :size="'default'" @change="(value) => ( $emit('update:settings', { name: param.name, 'value': value, path:path }))" style="width: 100%;"></ods-color-picker>
        <span v-if="param.desc && param.type == 'color-picker'" class="ods-input__detail detail_radio"> {{ param.desc ? param.desc : '' }}</span>

        <!-- RADIO -->
        <ods-radio-group  v-if="isRadio(param)"  :name="param.value + path + '_' + i" :multiple="false" v-model="param.value" @input="(value) => ( $emit('update:settings', { name: param.name, 'value': value, path:path }))" size="medium" :full-width="true">
          <ods-radio-button v-for="(item, radioIndex) in param.options" :key="item.value + path" v-bind="{id: 'settings-input-' + param.name + '-' + i + '_' + radioIndex, label: item.value}"></ods-radio-button>
        </ods-radio-group>
        <span v-if="param.desc && isRadio(param)" class="ods-input__detail detail_radio"> {{ param.desc ? param.desc : '' }}</span>

        <!-- CHECKBOX TO SWITCH -->
        <ods-switch v-if="isCheckbox(param)" :name="'settings-input-' + param.name + '-' + i" v-model="param.value"  :id="'settings-input-' + param.name + '-' + i" :label="param.title" :active-text="param.title" :key="'settings-input-' + param.name + '-' + i"  @change="(value) => ( $emit('update:settings', { name: param.name, 'value': value, path:path }))"></ods-switch>
        <span v-if="param.desc && isCheckbox(param)" class="ods-input__detail detail_checkbox"> {{ param.desc ? param.desc : '' }}</span>

        <!-- SELECT -->
        <ods-select v-if="isSelect(param)" v-model="param.value" :multiple="param.multiple" @change="(value) => ( $emit('update:settings', { name: param.name, 'value': value, path:path }))" style="width: 100%;">
            <ods-option v-for="item in param.options" :key="item.value" :label="item.text" :value="item.value">{{ item.text }}</ods-option>
        </ods-select>
        <span v-if="param.desc && isSelect(param)" class="ods-input__detail detail_radio"> {{ param.desc ? param.desc : '' }}</span>

        <!-- SELECT DS -->
        <ods-select v-if="param.type == 'ds-field' || param.type == 'ds-field(ds[0].)'" v-model="param.value"  :multiple="param.multiple" :value="param.value" @change="(value) => ( $emit('update:settings', { name: param.name, 'value': value, path:path }))" style="width: 100%;">
          <ods-option key="null" label="No field" :value="null"> </ods-option>
          <ods-option v-for="item in datasourceFields" :key="item.name" :label="item.name" :value="item.name">{{ item.label ? item.label : item.name }}</ods-option>
        </ods-select>

        <!-- SELECT MODEL-SELECTOR: TO-DO -->
        <ods-select v-if="param.type == 'model-selector'" v-model="param.value"  :multiple="param.multiple" :value="param.value" @change="(value) => ( $emit('update:settings', { name: param.name, 'value': value, path:path }))" style="width: 100%;">
          <ods-option v-for="item in generateValuesFromModelPath(param.path)" :key="item" :label="item" :value="item"></ods-option>
        </ods-select>

       <!-- SECTIONS -->
       <ods-divider    v-if="param.elements && param.type === 'section'" direction="horizontal" contentPosition="center">{{ param.title }}</ods-divider>
       <gadget-section v-if="param.elements && param.type === 'section'" :path="path + '.' + param.name" :mainSettings="mainSettings" :settings="settings[param.name]" :elements="param.elements" :name="param.name" :datasource="datasource" :datasources="datasources" :datasourceFields="datasourceFields"  v-on="$listeners" ></gadget-section>

       <!-- SECTION ARRAYS -->
       <ods-divider    v-if="param.elements && param.type === 'section-array'" direction="horizontal" contentPosition="left">{{ param.title }}</ods-divider>
       <gadget-section-array v-if="param.elements && param.type === 'section-array'" :path="path + '.' + param.name" :mainSettings="mainSettings" :settings="settings[param.name] ? settings[param.name] : [{}]" :elements="param.elements" :name="param.name" :datasource="datasource" :datasources="datasources" :datasourceFields="datasourceFields" v-on="$listeners" ></gadget-section-array>
    </ods-form-item>
  </div>
</template>

<script>
import GadgetSectionArray from './GadgetSectionArray'
export default {
  name: 'GadgetSection',
  components: {
    GadgetSectionArray
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
    datasourceFields: {
      type: Array,
      default: () => []
    },
    settings: {
      type: Object,
      default: () => {},
      required: true
    },
    mainSettings: {
      type: Object,
      default: () => {},
      required: true
    },
    elements: {
      type: Array,
      default: () => [],
      required: true
    },
    index: { // for section-array auto-increments
      required: false,
      type: Number,
      default: 0
    }
  },
  data () {
    return {
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
  watch: {
    elements (newValue) {
      this.setDefaults(newValue)
    }
  },
  methods: {
    setDefaults (newValue) {
      console.log('NEWELEMENTS: ', JSON.stringify(newValue))
    },
    // get data for autogenerate fields and paired  selectors on model-select
    generateValuesFromModelPath (path) {
      var splitedpath = path.split('.')
      var i = 0
      var auxmodel = this.mainSettings.parameters
      while (i < splitedpath.length) {
        var subpath = splitedpath[i]
        if (subpath === '*') {
          return auxmodel.map(function (data) {
            var auxdata = data
            for (let j = i + 1; j < splitedpath.length; j++) {
              auxdata = auxdata[splitedpath[j]]
            }
            return auxdata
          })
        } else {
          auxmodel = auxmodel[subpath]
        }
        i++
      }
      return [auxmodel]
    },
    adjustDesc (param) {
      if (param?.desc && (this.isCheckbox(param) || this.isRadio(param) || this.isSelect(param) || param.type === 'color-picker' || param.type === 'ds-field' || param.type === 'ds-field(ds[0].)')) {
        return { 'padding-bottom': '24px !important' }
      }
    }
  },
  computed: {
    isRadio () {
      return (param) => {
        return param.type === 'selector' && param.options.length < 4 // < 4 para radio
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
    isSection () {
      return (param) => {
        return param.type === 'section' || param.type === 'section-array'
      }
    },
    isSelect () {
      return (param) => {
        return ((param.type === 'selector' && param.options.length > 3)) // > 3
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
        const inputProps = this.isColorPicker(param) ? { label: param.name, showAlpha: true, predefine: this.predefinedColors, size: 'default' } : this.isCheckbox(param) ? { label: param.name }
          : this.isRadio(param)
            ? { label: param.options[i].value }
            : this.isSelect(param)
              ? param.type === 'ds-field'
                ? {
                  label: this.datasourceFields[i].name ? this.datasourceFields[i].name : '',
                  value: this.datasourceFields[i].name ? this.datasourceFields[i].name : ''
                }
                : {
                  label: param.options[i].value ? param.options[i].value : '',
                  value: param.options[i].value ? param.options[i].value : ''
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
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .ods-color-picker__panel {
    z-index: 99999 !important;
  }
.detail_checkbox {
  position: absolute;
  left: 0;
  top: 24px;
}
.detail_radio {
  position: absolute;
  left: 0;
  top: 38px;
}
</style>
