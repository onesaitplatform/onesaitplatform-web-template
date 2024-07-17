<template>
  <drawer class="datasource-drawer" v-model="visible" v-on="$listeners" v-bind="$attrs" :type="'datasource'" :width="width" :title="title" :showClose="true" style="" :appendToBody="false" :direction="direction" >
      <template slot="content">
        <div style="width:100%; padding: 0px; margin-top:-20px;" :style="isHorizontal ? {height: '98vh'} : {height: '100%'}">
        <splitpanes class="default-theme" :horizontal="!isHorizontal" :push-other-panes="true">
          <pane max-size="100" size="45">
            <div class="datasources-settings">
              <datasource-settings ref="datasourceSettings" v-bind="$attrs" v-on="$listeners" @close-end="closeDatasourceDrawer" :datasource="selectedDatasource" :datasources="datasources" :ontologies="ontologies" :options="options"  @load:datasource="loadDatasource"  @run:datasource="runDatasource"></datasource-settings>
            </div>
          </pane>
          <pane max-size="100" size="55" >
            <div class="datasources-output">
               <!-- DATASOURCE OUTPUT: SCHEMA AND OUTPUT DATA -->
               <ods-tabs type="" style="width:100%">
                <ods-tab-pane>
                  <span slot="label">
                    <span class="ods-icon-front-micro" style="margin-right: 8px"/>{{ $t('tabOutput') }}</span>
                  <div>
                    <datasource-output :output="selectedResult" :schema="selectedSchema" :ontology="selectedOntology" :loading="isDatasourceLoading" :options="options"></datasource-output>
                  </div>
                </ods-tab-pane>
                <ods-tab-pane>
                  <span slot="label">
                    <span class="ods-icon-entity" style="margin-right: 8px"/>{{ $t('tabSchema') }}</span>
                  <div class="schema">
                    <datasource-schema :schema="selectedSchema" :ontology="selectedOntology" :loading="isSchemaLoading"></datasource-schema>
                  </div>
                </ods-tab-pane>
              </ods-tabs>
            </div>
          </pane>
        </splitpanes>
      </div>
      </template>
  </drawer>
</template>

<script>
import i18n from './lang'
import Drawer from '@/components/shared/Drawer'
import { ModalFunctionality } from '@/mixins/modal'
import DatasourceSettings from './settings/DatasourceSettings'
import DatasourceSchema from '@/components/datasources/settings/DatasourceSchema'
import DatasourceOutput from '@/components/datasources/settings/DatasourceOutput'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { query } from '@/services/querytool/querytool'
import { getDatasourceFields } from '@/services/datasources/datasources'

