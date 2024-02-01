<template lang="pug">
drawer.gadget-drawer(
  v-model="visible"
  v-on="$listeners"
  v-bind="$attrs"
  width="326px"
  showClose)
  template(slot="header")
    .header
  template(slot="content")
    gadget-settings(
      :name="title"
      :header="(gadget.header && typeof gadget.header.enable !== 'undefined') ? gadget.header.enable : true"
      :category="gadget.category"
      :datasource="gadget.datasource"
      :datasources="datasources"
      :settings="gadget.params"
      :sections="gadget.sections"
      v-bind="$attrs"
      v-on="$listeners")
</template>

<script>
import i18n from './lang'
import Drawer from '@/components/shared/Drawer'
import { ModalFunctionality } from '@/mixins/modal'
import GadgetSettings from './settings/GadgetSettings'

export default {
  name: 'GadgetDrawer',

  i18n,

  components: {
    Drawer,
    GadgetSettings
  },

  mixins: [ModalFunctionality],

  props: {
    gadget: {
      type: Object,
      default: () => {}
    },
    datasources: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    title () {
      return (
        this.gadget &&
        this.gadget.header &&
        this.gadget.header.title &&
        this.gadget.header.title.text
      )
    }
  }
}
</script>

<style lang="scss">
.gadget-drawer {
  border-left: 1px solid var(--color-border-soft-divisor);
  padding: 0 1rem 3rem 1.4rem;
}
</style>
