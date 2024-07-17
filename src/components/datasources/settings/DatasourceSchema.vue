
<template>
    <div class="datasource-schema" v-loading="loading" :loading-title="$t('loadingSchema')" :style="schema.length > 0 ? {alignItems: 'flex-start'} : {alignItems: 'center'}">
        <div class="schema-content" v-if="schema.length > 0 && !loading">
            <ods-accordion v-model="accordion" :accordion="false" :size="null">
                <ods-accordion-item v-for="(table, index) in schemaTables" :key="index" :name="table" :title="Capitalize(table)">
                    <div class="field-container family">
                       <div class="field" v-for="(field, index) in schemaFields" :key="index">
                            <span class="field_name">{{ field.name }}</span>
                            <span class="field_type">
                                <span class="type"> {{ field.type }}</span>
                            </span>
                       </div>
                    </div>
                </ods-accordion-item>
            </ods-accordion>
        </div>
        <div v-else class="no-schema family">
            <p class="ods-txt-title-150 ods-mb-1"><b>{{ $t('noSchemaFound') }}</b></p>
            <p>{{ $t('noSchemaMsg') }}</p>
        </div>
    </div>
</template>

<script>
import i18n from '../lang'
import { Capitalize } from '@/utils/functions'
export default {
  name: 'DatasourceSchema',
  i18n,
  components: {},

  props: {
    schema: {
      type: Array,
      default: () => []
    },
    ontology: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      accordion: [],
      tables: [],
      fields: []
    }
  },
  computed: {
    schemaTables () {
      return this.tables.length > 0 ? this.tables : []
    },
    schemaFields () {
      return this.fields.length > 0 ? this.fields : []
    }
  },
  watch: {
    schema: function (newSchema) {
      if (newSchema) {
        this.initSchema(newSchema)
      }
    }
  },
  methods: {
    Capitalize,
    // INIT MAIN SCHEMA into accordion systema and field tags
    initSchema (schema) {
      if (!schema) { return false }

      this.tables = []
      this.fields = []
      // init first table (ontology)
      this.accordion.push(this.ontology)
      this.tables.push(this.ontology)
      this.fields = this.schema
    }
  },
  mounted () {
    this.initSchema(this.schema)
  }
}
</script>

  <style scoped>
  .datasource-schema {
    width: 100%;
    height: auto;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 250px;
  }
  .schema-content {
    padding: 0;
    width: 100%;
    height: auto;
  }
  .no-schema {
    padding: 0;
  }
  .field-container {
    width: 100%;
  }
  .field {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2px 4px 2px 16px;
    border-radius: 4px;
  }
  .field:hover {
    background-color: #f6f6f6;
  }
  .field_name {
    font-weight: 500;
    text-align: left;
    flex-grow: 1;
    color: var(--gray-800);
    height: 24px;
    line-height: 24px;
    max-width: calc(100% - 90px);
  }
  .field_type {
    max-width: 150px;
  }
  .type {
    color: #666;
    flex-shrink: 0;
    font-family: 'JetBrains Mono NL',consolas, monaco, monospace;
    font-size: 11px;
    text-align: right;
    border: 1px solid #ebebeb;
    background: white;
    border-radius: 4px;
    line-height: 16px;
    height: 18px;
    padding: 0 4px;
    text-overflow: ellipsis;
    overflow: hidden;
    display: inline-block;
    vertical-align: middle;
    max-width: 100%;
  }
  </style>
