<template>
  <ods-drawer
       :title="title"
       :visible.sync="visible"
       :append-to-body="appendToBody"
       :close-on-press-escape="closeOnPressEscape"
       :custom-class="customClass"
       :destroy-on-close="destroyOnClose"
       :modal="modal"
       :modal-append-to-body="modalAppendToBody"
       :direction="direction"
       :show-close="showClose"
       :size="width"
       :wrapper-closable="wrapperClosable"
       :with-header="withHeader"
       :before-close="handleClose">
       <slot name="title"></slot>
       <div class="drawer__content">
         <ods-scrollbar wrap-class="wrap-styles" :tag="'div'" :wrapStyle="wrapStyle" :viewStyle="viewStyle">
           <slot name="content"></slot>
         </ods-scrollbar>
       </div>
     </ods-drawer>
</template>
<script>
import { ModalFunctionality } from '@/mixins/modal'

export default {

  name: 'Drawer',
  mixins: [ModalFunctionality],
  props: {
    direction: {
      type: String,
      default: 'rtl'
    },

    customClass: {
      type: String,
      default: ''
    },

    showClose: {
      type: Boolean,
      default: true
    },

    appendToBody: {
      type: Boolean,
      default: true
    },

    closeOnPressEscape: {
      type: Boolean,
      default: true
    },

    destroyOnClose: {
      type: Boolean,
      default: true
    },

    modal: {
      type: Boolean,
      default: true
    },

    modalAppendToBody: {
      type: Boolean,
      default: true
    },

    wrapperClosable: {
      type: Boolean,
      default: true
    },

    closeOnClickOutside: {
      type: Boolean,
      default: false
    },

    width: {
      type: String,
      default: '420px'
    },

    title: {
      type: String,
      default: ''
    },
    // type of element that use the drawer [gadget,datasource,...] to use close functions
    type: {
      type: String,
      default: ''
    },

    subtitle: {
      type: String,
      default: ''
    },
    withHeader: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      wrapStyle: { height: 'calc(98vh - 100px)', padding: '0px' },
      viewStyle: { height: 'calc(98vh - 100px)', padding: '18px' }
    }
  },
  computed: {
    hasHeader () {
      return !!(this.$slots && this.$slots.header)
    }
  },

  methods: {
    handleClose (done) {
      if (this.type === 'gadget') {
        this.$emit('close-end', 'gadget')
      }
      if (this.type === 'datasource') {
        console.log('drawer datasource...')
        this.$emit('close-end', 'datasource')
      }
      done()
    }
  },
  mounted () {
    console.log('ODS-DRAWER TYPE: ', this.type)
  }
}
</script>

<style lang="scss" >
.ods-module__body {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
}
.wrap-styles.ods-scrollbar__wrap {
  height: calc(100vh - 60px);
}
</style>
