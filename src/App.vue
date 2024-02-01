<template>
  <div id="app">
    <template v-if="!this.$route.path.includes('login') && this.getLoad">
        <header-content @hasTopBar="handleHeigth"></header-content>
        <div class="ods-flex" :style="customCSSVars">
          <nav-content></nav-content>
          <transition name="fade" mode="out-in">
            <ods-main >
              <ods-scrollbar :wrapClass="wrapClass">
                  <router-view :dashboardReady="DashboardAppLoaded"></router-view>
                <footer></footer>
              </ods-scrollbar>
            </ods-main>
          </transition>
        </div>
    </template>
    <template  v-else>
      <router-view></router-view>
    </template>
  </div>
  </template>

<script>
import { mapGetters } from 'vuex'
import HeaderContent from '@/components/header/HeaderContent'
import NavContent from '@/components/nav/NavContent'

export default {
  name: 'App',
  components: {
    HeaderContent,
    NavContent
  },

  data () {
    return {
      wrapClass: '',
      orderState: {},
      DashboardAppLoaded: false
    }
  },
  computed: {
    ...mapGetters({
      getEmbededApp: 'getEmbededApp',
      getCurrentCustomization: 'getCurrentCustomization',
      getLoad: 'getLoad'
    }),
    // if app has custom root classes for customization then load in main.
    customCSSVars () {
      var customizationVars = this.getCurrentCustomization
      var cssCustom = {}
      if (!customizationVars || !customizationVars.styles) { return false }
      if (Object.keys(customizationVars.styles).length === 0) {
        return {}
      } else {
        Object.keys(customizationVars.styles).forEach(key => {
          cssCustom[key] = customizationVars.styles[key]
        })
      }
      return cssCustom
    }
  },
  methods: {
    handleHeigth (val) {
      this.wrapClass = val
        ? 'ods-scrollbar--main-content has-top-bar'
        : 'ods-scrollbar--main-content'
    }
  },
  metaInfo () {
    var app = this
    // if (this.DashboardAppLoaded) { return {} }
    var appFolder = process.env.VUE_APP_APPLICATION
    var theme = process.env.VUE_APP_THEME
    var skipUseTheme = (typeof theme === 'undefined' || theme.length === 0)
    var scriptLoadOrder = [
      {
        name: 'Phase 1 Scripts',
        scripts: [
          '/controlpanel/static/vendor/onesait-ds/lib/vue.min.js',
          '/controlpanel/static/vendor/element-ui/index.js',
          '/controlpanel/static/vendor/echarts-542/echarts.min.js'
        ]
      },
      {
        name: 'Phase 2 Scripts',
        scripts: [
          '/controlpanel/static/dashboards/gridster.js',
          '/controlpanel/static/vendor/onesait-ds/lib/index.js',
          '/web/' + appFolder + '/libs/vue-carousel.min.js',
          '/web/' + appFolder + '/libs/vue-i18n.js',
          '/web/' + appFolder + '/libs/xlsx.full.min.js',
          '/web/' + appFolder + '/libs/ol.js',
          '/controlpanel/static/vendor/vue-echarts-660/vue-echarts.min.js',
          '/controlpanel/static/vendor/element-ui/locale/es.min.js',
          '/controlpanel/static/vendor/element-ui/locale/en.min.js',
          '/controlpanel/static/js/pages/dashboardMessageHandler.js',
          '/controlpanel/static/vendor/jsoneditor/jsoneditor.js',
          '/controlpanel/static/formsio/formiojs/dist/formio.full.js',
          '/controlpanel/static/js/pages/forms.js'
        ]
      },
      {
        name: 'Phase 3 Scripts',
        scripts: [
          '/controlpanel/static/dashboards/scripts/app.js'
        ],
        callback: function () {
          console.log('DS Engine Running...')
          app.DashboardAppLoaded = true
          window.DashboardAppLoaded = true
        }
      }
    ]

    var jsonVueMeta = {
      // additional CSS styles
      link: [
        {
          rel: 'stylesheet',
          href: '/controlpanel/static/formsio/boostrap.css'
        },
        {
          rel: 'stylesheet',
          href: '/web/' + appFolder + '/libs/materialIcons.css'
        },
        /* {
          rel: 'stylesheet',
          href: '/web/web-resources/fonts/fonts.css'
        }, */
        {
          rel: 'stylesheet',
          href: '/controlpanel/static/formsio/formiojs/dist/formio.full.css'
        },
        {
          rel: 'stylesheet',
          href: '/controlpanel/static/formsio/assets/styles.css'
        },
        {
          rel: 'stylesheet',
          href: '/controlpanel/static/formsio/assets/boostrap-form.css'
        },
        {
          rel: 'stylesheet',
          href: '/controlpanel/static/formsio/assets/form-editor.css'
        },
        {
          rel: 'stylesheet',
          href: '/web/' + appFolder + '/libs/ol.css'
        },
        {
          rel: 'stylesheet',
          href: '/controlpanel/static/dashboards/utils/gadget-form-creator.css',
          skip: !app.editmode
        },
        {
          rel: 'stylesheet',
          href: '/controlpanel/static/vendor/element-ui/theme-chalk/index.css'
        },
        {
          rel: 'stylesheet',
          href: '/controlpanel/api/themes/css/' + theme,
          skip: skipUseTheme
        },
        { rel: 'favicon', href: '/web/' + appFolder + '/favicon.ico' }
      ],
      script: []
    }

    for (var i in scriptLoadOrder) {
      var orderBulk = scriptLoadOrder[i].scripts
      var orderBulkSize = orderBulk.length // we use a counter to detect dynamic load of all scripts
      for (var b in orderBulk) {
        if (!Object.prototype.hasOwnProperty.call(app.orderState, 'order' + i)) {
          app.orderState['order' + i] = orderBulkSize
        }
        var callback = function (src, i, callbackScript, namebulk) {
          return function () {
            app.orderState['order' + i]--
            console.log('Script: ' + src + ' loaded')
            app.orderState = JSON.parse(JSON.stringify(app.orderState))
            if (app.orderState['order' + i] === 0) {
              console.log(namebulk + ' complete loaded')
              if (callbackScript) {
                callbackScript()
              }
            }
          }
        }
        jsonVueMeta.script.push({
          src: orderBulk[b],
          skip: Object.prototype.hasOwnProperty.call(app.orderState, 'order' + (i - 1)) ? !!app.orderState['order' + (i - 1)] : false,
          callback: callback(orderBulk[b], i, scriptLoadOrder[i].callback, scriptLoadOrder[i].name)
        })
      }
    }

    return jsonVueMeta
  }
}
</script>

