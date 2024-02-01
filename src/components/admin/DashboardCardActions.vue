<template>
    <div class="dashboard-card-actions">
        <ods-popover v-model="showPopover" ref="CardActionsMenu" placement="bottom-end" width="102" popper-class="card-actions-menu" :append-to-body="false" trigger="click">
            <div class="ods-flex ods-items-center ods-flex-wrap">
                <ods-button class="dashboard-card-actions__duplicate ods-px-0" ref="duplicate-button" v-if="type === 'dashboard'" type="neutral" icon="ods-icon-copy" :full="true" icon-position="left" @click="openDuplicate">{{ $t("duplicate") }}</ods-button>
            </div>
            <div v-if="isOwner" class="ods-flex ods-items-center ods-flex-wrap">
                <ods-button class="dashboard-card-actions__delete ods-px-0" ref="delete-button" type="neutral" icon="ods-icon-delete" :full="true" icon-position="left" @click="openDelete">{{ $t("delete") }}</ods-button>
            </div>
            <div v-if="isOwner" class="ods-flex ods-items-center ods-flex-wrap">
                <ods-button class="dashboard-card-actions__config ods-px-0" ref="config-button" type="neutral" icon="ods-icon-setting" :full="true" icon-position="left" @click="openConfig">{{ $t("config") }}</ods-button>
            </div>
        </ods-popover>
        <ods-icon class="ods-ml-4" name="more" size="16" color="#505D66" v-popover:CardActionsMenu></ods-icon>
    </div>
</template>

<script>
import i18n from './lang'

export default {
  name: 'CardActions',

  i18n,

  props: {
    dashboard: {
      type: Object,
      default: () => {},
      required: true
    },
    type: {
      type: String,
      default: '',
      required: true
    },
    isOwner: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      showPopover: false
    }
  },

  methods: {
    openDelete () {
      this.$emit('open:delete', this.dashboard)
    },
    openDuplicate () {
      this.$emit('open:duplicate', this.dashboard)
    },
    openConfig () {
      this.$emit('open:config', this.dashboard)
    }
  }
}
</script>

<style lang="scss">
.dashboard-card-actions {
  &__duplicate {
    &#{&} {
      color: var(--color-icon-active);
    }
  }
  &__delete {
    &#{&} {
      color: var(--color-bg-destructive);
    }
  }
  &:hover {
    cursor: pointer;
  }

  ::v-deep .card-actions-menu {
    min-width: 102px;
    padding: 0;
  }
}
</style>
