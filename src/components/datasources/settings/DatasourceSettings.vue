<template >
  <div class="datasource-settings">
    <ods-form ref="datasourceForm" class="datasource_form" :model="datasourceForm" :inline="true" :hide-required-asterisk="false">
      <div class="current-datasource">
        <ods-form-item class="ods-py-1 ods-pb-5">
          <!-- DATASOURCE SELECTOR -->
          <ods-tooltip  :content="$t('datasourceSelection')" :placement="'top'">
            <ods-dropdown @command="handleCommand" :text="datasourceDropdown.text" :icon="datasourceDropdown.icon" :disabled="datasourceDropdown.disabled" :placement="datasourceDropdown.placement" :trigger="datasourceDropdown.trigger" :hideOnClick="datasourceDropdown.hideOnClick" :arrow-visible="datasourceDropdown.arrowVisible">
              <span> {{ $t('loadDatasource') }} </span>
            <ods-dropdown-menu slot="dropdown">
              <ods-dropdown-item v-for="(item, index) in datasources" :key="index" :value="item" :command="item" :disabled="datasourceDropdown.disabledItem" :divided="datasourceDropdown.divided"  :section="datasourceDropdown.section" :icon="datasourceDropdown.iconItem">
                <template>
                  <div class="dsDesc">
                    <span><b>{{item.identification}}</b></span>
                    <span>{{ item.description }}</span>
                </div>
                </template>
              </ods-dropdown-item>
              <ods-dropdown-item divided :command="null" :key="datasources.length + 1"><b>{{ $t('newDatasource') }}</b></ods-dropdown-item>
            </ods-dropdown-menu>
          </ods-dropdown>
        </ods-tooltip>
        <!-- DATASOURCE FIELDS-->
        </ods-form-item>
        <ods-form-item prop="identification" class="ods-pb-5" :rules="[{required: true, message: $t('fieldRequired') },{ min: 5, max: 100, message: $t('field5Chars'), trigger: 'blur' }]">
            <ods-input v-model="datasourceForm.identification"  :size="'deci'" :placeholder="$t('identification')" :detail="$t('detailIdentification')" :readonly="false" />
        </ods-form-item>
        <ods-form-item prop="description" class="ods-pb-5" :rules="[{required: true, message: $t('fieldRequired'), trigger: 'blur' },{ min: 5, max: 100, message: $t('field5Chars'), trigger: 'blur' }]">
            <ods-input v-model="datasourceForm.description"  :size="'hecto'" :readonly="false"  :placeholder="$t('description')" :detail="$t('detailDescription')" />
        </ods-form-item>
        <ods-form-item prop="ontology" class="ods-pb-5"  :rules="[{ required: true, message: $t('fieldRequired'), trigger: ['change','blur']}]">
          <ods-select  v-model="datasourceForm.ontology" @change="updateCodeEditor($event, true)" :multiple="false" :disabled="false" :size="'default'"  :clearable="true" :placeholder="$t('entity')" :filterable="true" :loading-text="$t('loadEntity')" :no-match-text="$t('noEntity')" :no-data-text="$t('noData')">
            <ods-option v-for="(o,index) in ontologies" :key="index" :value="o.identification">
                <template>
                  {{o.identification}} <br>
                  <span style="font-size: 85%; color: #666">{{ o.description }}</span>
                </template>
              </ods-option>
          </ods-select>
          <span class="ods-input__detail"> {{ $t('detailEntity') }} </span>
        </ods-form-item>
        <ods-form-item prop="maxvalues" class="ods-pb-5"  :rules="[{ required: true, message: $t('maxvaluesReq'), trigger: 'blur' }]">
            <ods-input-number v-model="datasourceForm.maxvalues"  :size="'micro'" :placeholder="$t('maxvalues')" :min="0" :max="2000" :step="100" :detail="$t('detailMaxvalues')" :readonly="false"  @change="editLimit()"/>
        </ods-form-item>
        <ods-form-item prop="refresh" class="ods-pb-5"  :rules="[{ required: true, message: $t('refreshReq'), trigger: 'blur' }]">
            <ods-input-number v-model="datasourceForm.refresh"  :size="'micro'"  :placeholder="$t('refresh')" :min="0" :max="10000" :step="100" :detail="$t('detailRefresh')" :readonly="false" />
        </ods-form-item>

        <!-- FORM BTNs -->
        <ods-form-item  class="ods-pb-5" >
          <ods-tooltip  :content="$t('clearForm')" :placement="'top'">
            <ods-button size="mini" :type="'secondary'" :icon="'ods-icon-error'" :iconPosition="'left'" @click="clearForm('datasourceForm')" class="ods-mr-2 datasource-btn"></ods-button>
          </ods-tooltip>
          <ods-tooltip  :content="$t('runQuery')" :placement="'top'">
            <ods-button size="mini" :type="'secondary'" :icon="'ods-icon-play'" :iconPosition="'left'" :disabled="hasErrors" @click="submitForm('datasourceForm','RUN')" class="ods-mr-2 datasource-btn"></ods-button>
          </ods-tooltip>
          <ods-tooltip v-if="!isEditMode" :content="$t('newDatasource')" :placement="'top'">
            <ods-button size="mini" :type="'secondary'" :icon="'ods-icon-plus'" :iconPosition="'left'" :disabled="hasErrors"  @click="submitForm('datasourceForm','INSERT')" class="ods-mr-2 datasource-btn"></ods-button>
          </ods-tooltip>
          <ods-tooltip v-if="isEditMode"  :content="$t('saveDatasource')" :placement="'top'">
            <ods-button size="mini" :type="'secondary'" :icon="'ods-icon-save'" :iconPosition="'left'" :disabled="hasErrors"  @click="submitForm('datasourceForm','EDIT')" class="ods-mr-2 datasource-btn"></ods-button>
          </ods-tooltip>
        </ods-form-item>

        <!-- SQL EDITOR -->
        <div class="editor" :style="hasErrors ? {paddingTop: '12px'} : {paddingTop: '0px'}">
          <datasource-editor  :reference="'monacoEditor'" :codes="datasource_code" ref="editor" :width="'100%'" :height="'200px'" @action:update="updateCodeEditor"></datasource-editor>
        </div>
      </div>
    </ods-form>
  </div>
