<template>
  <ods-main-header
    :headerLogoText="getCurrentAppTitle"
    :logoUrl="mainLink"
    breadcrumbSeparator=">"
    actionsMenuIcon="overflow-menu"
    :showSuitesMenu="false"
    :showBreadcrumbs="true"
    :environment="env"
    :showActionsMenu="false"
    :showUserMenu="true"
    userMenuIcon="user"
    ref="header">
  <template slot="actions">
    <header-actions></header-actions>
  </template>
  <template slot="user">
    <user-menu></user-menu>
  </template>
  <template slot="suites">
    <suites-menu></suites-menu>
  </template>
  <template slot="custom" >
    <fullscreen v-if="fullscreenContent"> </fullscreen>
    <header-custom-content v-if="customContent"></header-custom-content>
  </template>
  <template slot="notifications" v-if="notificationsContent">
    <header-notifications></header-notifications>
  </template>
  <template slot="clientLogo">
    <div class="ods-main-header__client-logo__patch"></div>
      <div class="ods-main-header__client-logo" style="width:100px">
        <img title="Logo" alt="Logo" :src="'/web/' + appFolder + '/img/' + Logo" width="100" height="auto"/>
      </div>
  </template>
</ods-main-header>
</template>

<script>
import HeaderActions from '@/components/header/HeaderActions'
import UserMenu from '@/components/header/UserMenu'
import SuitesMenu from '@/components/header/SuitesMenu'
import Fullscreen from '@/components/header/Fullscreen'
import HeaderCustomContent from '@/components/header/HeaderCustomContent'
import HeaderNotifications from '@/components/header/HeaderNotifications'
import { mapGetters } from 'vuex'

export default {
  name: 'HeaderContent',
  components: {
    HeaderActions,
    UserMenu,
    SuitesMenu,
    Fullscreen,
    HeaderCustomContent,
    HeaderNotifications
  },
  data () {
    return {
      customContent: false,
      notificationsContent: true,
      fullscreenContent: true,
      appFolder: process.env.VUE_APP_APPLICATION,
      Logo: process.env.VUE_APP_LOGO || 'onesait-brand-logo.svg'
    }
  },

  computed: {
    env () {
      return process.env.ENV_TAG
    },
    ...mapGetters({
      getCurrentAppTitle: 'getCurrentAppTitle',
      getCurrentApp: 'getCurrentApp'
    }),
    mainLink () {
      // the link can be a dashboard or a component, string for dashboard, dashboard or component in object notation.
      var config = this.getCurrentApp
      const initHomePage = config && config.initialNavigation ? config.initialNavigation : 'DER-HOME-MAP'
      if (typeof initHomePage === 'string') {
        return '/dashboard/' + initHomePage
      } else {
        if (initHomePage.type === 'dashboard') {
          return '/dashboard/' + initHomePage // catch cause environment is a promise
        } else {
          return initHomePage.path // catch cause environment is a promise
        }
      }
    }
  },

  methods: {
    handleTopBar (action) {
      if (action) {
        this.$emit('hasTopBar', true)
      } else {
        this.$emit('hasTopBar', false)
      }
    }
  },

  mounted () {
    this.$emit('hasTopBar', this.$refs.header.$slots.topbar)
  }
}
</script>

<style lang="scss" scoped>
  .ods-main-header__client-logo {
    width: 100px;
    img {
      width: 100%;
      max-width: 100%;
    }
  }
  .ods-main-header__custom-content { z-index: 1000!important; }
</style>
