// Modal functionality for showing/hiding the component using v-model
export const ModalFunctionality = {
  model: {
    prop: 'visible_',
    event: 'close'
  },

  props: {
    visible_: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      visible: false
    }
  },

  methods: {
    close () {
      this.visible = false
    },

    show () {
      this.visible = true
    },

    toggle () {
      this.visible = !this.visible
    }
  },

  watch: {
    visible_: {
      immediate: true,
      handler: function (visible_) {
        if (this.visible !== visible_) this.visible = visible_
      }
    },

    visible: {
      immediate: true,
      handler: function (visible) {
        if (this.visible_ !== visible) this.$emit('close', this.visible)
        if (visible) this.$emit('show')
      }
    }
  }
}
