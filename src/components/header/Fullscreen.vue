<template>
    <div class="header-fullscreen__wrapper">
        <ods-tooltip :content="'Fullscreen Mode'" :placement="'left-start'" :offset="-3" >
            <span class="fullscreen">
                <span data-name="OdsIcon" class="ods-actions-menu__button ods-icon-full-screen" role="button" aria-label="Fullscreen" @click="toggleFullScreen"></span>
            </span>
        </ods-tooltip>
    </div>
  </template>

<script>

export default {
  name: 'UserMenu',
  data () {
    return {
      info: 'fullscreen toggle component'
    }
  },
  methods: {
    toggleFullScreen () {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    }
  }
}
</script>

<style scoped>
.header-fullscreen__wrapper {
    position: relative;
}

</style>
