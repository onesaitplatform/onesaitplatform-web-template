<template lang="pug">
action-modal.duplicate-modal(
  ref="modal"
  v-model="visible"
  width="541px"
  :title="$t('modal.duplicateConfirmTitle') + this.title"
  :cancelButtonText="$t('buttons.cancel')"
  :actionButtonText="$t('buttons.duplicate')"
  @action="duplicateDashboard")
  p.action-modal__subtitle {{ $t("modal.duplicateConfirmMsg") }}
  ods-form(:model="duplicateForm" :rules="rules" ref="duplicateForm")
    ods-form-item.duplicate-modal.ods-mt-4(
      :label="$t('nameNewDashboard')"
      prop="name")
      ods-input(
        ref="name"
        size="default"
        :placeholder="$t('writeHere')"
        v-model="duplicateForm.name")
</template>

<script>
/* eslint-disable dot-notation */
import i18n from './lang'
import ActionModal from '@/components/shared/ActionModal'
import { ModalFunctionality } from '@/mixins/modal'

export default {
  name: 'DuplicateDashboardModal',

  i18n,

  components: {
    ActionModal
  },

  mixins: [ModalFunctionality],

  props: {
    dashboard: {
      type: Object,
      default: () => {},
      required: true
    },
    title: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      duplicateForm: {
        name: ''
      },
      rules: {
        name: [
          {
            required: true,
            message: this.$t('rules.name'),
            trigger: 'submit'
          },
          { min: 5, max: 100, message: 'New Identifier must have at least 5 characters', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async duplicateDashboard () {
      await this.$refs.duplicateForm.validate()
      this.$emit('duplicate:dashboard', this.duplicateForm.name)
      this.duplicateForm.name = ''
      this.$refs.duplicateForm.resetFields()

      // this.$refs.duplicateForm.validate(async valid => {
      //   if (valid) {
      //     this.$emit('duplicate:dashboard', this.duplicateForm.name)
      //     this.duplicateForm.name = ''
      //     this.$refs.duplicateForm.resetFields()
      //   } else {
      //     return false
      //   }
      // })
    }
  }
}
</script>

<style lang="scss"></style>
