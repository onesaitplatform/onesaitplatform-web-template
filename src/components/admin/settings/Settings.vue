<template>
  <div class="settings-form">
    <ods-form :model="dashboard_" ref="DashboardForm" class="ods-form-dashboard">
      <div class="ods-flex ods-flex-wrap">
        <ods-form-item class="ods-flex ods-flex-col ods-items-start ods-flex-1" :label="$t('name')" prop="name" :rules="[{ required: true, message: $t('rules.name') }, { min: 5, max: 100, message: 'Name must have at least 5 characters', trigger: 'blur' }]">
          <ods-input type="text" v-model="dashboard_.name" :readonly="!edit && !isNew"></ods-input>
        </ods-form-item>
        <!-- <ods-form-item class="ods-flex ods-flex-col ods-items-start ods-flex-1" :label="$t('category')" prop="category">
          <ods-select v-model="dashboard_.category" :disabled="!edit && !isNew">
            <ods-option v-for="cat in categories" :key="`category-${cat.identification}`" :label="cat.description" :value="cat.identification"></ods-option>
          </ods-select>
        </ods-form-item> -->
      </div>
      <ods-form-item :label="$t('description')" prop="description" :rules="{ required: true, message: $t('rules.description') }">
        <ods-input type="textarea" v-model="dashboard_.description" :readonly="!edit && !isNew"></ods-input>
      </ods-form-item>
      <!-- <ods-form-item class="ods-mt-6" prop="favourite">
        <ods-checkbox :label="$t('fav')" v-model="dashboard_.fav" disabled="disabled"></ods-checkbox>
      </ods-form-item> -->
      <ods-form-item class="ods-mt-4" prop="public">
        <ods-checkbox :label="$t('public')" v-model="dashboard_.isPublic" :disabled="!edit && !isNew"></ods-checkbox>
      </ods-form-item>
      <ods-form-item class="form-footer">
        <ods-button type="neutral" @click="close()">Close</ods-button>
        <ods-button type="neutral" @click="clearForm()">Cancel</ods-button>
        <ods-button :loading="buttonLoading" :disabled="!isValid" type="primary" @click="submitForm()">{{ isNew ? 'Create' : 'Modify' }}</ods-button>
      </ods-form-item>
    </ods-form>
  </div>
  </template>

<script>
import i18n from './lang'
// import { getCategories } from '@/services/dashboards/dashboards'

export default {
  name: 'Settings',

  i18n,

  props: {
    dashboard: {
      type: Object,
      default: () => {}
    },
    isNew: {
      type: Boolean,
      default: false
    },
    edit: {
      type: Boolean,
      default: false
    },
    isValid: {
      type: Boolean,
      default: false
    },
    buttonLoading: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      dashboard_: {},
      categories: []
    }
  },

  watch: {
    dashboard: {
      immediate: true,
      handler (dashboard) {
        this.dashboard_ = {
          name: dashboard.identification,
          description: dashboard.description,
          category: dashboard.category,
          isPublic: dashboard.public,
          fav: dashboard.fav,
          generateImage: true
        }
      }
    },
    dashboard_: {
      deep: true,
      handler ({ name, category, description, isPublic }) {
        this.$nextTick(() => {
          this.validate()
          this.$refs.DashboardForm.clearValidate()
        })
      }
    }
  },

  created () {
    // load categories for dashboards, actually fixed
    // this.fetchCategories()
  },
  mounted () {
    console.log('INFO, dash, dash_ new edit ->', this.dashboard, this.dashboard_, this.isNew, this.edit)
  },
  methods: {
    close () {
      this.clearForm()
      this.$emit('action:closeSettings')
    },
    clearForm () {
      this.$refs.DashboardForm.resetFields()
      this.$refs.DashboardForm.clearValidate()
      if (this.edit) {
        // if cancel in edit, back to new
        this.$emit('action:closeSettings')
      }
    },
    submitForm () {
      console.log('submit dashboard form...')
      this.$emit('action:dashboard')
    },
    validate () {
      let isValid = false
      this.$refs.DashboardForm.validate(async (valid) => {
        isValid = valid
      })
      const { name, description, isPublic, category } = this.dashboard_
      const dashboard = {
        information: {
          dashboard: name,
          dashboardDescription: description,
          dashboardStyle: 'derconnect',
          dashboardType: 'DASHBOARD',
          // category,
          category: 'derconnect' || category, // fixed now to derconnect
          dashboardGenerateImage: true
        },
        isPublic
      }
      this.$emit('validate', { isValid, dashboard })
    }
    /* async fetchCategories () {
        const categories = await getCategories()
        this.categories = categories.filter((c) => ['DASHBOARD', 'GENERAL'].includes(c.type))
    } */
  }
}
</script>

<style lang="scss" scoped>
.settings-form {
  ::v-deep .ods-form-item {
    margin: rem(12) rem(12);
    &__content {
      width: 100%;
      min-width: rem(200);
    }
    &__error {
      position: initial;
    }
  }
}
.ods-form-dashboard {
  margin: 24px auto;
  background-color: white;
  border: 1px solid #CCC;
  border-radius: 4px;
}

.form-footer {
  text-align: right;
  margin-bottom: 1.5rem;
}
</style>
