<template lang="pug">
action-modal.delete-gadget-modal(
  ref="modal"
  v-model="visible"
  width="541px"
  :title="$t('deleteGadget.title')"
  :cancelButtonText="$t('decline')"
  :actionButtonText="$t('accept')"
  @action="$emit('delete:gadget')")
  p.action-modal__subtitle {{ $t("deleteGadget.subtitle") }}
</template>

<script>
import i18n from './lang'
import ActionModal from '@/components/shared/ActionModal'
import { ModalFunctionality } from '@/mixins/modal'

export default {
  name: 'DeleteGadgetModal',

  i18n,

  components: {
    ActionModal
  },

  mixins: [ModalFunctionality]
}
</script>

<style lang="scss"></style>
