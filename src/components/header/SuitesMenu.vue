<template>
<ul class="ods-actions-menu__ul ods-actions-menu--suites__ul">
  <li class="suites__title">
    <SuiteLogo></SuiteLogo>
  </li>
  <li v-for="item in allowedApps"  v-bind:key="item.value" role="link" class="suites__item">
    <a href="#" @click="changeApp(item.value)">
      <span >{{item.label}}</span>
    </a>
  </li>
  <li v-if="allowedApps.length === 0"><span>No Apps. available</span></li>
</ul>
</template>

<script>
import SuiteLogo from './SuiteLogo'
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'SuitesMenu',
  components: {
    SuiteLogo
  },
  data () {
    return {
      showSuiteMenu: true
    }
  },
  methods: {
    changeApp: function (realm) {
      const currentApp = this.getCurrentApplication
      const currentConfiguration = this.getCurrentConfiguration
      const currentRealm = currentConfiguration.filter(item => item.realmId === currentApp)[0]
      const currentTitle = this.getCurrentAppTitle
      if (currentRealm.realmId === realm) {
        this.$notify({
          title: 'Acceso de Aplicaciones:',
          message: 'Ya se encuentra en la Aplicación ' + currentTitle,
          type: 'warning',
          iconClass: 'ods-icon-multiple',
          duration: 3000,
          position: 'top-right',
          showClose: true
        })
        return false
      } else {
        console.log('ChangeApp process...')
        const accessAppRequest = {
          realm: realm,
          username: sessionStorage.username
        }
        localStorage.setItem('accessAppRequest', JSON.stringify(accessAppRequest))
        this.$router.push({ path: '/login' })
      }
    },
    ...mapActions({
      updateApps: 'updateApplications'
    })
  },
  computed: {
    ...mapGetters({
      getCurrentConfiguration: 'getCurrentConfiguration',
      getCurrentApplication: 'getCurrentApplication',
      getCurrentAppTitle: 'getCurrentAppTitle',
      getRealmsApp: 'getRealmsApp'
    }),
    allowedApps () {
      const configuration = this.getCurrentConfiguration
      const availableApps = this.getRealmsApp
      const Apps = configuration.filter(item => availableApps.includes(item.realmId)).map(({ realmId, title }) => ({ value: realmId, label: title }))
      return Apps
    }
  },
  mounted () {
    // this.updateApps()
  }
}
</script>

<style lang="scss">
  .ods-actions-menu--suites__ul {
    padding: $space-100;
    .suites__title {
      background-color: var(--color-data-categorical-graphite);
      color: var(--color-bg-primary);
      min-height: $space-500;
      padding: $space-100 $space-100 $space-100 $space-200;
      box-sizing: border-box;
      margin-bottom: $space-100;
    }
    .suites__logo {
      width: rem(72);
      vertical-align: bottom;
      margin-right: $space-100;
    }
    .suites__text {
      line-height: 21px;
    }
    .suites__item {
      padding: 0;
      a {
        padding: 0 $space-100 0 $space-200;
        box-sizing: border-box;
        color: var(--color-txt-primary);
        @include txt-body-500;
        line-height: $space-500;
        &:before {
          content: '';
          background-image: url('../../assets/images/header/onesait-dimension-main-header.svg');
          width: 13px;
          height: 23px;
          display: inline-block;
          background-size: cover;
          background-repeat: no-repeat;
          margin-right: $space-100;
          vertical-align: middle;
        }
        span {
          display: inline-block;
          vertical-align: middle;
          max-width: rem(160);
          white-space: pre;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      &:last-child {
        margin-bottom: $space-100;
      }
    }
  }
</style>