</template>

<script>
import i18n from '../lang'
import DatasourceEditor from '@/components/datasources/settings/DatasourceEditor'
import { createDatasource, editDatasource } from '@/services/datasources/datasources'

export default {
  name: 'DatasourceSettings',
  i18n,
  props: {
    datasources: {
      type: Array,
      default: () => []
    },
    ontologies: {
      type: Array,
      default: () => []
    },
    datasource: {
      type: Object,
      default: () => {}
    },
    options: {
      type: Object,
      default: () => {}
    },
    counter: {
      type: Number,
      default: 1
    }
  },
  components: {
    DatasourceEditor
    // splitplanes seguramente con el editor
  },
  data () {
    return {
      code: 'Select * from',
      dscode: null, // selected datasource query
      codeFromEditor: '',
      // datasource: {"identification": "string","query": "string","refresh": 0,"maxvalues": 0,"description": "string"}
      datasourceForm: {
        identification: '',
        query: '',
        refresh: 0,
        maxvalues: 0,
        description: '',
        ontology: '',
        type: 'SQL'
      },
      errors: false,
      datasourceDropdown: {
        text: '',
        icon: 'menu',
        disabled: false,
        arrowVisible: true,
        placement: 'bottom-start',
        trigger: 'click',
        hideOnClick: true,
        showTimeout: '250',
        hideTimeout: '150',
        rtl: false,
        disabledItem: false,
        divided: false,
        section: false,
        iconItem: 'ods-icon-database'
      },
      editMode: false,
      previousLimit: 0
    }
  },
  computed: {
    datasource_code () {
      return this.dscode || this.code
    },
    datasourceCounter () {
      return this.counter
    },
    newIdentification () {
      return 'NewDS_' + this.datasourceCounter
    },
    newDescription () {
      return 'Description NewDS_' + this.datasourceCounter
    },
    isEditMode () {
      return this.editMode
    },
    hasErrors () {
      return this.errors
    }
  },
  watch: {
    datasource: {
      immediate: true,
      handler (datasource) {
        if (datasource) {
          this.datasourceForm = {
            identification: datasource.identification,
            description: datasource.description,
            refresh: datasource.refresh,
            maxvalues: datasource.maxvalues,
            query: datasource.query,
            ontology: datasource.ontology
          }
          this.editMode = true
        } else {
          this.datasourceForm.identification = this.newIdentification
          this.datasourceForm.description = this.newDescription
          this.datasourceForm.maxvalues = 0
          this.datasourceForm.refresh = 0
          this.datasourceForm.ontology = ''
          this.datasourceForm.query = 'Select * from'
          // load query to query editor
          this.dscode = this.datasourceForm.query
          this.editMode = false
        }
        // save current limit
        this.previousLimit = this.datasourceForm.maxvalues
      }
    },
    datasourceForm: {
      deep: true,
      handler ({ identification, maxvalues, description, ontology, refresh }) {
        this.$nextTick(() => {
          this.validate()
          if (!this.hasErrors) {
            this.$refs.datasourceForm.clearValidate()
          }
        })
      }
    }
  },
  methods: {
    updateCodeEditor (code, ontology) {
      if (ontology) {
        this.datasourceForm.query = this.datasourceForm.maxvalues > 0 ? 'Select * from ' + code + 'LIMIT ' + this.datasourceForm.maxvalues : 'Select * from ' + code
        this.dscode = this.datasourceForm.query
      } else {
        this.datasourceForm.query = code
      }
    },
    editLimit () {
      const editorValue = this.$refs.editor.$refs.monacoEditor.__vue__.getValue()
      var isLimitDefined = editorValue.includes('LIMIT') || editorValue.includes('limit')

      if (this.$refs.editor && isLimitDefined) {
        const previousLimit = 'LIMIT\n  ' + this.previousLimit
        const currentLimit = 'LIMIT\n  ' + this.datasourceForm.maxvalues
        this.$refs.editor.$refs.monacoEditor.__vue__.findAndReplaceLimit(previousLimit, currentLimit)
      } else {
        this.dscode = this.datasourceForm.query + ' LIMIT ' + this.datasourceForm.maxvalues
      }
    },
    // datasource selector
    handleCommand (datasource) {
      if (datasource) {
        // fill current datasource form
        this.datasourceForm.identification = datasource.identification
        this.datasourceForm.description = datasource.description
        this.datasourceForm.maxvalues = datasource.maxvalues
        this.datasourceForm.refresh = datasource.refresh
        this.datasourceForm.ontology = datasource.ontology
        this.datasourceForm.query = datasource.query
        // load query to query editor
        this.dscode = datasource.maxvalues > 0 ? datasource.query + ' LIMIT ' + datasource.maxvalues : datasource.query
        // emit current datasource
        this.$emit('load:datasource', datasource)
        this.editMode = true
      } else {
        this.datasourceForm.identification = this.newIdentification
        this.datasourceForm.description = this.newDescription
        this.datasourceForm.maxvalues = 0
        this.datasourceForm.refresh = 0
        this.datasourceForm.ontology = ''
        this.datasourceForm.query = 'Select * from'
        // load query to query editor
        this.dscode = this.datasourceForm.query
        // emit current datasource
        this.$emit('load:datasource', null)
        this.editMode = false
      }
    },
    close (formName = 'datasourceForm') {
      this.clearForm(formName)
      this.$emit('action:closeSettings')
    },
    clearForm (formName) {
      this.$refs[formName].resetFields()
      this.$refs[formName].clearValidate()
    },
    submitForm (formName, action) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          var config = {}
          // tag system
          var tag = ''
          if (this.options) {
            tag = this.options.tag ?? ''
            if (tag) config.tag = tag
          }
          const body = { identification: this.datasourceForm.identification, query: this.datasourceForm.query, refresh: this.datasourceForm.refresh, maxvalues: this.datasourceForm.maxvalues, description: this.datasourceForm.description, ontology: this.datasourceForm.ontology }

          switch (action) {
            case 'RUN':
              this.$emit('run:datasource', this.datasourceForm, this.editMode)
              break
            case 'INSERT':
              this.createNewDatasource(body, config)
              break
            case 'EDIT':
              this.modifyDatasource(body, config)
              break
            case 'REMOVE':
              // standby
              break
            default:
              console.log('Unexpected Action Datasource Form')
          }
        } else {
          console.log('Errors on datasource form, please review.')
          return false
        }
      })
    },
    // create a new Datasource
    async createNewDatasource (datasource, config) {
      try {
        if (!datasource) { return false }
        const newDatasource = await createDatasource(datasource, config)
        if (newDatasource) {
          // send new datasource to parent
          this.$emit('load:datasource', newDatasource)
          this.$emit('reload:datasources', this.counter)
          this.editMode = true
        }
      } catch (error) {
        console.log('Error creating Datasource: ', error)
        const { message } = error // get error message
        if (message.includes('500')) {
          this.$notify({
            title: this.$t('notifyTitle'),
            message: this.$t('notifyMsgErrorPart1') + this.datasource.identification + this.$t('notifyMsgErrorPart2'),
            type: 'danger',
            iconClass: 'ods-icon-warning',
            duration: 5500,
            position: 'top-right',
            showClose: true
          })
        }
      } finally {
        console.log('createNewDatasource finished')
      }
    },
    // edit Datasource
    async modifyDatasource (datasource, config) {
      try {
        if (!datasource) { return false }
        const editedDatasource = await editDatasource(datasource, config)
        if (editedDatasource) {
          // send edited datasource to parent
          this.$emit('load:datasource', editedDatasource)
          this.editMode = true
        }
      } catch (error) {
        console.log('Error editing Datasource: ', error)
      } finally {
        console.log('modifyDatasource finished')
      }
    },
    // validate form
    validate () {
      const self = this
      let isValid = false
      this.$refs.datasourceForm.validate(async (valid) => {
        isValid = valid
        self.errors = !valid
      })
      const { identification, description, refresh, maxvalues, query, ontology } = this.datasourceForm
      const datasource = {
        identification: identification,
        description: description,
        refresh: refresh,
        maxvalues: maxvalues,
        query: query,
        ontology: ontology
      }
      this.$emit('validate', { isValid, datasource })
    },
    destroyEditor () {
      if (this.$refs.editor) { this.$refs.editor.$refs.monacoEditor.__vue__.disposeEditor() }
    }
  },
  mounted () {
    if (this.datasourceForm.ontology === '') {
      this.validate()
    }
  }
}
</script>

<style lang="scss" scoped>
.datasource-settings {
  padding: 0 .5rem 2rem 0rem;
  margin-bottom: 2rem;
  display: block;
  width: 100%;
  height: 100%;
}
.editor {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 200px;
  margin-top: 12px;
  padding-right: 12px;
}

button .datasource-btn i {
  margin-right: 0px!important;
}
.ods-button--only-icon i {
  margin-right: 0px!important;
}

.ods-form--inline .ods-form-item {
    display: inline-block;
    margin-right: 1rem!important;
    vertical-align: top;
}

.ods-select-dropdown__item { height: auto;}

.ods-dropdown {
  padding: .51rem .5rem;
  border: 1px solid var(--color-border-input);
  margin-top: -4px;
}

.dsDesc {
  font-size: 85%;
  color: #666;
  display: flex;
  flex-direction: column;
}
.form-inline-btns {
  float: right;
}
</style>
