<template lang="pug">
action-modal.change-gadget-modal(
  ref="modal"
  v-model="visible"
  width="541px"
  :title="$t('changeGadget.title')"
  :cancelButtonText="$t('decline')"
  :actionButtonText="$t('accept')"
  @action="$emit('change:gadget')")
  p.action-modal__subtitle {{ $t("changeGadget.subtitle") }}
</template>

<script>
import i18n from './lang'
import ActionModal from '@/components/shared/ActionModal'
import { ModalFunctionality } from '@/mixins/modal'

export default {
  name: 'ChangeGadgetModal',

  i18n,

  components: {
    ActionModal
  },

  mixins: [ModalFunctionality]
}
</script>

<style lang="scss"></style>
