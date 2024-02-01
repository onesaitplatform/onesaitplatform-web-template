<template lang="pug">
action-modal.add-fav-gadget-modal(
  ref="modal"
  v-model="visible"
  width="541px"
  :title="$t('addFavGadget.title')"
  :cancelButtonText="$t('decline')"
  :actionButtonText="$t('accept')"
  :actionButtonDisabled="!isValid"
  @action="addFavGadget()"
  @close="handleClose()")
  p.action-modal__subtitle {{ $t("addFavGadget.subtitle") }}
  ods-form(:model="favGadgetForm" :rules="rules" ref="favGadgetForm")
    ods-form-item.ods-mt-4(prop="identification")
      ods-input(v-model="favGadgetForm.identification")
</template>

<script>
import i18n from './lang'
import ActionModal from '@/components/shared/ActionModal'
import { ModalFunctionality } from '@/mixins/modal'

export default {
  name: 'AddFavGadgetModal',

  i18n,

  components: {
    ActionModal
  },

  mixins: [ModalFunctionality],

  data () {
    return {
      favGadgetForm: {
        identification: ''
      },
      rules: {
        name: [
          {
            required: true,
            message: this.$t('rules.identification'),
            trigger: 'change'
          }
        ]
      },
      isValid: false
    }
  },

  watch: {
    favGadgetForm: {
      deep: true,
      handler (form) {
        this.$nextTick(() => this.validate())
      }
    }
  },

  methods: {
    validate () {
      this.$refs.favGadgetForm.validate(async (valid) => {
        if (valid) {
          this.isValid = valid
          this.$refs.favGadgetForm.clearValidate()
        }
      })
    },
    addFavGadget () {
      this.$emit('add:fav-gadget', this.favGadgetForm.identification)
    },
    handleClose () {
      this.$refs.favGadgetForm.clearValidate()
      this.resetForm()
    },
    resetForm () {
      this.$refs.favGadgetForm.resetFields()
    }
  }
}
</script>

<style lang="scss"></style>
