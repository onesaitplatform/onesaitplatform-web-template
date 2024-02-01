<template lang="pug">
ods-dialog(
  :fullscreen="fullscreen"
  :visible="visible"
  :title="title"
  :width="width"
  :append-to-body="true"
  :show-close="showClose"
  :custom-class="customClass"
  @close="close"
  ref="modal")
  template(slot="title" v-if="!title")
    slot(name="title")
  slot
    span(v-if="message")
      | {{ message }}
  template(slot="footer" v-if="hasFooterSlot || cancelButton || actionButton")
    slot(name="footer" v-if="hasFooterSlot")
    template(v-else)
      .action-modal__footer
        .action-modal__footer--left
          slot(name="message")
        .action-modal__footer--right
          ods-button(
            v-if="cancelButton"
            :type="cancelButtonType"
            @click="handleClose") {{ cancelButtonText }}
          ods-button(
            v-if="actionButton"
            @click="$emit('action')"
            :disabled="actionButtonDisabled"
            :type="actionButtonType"
            :loading="loading"
            :icon="actionButtonIcon") {{ actionButtonText }}
</template>

<script>
import { ModalFunctionality } from '@/mixins/modal'

export default {
  name: 'ActionModal',

  mixins: [ModalFunctionality],

  props: {
    customClass: {
      type: String,
      default: ''
    },

    fullscreen: {
      type: Boolean,
      default: false
    },

    title: {
      type: String,
      default: ''
    },

    message: {
      type: String,
      default: ''
    },

    actionButton: {
      type: Boolean,
      default: true
    },

    actionButtonDisabled: {
      type: Boolean,
      default: false
    },

    actionButtonText: {
      type: String,
      default: ''
    },

    actionButtonIcon: {
      type: String,
      default: null
    },

    actionButtonType: {
      type: String,
      default: 'primary'
    },

    cancelButtonText: {
      type: String,
      default: ''
    },

    cancelButtonType: {
      type: String,
      default: 'neutral'
    },

    cancelButton: {
      type: Boolean,
      default: true
    },

    width: {
      type: String,
      default: '440px'
    },

    showClose: {
      type: Boolean,
      default: false
    },

    loading: {
      type: Boolean,
      default: false
    },

    item: {
      type: String,
      default: ''
    }
  },

  computed: {
    hasFooterSlot () {
      return this.$slots.footer
    }
  },

  methods: {
    handleClose () {
      this.$emit('close')
      this.close()
    },
    closeModal () {
      this.$refs.modal.close()
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .ods-dialog {
  border-radius: 0;

  &__body {
    padding: rem(24) rem(24) rem(40);
  }
}

.action-modal {
  &__subtitle {
    font-size: rem(16);
    line-height: rem(24);
  }
  &__button {
    &#{&} {
      text-transform: initial;
      font-size: rem(14);
      font-weight: $txt-body-500-weight;
    }
  }
  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