<style lang="scss">
// You can change this two options to configure your main container
:root {
  --main-padding: 0;
  --main-background: var(--color-bg-terciary);
}

// Calculating windows heights. Do not manipulate!
html,
body {
  .ods-scrollbar--main-content {
    height: calc(100vh );
    padding: var(--main-padding);
    background: var(--main-background);
    display:contents;
    &.has-top-bar {
      height: calc(100vh - #{$--header-height} - #{$--header-topbar});
    }
  }
}
// End calculating windows heights.

// Your global styles goes from here ↓↓↓↓
.ods-dataviz {
  height: 100%;
}

.ng-scope {
  box-sizing: border-box;

  &::-webkit-scrollbar {
    all:unset;
  }

  &::-webkit-scrollbar {
    width: 0.6em;
  }

  &::-webkit-scrollbar-track {
    background: #d9d9d9;
    border-radius: 35px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: darkgrey;
    border-radius: 35px;
  }

}

.ods-tabs__content {
  overflow: visible!important;
  height: calc(100% - 70px);
  position: inherit!important;
}

.ods-tab-pane {
  height: 100%;
}

.ods-picker-panel__body-wrapper .ods-picker-panel__sidebar {
  width: rem(114);
}

.ods-dataviz__toolbox {
  position: absolute;
  right: rem(30);
  top: rem(10);
}

.item-buttons {
  margin: 5px 8px 0px 114px!important;
}

.ods-row.is-justify-space-between.is-align-middle {
  position: initial;
}

.scroll-style {
  height: 350px!important;
}

// ODS-PIE-TABLE-CHART
.dataviz-pie-container text {
    font-size: .75vw!important;
}
.ods-input__icon.ods-range__close-icon {
    display: inline-block!important;
}
.ods-date-editor--daterange>.ods-input__inner {
  width: 10.5rem!important;
}
.ods-logo a {
    display: block;
    overflow: hidden;
    width: 400px!important;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.ods-color-picker__panel {
    z-index: 99999 !important;
  }
ul {
    padding-left: 0rem!important;
}
.ods-breadcrumb{
  padding-top: 2px !important;
}

.ods-main{
    background-color: #fff !important;
  }
.formio-component-datagrid .datagrid-table, .formio-component-datagrid .datagrid-table td, .formio-component-datagrid .datagrid-table th {
    border: 0px solid #ddd !important;
    padding: 10px;
}
.gadget-app{
  display: block;
  width: 100%;
  height: 100%;
}
td.table-options > a{
  cursor: pointer !important;
  }
.containerD__layout{
  height: calc(100vh - 56px);
}
</style>
