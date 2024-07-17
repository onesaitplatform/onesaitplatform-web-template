<template lang="pug">
ods-main-navigation(:navigation="handleNavigation || {}" ref="navigation")
    template(slot="suites")
      suites-menu
    template(slot="isPhone-user-menu")
      user-menu.is-phone__user-menu
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { HTTP_PLATFORM } from '../../store/modules/http'
import navigationConfig from '@/components/nav/config.json'
import SuitesMenu from '@/components/header/SuitesMenu'
import UserMenu from '@/components/header/UserMenu'

export default {
  name: 'NavContent',
  components: {
    SuitesMenu,
    UserMenu
  },
  data () {
    return {
      favorite: '',
      navbackup: navigationConfig,
      roleMenu: {},
      messages: null
    }
  },
  methods: {
    ...mapActions([
      'getI18nData'
    ]),
    // GET FAVORITE INTERNAL ID
    async getUserFavorite () {
      var favDashboardApiEndPoint = ''
      try {
        // check if is multiple APP application or single
        if (this.isMultipleApp) {
          var currentRealm = this.getCurrentApplication
          favDashboardApiEndPoint = '/controlpanel/api/dashboards/dashboard/' + sessionStorage.username + '_' + currentRealm + '_fav'
          console.log('multiApp mounted favorite: ', favDashboardApiEndPoint)
        } else {
          favDashboardApiEndPoint = '/controlpanel/api/dashboards/dashboard/' + sessionStorage.username + '_fav'
          console.log('Non multiApp mounted favorite: ', favDashboardApiEndPoint)
        }
        // get current user favorite dashboard
        const favorite = await HTTP_PLATFORM.get(favDashboardApiEndPoint)
        if (favorite && favorite.data) {
          return favorite.data.id
        } else {
          return ''
        }
      } catch (error) {
        console.log('ERROR GETTING FAVORITE: ' + error)
        return ''
      }
    },

    // CREATE NAVIGATION when no navigation is defined
    createNavigation (allowed, favorite) {
      var navigation = this.navbackup
      if (!this.isEmpty(allowed)) {
        for (let i = 0; i < allowed.length; i++) {
          navigation.dashboards.children[allowed[i].name] = {}
          navigation.dashboards.children[allowed[i].name].name = this.applyi18n('navigation.' + allowed[i].name, allowed[i].name)
          navigation.dashboards.children[allowed[i].name].i18n = 'navigation.' + allowed[i].name
          navigation.dashboards.children[allowed[i].name].dashboardId = allowed[i].name
          navigation.dashboards.children[allowed[i].name].to = '/dashboard/' + allowed[i].name
        }

        // apply favorite if exist
        if (favorite) {
          if (this.isMultipleApp) {
            var currentRealm = this.getCurrentApplication
            navigation.favorite.dashboardId = sessionStorage.username + '_' + currentRealm + '_fav'
            navigation.favorite.name = this.applyi18n('navigation.userFavorite', 'Favorite')
            navigation.favorite.i18n = 'navigation.userFavorite'
            navigation.favorite.to = '/dashboard/' + sessionStorage.username + '_' + currentRealm + '_fav'
            sessionStorage.setItem('favorite', sessionStorage.username + '_' + currentRealm + '_fav')
          } else {
            navigation.favorite.dashboardId = sessionStorage.username + '_fav'
            navigation.favorite.name = this.applyi18n('navigation.userFavorite', 'Favorite')
            navigation.favorite.i18n = 'navigation.userFavorite'
            navigation.favorite.to = '/dashboard/' + sessionStorage.username + '_fav'
            sessionStorage.setItem('favorite', sessionStorage.username + '_fav')
          }
        }

        // apply home and dashboards
        if (navigation.home) {
          navigation.home.name = this.applyi18n('navigation.home', 'Home')
          navigation.home.i18n = 'navigation.home'
        }
      }
      sessionStorage.setItem('navigation', JSON.stringify(navigation))
      return navigation
    },

    // check if a dashboard is in allowed dashboards
    isAllowed (allowedArray, dashboardId) {
      return allowedArray.filter(e => e.name === dashboardId).length > 0
    },

    // check empty objects
    isEmpty (o) {
      return Object.keys(o).length === 0
    },

    // check if object exists
    checkExists (key, obj) {
      obj = obj || window
      key = key.split('.') || key
      if (typeof obj !== 'object') {
        return false
      }
      while (key.length && (obj = obj[key.shift()]) && typeof obj === 'object' && obj !== null) {
        return (!key.length && typeof obj !== 'undefined')
      }
    },

    // APPLY i18n
    applyi18n (key, label) {
      if (this.checkExists(key, this.$i18n.messages[this.$i18n.locale])) {
        return this.$i18n.t(key, this.$i18n.locale)
      } else {
        return label
      }
    },
    applyi18nToNavigation () {
      return this.handleNavigation
    }
  },
  computed: {
    ...mapGetters({
      getNavigation: 'getNavigation',
      isMultipleApp: 'isMultipleApp',
      getCurrentNavigation: 'getCurrentNavigation',
      getCurrentApplication: 'getCurrentApplication',
      getCurrentCustomization: 'getCurrentCustomization',
      getUser: 'getUser',
      getAllowedComponents: 'getAllowedComponents' // get from configuration for each role which components (not dashboards) are allowed
    })
  },
  asyncComputed: {
    // get all navigation menu and check items allowed, then remove all not allowed items in menu and send to template
    async handleNavigation () {
      var sessionNav = ''
      var allowedMenu = this.getNavigation
      var roleMenu = this.getCurrentNavigation
      var showFavorites = true
      var customization = this.getCustomization || {}
      if (customization && customization.showFavorites !== 'undefined') {
        showFavorites = customization.showFavorites
      } else {
        showFavorites = false
      }

      const favorite = showFavorites ? await this.getUserFavorite() : null

      // components allowed
      var role = this.getUser ? this.getUser.role : null
      const COMPONENTS = this.getAllowedComponents ? this.getAllowedComponents : {}
      const allowedComponents = COMPONENTS ? COMPONENTS.navigation?.filter(x => x.role === role).map(y => y.allowed)[0].map(z => z.id) : []

      // control dashboard and components allowed
      if (!allowedMenu.length && !allowedComponents.length) {
        if (sessionStorage.getItem('dashboards')) {
          sessionNav = JSON.parse(sessionStorage.getItem('dashboards'))
          allowedMenu = sessionNav
          this.roleMenu = this.navbackup
        }

        if (!allowedMenu.length) {
          this.roleMenu = this.navbackup
          this.$set(this.navbackup.home, 'name', this.$i18n.t('navigation.home', this.$i18n.locale))
          return this.navbackup
        }
      } else {
        // Check for roleMenu if not defined then we mount a nav backup
        if (this.isEmpty(roleMenu)) {
          this.roleMenu = this.createNavigation(allowedMenu, favorite)
          return this.roleMenu
        }
      }

      // variables for bucle
      var deletedChildren = 0
      var nChildren = 0
      var childrenKey = ''
      var childrenDashboards = false
      var dashboard = ''
      var isDashboard = false

      // if control passed
      Object.keys(roleMenu).forEach(key => {
        if (roleMenu[key].dashboardId !== undefined) {
          // check for dashboard in item
          isDashboard = true
          dashboard = roleMenu[key].dashboardId
          if (this.isAllowed(allowedMenu, dashboard)) {
            this.$set(roleMenu[key], 'name', this.$i18n.t('navigation.' + dashboard, this.$i18n.locale))
            this.$set(roleMenu[key], 'i18n', 'navigation.' + dashboard)
          } else {
            if (key !== 'favorite') { delete roleMenu[key] } else {
              this.$set(roleMenu[key], 'name', this.$i18n.t('navigation.userFavorite', this.$i18n.locale))
              this.$set(roleMenu[key], 'i18n', 'navigation.userFavorite')
            }
          }
        } else {
          // check for dashboads in children
          if (roleMenu[key].children && Object.keys(roleMenu[key].children).length) {
            childrenDashboards = false
            childrenKey = ''
            nChildren = Object.keys(roleMenu[key].children).length
            deletedChildren = 0
            for (const child in roleMenu[key].children) {
              if (roleMenu[key].children[child].dashboardId !== undefined) {
                dashboard = roleMenu[key].children[child].dashboardId
                isDashboard = true
                if (this.isAllowed(allowedMenu, dashboard)) {
                  this.$set(roleMenu[key].children[child], 'name', this.$i18n.t('navigation.' + dashboard, this.$i18n.locale))
                  this.$set(roleMenu[key].children[child], 'i18n', 'navigation.' + dashboard)
                  childrenDashboards = true
                  childrenKey = dashboard
                } else {
                  // remove key, not allowed
                  delete roleMenu[key].children[child]
                  deletedChildren = deletedChildren + 1
                }
              }
            }
            // if dashboards founded, apply name for parent too
            if (childrenDashboards || deletedChildren) {
              if (deletedChildren < nChildren) {
                // children key get parent key: satcm18_riesg_diag_01_dmo_01_tpl_01 --> just satcm18_riesg_diag to parent. or parent key
                var parentKey = roleMenu[key].parent !== undefined ? 'navigation.' + roleMenu[key].parent : 'navigation.' + childrenKey.split('_').slice(0, 3).join('_')
                this.$set(roleMenu[key], 'name', this.$i18n.t(parentKey, this.$i18n.locale))
                this.$set(roleMenu[key], 'i18n', parentKey)
              } else {
                // all children deleted, so delete parent too
                delete roleMenu[key]
              }
            }
          } else {
            // normal items
            isDashboard = false
            var normalLangKey = 'navigation.' + key
            this.$set(roleMenu[key], 'name', this.$i18n.t(normalLangKey, this.$i18n.locale))
            this.$set(roleMenu[key], 'i18n', normalLangKey)

            // get by configuration navigation role rules the items that a role can See, then if normal component navigation item and if allowed get it, otherwise delete it,
            // configuration.navigationAllowed --> role --> components (componentId)
            if (!allowedComponents.includes(roleMenu[key].componentId) && !isDashboard) {
              // not included, so removed.
              delete roleMenu[key]
            }
          }
        }
      })

      if (favorite) {
        if (this.isMultipleApp) {
          var currentRealm = this.getCurrentApplication
          sessionStorage.setItem('favorite', sessionStorage.username + '_' + currentRealm + '_fav')
          if (roleMenu) { roleMenu.favorite.to = '/dashboard/' + sessionStorage.username + '_' + currentRealm + '_fav' }
        } else {
          sessionStorage.setItem('favorite', sessionStorage.username + '_fav')
          if (roleMenu) { roleMenu.favorite.to = '/dashboard/' + sessionStorage.username + '_fav' }
        }
      } else {
        // if exist key favorite but not favorite exists, then remove it
        if (roleMenu && roleMenu.favorite) { delete roleMenu.favorite }
      }
      // IF NOT FAVORITES, THEN REMOVE MENU ENTRY
      if (roleMenu && roleMenu.favorite && showFavorites) { delete roleMenu.favorite }

      // RETURN MAIN NAVIGATION
      this.roleMenu = roleMenu
      sessionStorage.setItem('navigation', JSON.stringify(roleMenu))
      return roleMenu
    }
  },
  watch: {
    '$i18n.locale': {
      async handler (val) {
        console.log('APP IN i18n: ', this.i18n, this.$i18n.locale)
        if (sessionStorage.getItem('isReloaded') === '1') {
          const i18nPlatform = await this.getI18nData(this)
          console.log('i18n: ', i18nPlatform)
        }
        if (Object.keys(this.roleMenu).length !== 0) {
          // apply i18 tags on locale change
          const assignName = item => {
            this.$set(item, 'name', this.$i18n.t(item.i18n, this.$i18n.locale))
            if (item.children && Object.keys(item.children).length) {
              for (const key in item.children) {
                assignName(item.children[key])
              }
            }
          }
          for (const key in this.roleMenu) {
            assignName(this.roleMenu[key])
          }
        }
      },
      immediate: true
    },
    '$route.params': {
      // Watch for dashboard
      immediate: true,
      handler (params) {
        // get internal id of dashboard
        if (!params.dashboardId) {
          // COMPONENT, NOT A DASHBOARD.
          var marked = document.querySelectorAll('.specialMark').length
          if (marked) {
            var markedItem = document.querySelectorAll('.specialMark')[0]
            markedItem.className = markedItem.className.replaceAll('active specialMark', '')
          }
          // buscar entrada active especial y quitarla.
          return false
        } else {
          // DASHBOARD, check if dahboard is not in the nav list, then mark menu special.
          var routeParams = params
          var navDashboard = document.querySelectorAll('.ods-main-nav__item-link > a[href*="/AdminDashboards"]')[0] ? document.querySelectorAll('.ods-main-nav__item-link > a[href*="/AdminDashboards"]')[0].closest('li') : null
          if (!navDashboard) { return false }
          var found = false
          var dashboardItem = 'dashboard/' + routeParams.dashboardId
          document.querySelectorAll('.ods-main-nav__item-link > a').forEach(function (item) {
            if (item.href.includes(dashboardItem)) { found = true }
          })
          if (!found) {
            console.log('dashboard no encontrado, marcar opción.')
            setTimeout(() => {
              navDashboard.className += ' active specialMark'
            }, 300)
          } else {
            setTimeout(() => {
              navDashboard.className = navDashboard.className.replaceAll('active specialMark', '')
            }, 300)
          }
        }
      }
    }
  },
  created () {
    this.isReloaded = sessionStorage.getItem('isReloaded')
    if (this.isReloaded === '1') {
      this.messages = JSON.parse(sessionStorage.getItem('messages'))
    }
  }
}
</script>

<style lang="scss" scoped>
  .ods-main-nav {
    ::v-deep .no-scrolling-wrapper,
    ::v-deep .scrollbar__wrap {
      height: $--nav-height;
    }
    &.has-top-bar {
      ::v-deep .no-scrolling-wrapper,
      ::v-deep .scrollbar__wrap {
        height: $--nav-height--topbar;
      }
    }
  }
  .ods-main-nav__item-link a .ods-main-nav__item-text {
    font-family: 'Poppins','Soho Gothic Pro'
  }
  .ods-main-nav__item-link a, .ods-main-nav__item-link span:not([class*=" ods-icon-"]), .ods-main-nav__item-link span:not([class*=ods-icon-]) {
    margin-right: 6px;
}
</style>
