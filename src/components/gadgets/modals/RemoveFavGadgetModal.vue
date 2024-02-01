<template lang="pug">
action-modal.remove-fav-gadget-modal(
  ref="modal"
  v-model="visible"
  width="541px"
  :title="$t('removeFavGadget.title')"
  :cancelButtonText="$t('decline')"
  :actionButtonText="$t('accept')"
  @action="$emit('remove:fav-gadget')")
  p.action-modal__subtitle {{ $t("removeFavGadget.subtitle") }}
</template>

<script>
import i18n from './lang'
import ActionModal from '@/components/shared/ActionModal'
import { ModalFunctionality } from '@/mixins/modal'

export default {
  name: 'RemoveFavGadgetModal',

  i18n,

  components: {
    ActionModal
  },

  mixins: [ModalFunctionality]
}
</script>

<style lang="scss"></style>
