<template lang="pug">
action-modal.delete-modal(
  ref="modal"
  v-model="visible"
  width="541px"
  v-bind="$attrs"
  :title="$t('modal.title') + title"
  :actionButtonText="$t('buttons.yesDelete')"
  :cancelButtonText="$t('buttons.cancel')"
  :loading="loading"
  :item="item"
  @action="$emit(emitName, emitData)")
  p.action-modal__subtitle {{ confirmMessage || $t("modal.deleteConfirmMsg") }}
</template>

<script>
import i18n from './lang'
import ActionModal from '@/components/shared/ActionModal'
import { ModalFunctionality } from '@/mixins/modal'

export default {
  name: 'DeleteModal',

  i18n,

  components: {
    ActionModal
  },

  mixins: [ModalFunctionality],

  props: {
    item: {
      type: String,
      default: null
    },
    data: {
      type: [Object, Array],
      default: () => ({})
    },
    title: {
      type: String,
      default: '',
      required: true
    },
    confirmMessage: {
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
      internalData: this.data
    }
  },

  computed: {
    emitName () {
      return this.item ? `delete:${this.item}` : 'delete'
    },
    emitData () {
      return Object.keys(this.data).length ? this.data : this.internalData
    }
  },

  methods: {
    show (data) {
      this.visible = true
      this.internalData = data
    },

    hide () {
      this.visible = false
    }
  }
}
</script>

<style lang="scss"></style>