export default {
  name: 'DatasourceDrawer',
  i18n,
  components: {
    Drawer,
    Splitpanes,
    Pane,
    DatasourceSettings,
    DatasourceSchema,
    DatasourceOutput
  },
  // visible from mixin
  mixins: [ModalFunctionality],

  props: {
    gadget: {
      type: Object,
      default: () => {}
    },
    options: {
      type: Object,
      default: () => {}
    },
    datasources: {
      type: Array,
      default: () => []
    },
    ontologies: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: 'Datasources'
    },
    direction: {
      type: String,
      default: 'ltr'
    },
    width: {
      type: String,
      default: '45%'
    },
    init: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      datasource: null,
      datasourceResult: [], // datasource query result
      datasourceLoading: false,
      schema: [], // datasource schema
      schemaOntology: '', // datasource schema ontology
      schemaLoading: false
    }
  },
  computed: {
    isHorizontal () {
      return this.direction === 'btt' || this.direction === 'ttb'
    },
    isResultQuery () {
      return this.datasourceResult.length > 0
    },
    selectedDatasource () {
      return this.datasource ? this.datasource : null
    },
    selectedSchema () {
      return this.schema ? this.schema : []
    },
    isDatasourceLoading () {
      return this.datasourceLoading
    },
    isSchemaLoading () {
      return this.schemaLoading
    },
    selectedOntology () {
      return this.schemaOntology ? this.schemaOntology : ''
    },
    selectedResult () {
      return this.datasourceResult ? this.datasourceResult : []
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler: function (visible) {
        if (!this.visible) {
          this.closeDatasourceDrawer()
          if (this.$refs.datasourceSettings) { this.$refs.datasourceSettings.destroyEditor() }
        }
      }
    },
    init: {
      immediate: true,
      handler: function (initState) {
        if (initState) {
          this.datasource = null
        }
      }
    }
  },
  methods: {
    closeDatasourceDrawer () {
      console.log('closeDatasourceDrawer')
      this.schema = []
      this.datasource = null
      this.datasourceResult = []
    },
    loadDatasource (datasource) {
      console.log('Datasource selection: ', datasource)
      // init datasource data
      this.datasource = datasource
      this.schemaOntology = datasource ? datasource.ontology : ''
      this.schema = []
      this.datasourceResult = []
    },
    async runDatasource (datasource, editMode) {
      const self = this
      try {
        this.schemaLoading = true
        this.datasourceLoading = true
        this.datasourceResult = await query(datasource.query, datasource.ontology, datasource.offset)
        if (this.datasourceResult.length > 0) {
          if (editMode) {
            this.schemaOntology = datasource.ontology
            this.schema = await getDatasourceFields(datasource.identification)
            this.schemaLoading = false
          } else {
            // exist data but not schema due datasource is not created yet, so get schema from data
            var dataSchema = []
            const fields = Object.keys(Object.assign({}, ...self.datasourceResult))
            var types = []
            Object.values(self.datasourceResult[0]).forEach(function (item) { types.push(typeof item) })
            for (let i = 0; i < fields.length; i++) {
              var item = {}
              item.name = fields[i]
              item.type = types[i]
              dataSchema.push(item)
            }
            this.schemaOntology = datasource.ontology
            self.schema = dataSchema
            this.schemaLoading = false
          }
        }
      } catch (error) {
        console.log('Error Query Datasource ', error, self.datasourceResult)
        self.schema = []
        self.schemaLoading = false
        self.datasourceLoading = false
      } finally {
        this.datasourceLoading = false
        console.log('runDatasource finished')
      }
    }
  },
  mounted () {
    this.schema = []
    this.datasourceResult = []
  }
}
</script>

<style lang="scss">
  .datasource-drawer {
    padding: 0;
    position: absolute;
}

.datasources-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  -moz-column-gap: 1.5rem;
       column-gap: 1.5rem;
  row-gap: .5rem;
}
.datasources-settings {
  height: 100%;
  min-height: 200px;
    display: flex;
    flex-direction: row;
    justify-items: center;
    flex-wrap: nowrap;
    align-items: stretch;
    padding: 0px;
  padding: 0px;
  background-color: white;
}

.datasources-output {
  height: 100%;
  min-height: 200px;
    display: flex;
    flex-direction: row;
    justify-items: center;
    flex-wrap: nowrap;
    align-items: stretch;
    padding: 0px;
  background-color: white;
}

::v-deep div.splitpanes__splitter:before {
  background-color: var(--color-bg-interactive)!important;
  width: 2px!important;
  height: 20px!important;
}

::v-deep .splitpanes.default-theme .splitpanes__pane {
    background-color: white;
}

::v-deep div.splitpanes__splitter:after {
  background-color: var(--color-bg-interactive)!important;
  height: 20px!important;
  width: 2px!important;
}
::v-deep div.splitpanes__splitter {
  width: 8px!important;
  border-left: 1px solid var(--color-border-hard-divisor) !important;
  margin-left: -1px;
}

.splitpanes__splitter:after {
    transform: translateY(-50%);
    width: 2px!important;
    height: 20px!important;
}
.splitpanes__splitter:hover {
    border-left: 3px solid var(--color-bg-interactive)!important;
}
.schema {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  height: calc(100%);
}
.family {font-family: 'Poppins', 'Soho Gothic Pro'}
  </style>
