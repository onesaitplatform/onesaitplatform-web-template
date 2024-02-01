<template>
        <div>
        <ShowForm :formcode="formcode" :dataoid="dataoid" :routername="routername"></ShowForm>
        </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ShowForm from '../components/form/ShowForm'

export default {
  name: 'Forms',
  components: {
    ShowForm
  },
  data: function () {
    return {
      formcode: null,
      dataoid: null,
      routername: null
    }
  },
  watch: {
    '$route.params': {
      // Watch for dashboard
      immediate: true,
      handler (params) {
        // get internal id of dashboard
        if (!params.formcode) return false
        var routeParams = params
        this.formcode = routeParams.formcode
        this.dataoid = routeParams.dataoid
        this.routername = routeParams.routername
      }
    }
  },
  // METHODS FROM DASHBOARDS
  methods: {
    // ACTIONS FROM STORES
    ...mapActions([])
  },
  computed: {
    // COMPUTED STORE GETTERS
    ...mapGetters({
      isMultipleApp: 'isMultipleApp',
      getCurrentApplication: 'getCurrentApplication',
      globalFilters: 'getGlobalFilters',
      getGlobalFilters: 'getGlobalFilters',
      getFilterList: 'getFilterList',
      getUser: 'getUser',
      getGlobalIsLoaded: 'getGlobalIsLoaded',
      getInitialDataLink: 'getInitialDataLink',
      getCustomization: 'getCurrentCustomization'
    })
  },

  created () {
  },
  mounted () {
    // formio vars libs initialization
    window.useCache = false
    window.redirectBy = 'events'
    var platformUrl = process.env.VUE_APP_PLATFORM
    window.urlLibraries = `${platformUrl}/controlpanel/static/formsio/libs`
    // store authorization
    window.authorization = { token_type: 'bearer', access_token: sessionStorage.sessionToken }
    window.showformbase = `${platformUrl}/${process.env.VUE_APP_APPLICATION}/${this.formcode}`
    // store host for platform base
    window.platformbase = platformUrl
    window.appbase = platformUrl

    // store host for app base
    window.formsBaseURLCreate = platformUrl + '/controlpanel/api/forms'
  },

  beforeDestroy () {
  },

  // add breadcrum info of dashboard
  // TO-DO: retry breadcrum object in i18n and if not exist dashboad key, use default.
  async beforeRouteEnter (to, from, next) {
    if (!to.params.dashboardId) next()
    // const id = to.params.dashboardId
    // const dashboard = await getDashboard(id)
    // to.params.breadcrumb = dashboard.identification
    next()
  }
}
</script>

<style scoped lang="scss">
.containerD {
  &__layout {
    display: flex;
  }

  &__dashboard {
    width: 100%;
    overflow: hidden;
    margin: rem(8);
    position: relative;
    display:block;
  }
}
::v-deep .ods-accordion {
    padding: 0 rem(16);
    &-item {
      &:first-child {
        border-top: 0;
      }
      &__wrap {
        padding: 0 rem(8);
      }
      &__header {
        padding: rem(20) rem(8);
      }
      &__content {
        .settings-form {
          .ods-form-item {
            margin: rem(12) 0;
          }
        }
      }
    }
  }

  .gridster-item--selected {
    border: 1px solid red;
  }

  .gridster-item--no-selected {
    border: none;
  }
</style>
