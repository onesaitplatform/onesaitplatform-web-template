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
    :replaceMainLogo="false"
    userMenuIcon="user"
    ref="header"
  >
  <template v-if="changeLogo" slot="mainLogo">
    <div class="ods-main-header__client-logo">
      <img
          title="Logo"
          alt="Logo"
          :src="'/web/' + appFolder + '/img/' + Logo"
          width="100"
          height="auto"
        />
    </div>
  </template>
    <template slot="actions">
      <header-actions></header-actions>
    </template>
    <template slot="user">
      <user-menu></user-menu>
    </template>
    <template slot="suites">
      <suites-menu></suites-menu>
    </template>
    <!-- CUSTOM FUNCTIONALITIES: fullscreen , ... -->
    <template slot="custom">
      <fullscreen v-if="fullscreenContent"> </fullscreen>
      <header-custom-content v-if="customContent"></header-custom-content>
    </template>
    <!-- NOTIFICATIONS COMPONENT: only loads if component is enabled and options are defined -->
    <template slot="notifications" v-if="checkNotificationComponent">
      <header-notifications :options="notifications"></header-notifications>
    </template>
    <!-- CLIENT LOGO -->
    <template slot="clientLogo">
      <div class="ods-main-header__client-logo__patch"></div>
      <div class="ods-main-header__client-logo" style="width: 100px">
        <img
          title="Logo"
          alt="Logo"
          :src="'/web/' + appFolder + '/img/' + Logo"
          width="100"
          height="auto"
        />
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
  props: {
    notifications: {
      type: Object,
      default: () => {},
      required: false
    }
  },
  data () {
    return {
      customContent: false,
      notificationsContent: true,
      fullscreenContent: true,
      changeLogo: false,
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
      getCurrentApp: 'getCurrentApp',
      getUser: 'getUser'
    }),
    mainLink () {
      // the link can be a dashboard or a component, string for dashboard, dashboard or component in object notation.
      var config = this.getCurrentApp
      const role = this.getUser?.role
      var initHomePage = config && config.initialNavigation ? config.initialNavigation : '/'
      var isArray = function (a) {
        return Object.prototype.toString.apply(a) === '[object Array]'
      }

      // NEW
      if (typeof initHomePage === 'string') {
        return '/dashboard/' + initHomePage
      } else if (!isArray(initHomePage)) {
        console.log('Initial navigation: ', initHomePage.type, initHomePage.id)
        if (initHomePage.type === 'dashboard') {
          return '/dashboard/' + initHomePage
        } else {
          return initHomePage.path
        }
      } else {
        // array of initial navigation by role
        console.log('Initial navigation: ', initHomePage, initHomePage.length, ' roles')
        if (initHomePage.filter(x => x.role === role).length > 0) {
          var navigation = initHomePage.filter(x => x.role === role)[0]
          if (navigation.type === 'dashboard') {
            return '/dashboard/' + navigation.id
          } else {
            return navigation.path
          }
        }
      }
      return initHomePage
    },
    checkNotificationComponent () {
      var showNotifications = false
      if (!this.notifications) {
        showNotifications = false
      }
      if (this.notifications && Object.keys(this.notifications).length > 0) {
        showNotifications = true
      }
      return showNotifications
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
    if (this.$refs.header.$slots.topbar) {
      this.$emit('hasTopBar', this.$refs.header.$slots.topbar)
    }
  }
}
</script>

<style lang='scss' scoped>
.ods-main-header__client-logo {
  width: 100px;
  img {
    width: 100%;
    max-width: 100%;
  }
}
.ods-main-header__custom-content {
  z-index: 1000 !important;
}
.logo-text { margin-top: 8px; }
</style>
