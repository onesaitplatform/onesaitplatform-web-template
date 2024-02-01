<template lang="pug">
transition(
  :name="animation"
  @enter="assignMargin"
  @after-enter="removeMargin"
  @leave="assignMargin"
  @after-leave="closeFinish")
  .drawer(
    v-if="visible"
    :class="positionClass"
    :style="{ width: width }"
    v-clickoutside="handleClickOutside")
    .drawer__header(v-if="hasHeader || title !== '' || subtitle !== ''")
      .drawer__header--left
        slot(name="header" v-if="hasHeader")
        .drawer__header-content(v-else)
          p.drawer__header-content__title {{ title }}
          p.drawer__header-content__subtitle {{ subtitle }}
      .drawer__header--right(v-if="showClose")
        ods-button.drawer__close-button(type="neutral" @click="close")
          ods-icon(name="close" size="20")
    .drawer__content
      ods-scrollbar.drawer__scrollbar(wrapClass="drawer__scrollbar-wrap")
        slot(name="content")
</template>

<script>
import Clickoutside from '@ods/ods/lib/utils/clickoutside.js'
import { ModalFunctionality } from '@/mixins/modal'

export default {
  name: 'Drawer',

  directives: {
    Clickoutside
  },

  mixins: [ModalFunctionality],

  props: {
    position: {
      type: String,
      default: 'right'
    },

    showClose: {
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

    subtitle: {
      type: String,
      default: ''
    }
  },

  computed: {
    hasHeader () {
      return !!(this.$slots && this.$slots.header)
    },

    animation () {
      return `slide-${this.position}`
    },

    positionClass () {
      const classes = [`drawer__block--${this.position}`]
      if (this.visible_) {
        classes.push('drawer--visible')
        classes.push('drawer--collapse')
      }
      return classes.join(' ')
    }
  },

  methods: {
    handleClickOutside () {
      this.closeOnClickOutside && this.close()
    },

    closeFinish () {
      this.$emit('close-end', false)
    },

    assignMargin (el) {
      // const element = this.$el
      // const styles = getComputedStyle(element)
      // element.classList.remove('drawer--collapse')
      // element.style.marginRight = `-${element.clientWidth + parseFloat(styles.marginLeft)}px`
    },

    removeMargin () {
      // const element = this.$el
      // element.style.marginRight = null
      // element.classList.add('drawer--collapse')
    }
  }
}
</script>

<style lang="scss" scoped>
.ods-module__body {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.drawer {
  z-index: 9999;
  top: 51px;
  bottom: 0;
  background-color: var(--color-bg-primary);
  overflow: hidden;
  height: 100%;
  position: absolute;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: rem(8) 0 0;
    min-height: halfGrid(8);
    box-sizing: border-box;
    &--left {
      position: relative;
      padding-left: halfGrid(4);
      display: flex;
      align-items: center;
      flex-grow: 1;
      height: 100%;
    }
    &--right {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: halfGrid(7);
      height: 100%;
      &::before {
        position: absolute;
        top: halfGrid(1);
        bottom: halfGrid(1);
        content: '';
        left: 0;
        width: 1px;
        // background: $--color-neutral-3;
      }
    }
  }
  &__content {
    flex: 1;
    height: 100%;
    box-sizing: border-box;
    overflow: auto;
    // padding: 0 rem(24) rem(48);
  }
  &__close-button {
    &#{&} {
      padding: rem(8);
      z-index: 2;
    }
  }
  &__block {
    &--right {
      // position: absolute;
      bottom: 0;
      right: 0;
      border-radius: 0;
    }
    &--left {
      // position: absolute;
      height: 100%;
      bottom: 0;
      left: 0;
      border-radius: 0;
    }
  }
  &__scrollbar,
  &__scrollbar--wrap {
    height: 100%;
  }
}

.slide-right-enter-active {
  animation: slide-right 0.5s ease-out;
}
.slide-right-leave-active {
  animation: slide-right 0.5s ease-out reverse;
}
@keyframes slide-right {
  0% {
    transform: translateX(100%);
    width: 0%;
  }
  100% {
    transform: translateX(0%);
    width: rem(326);
  }
}

.slide-left-enter-active {
  animation: slide-left 0.3s ease-out;
}
.slide-left-leave-active {
  animation: slide-left 0.3s ease-out reverse;
}
@keyframes slide-left {
  0% {
    transform: translateX(-100%);
    width: 0%;
  }
  100% {
    transform: translateX(0%);
    width: rem(326);
  }
}
</style>
