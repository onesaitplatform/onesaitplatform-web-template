<template>
  <section class="login bars">
    <header class="login__header">
      <div class="mainLogo grid_cell" :style="setLogos('mainLogo')">
        <login-logo v-if="this.isEmpty(productInfo)"></login-logo>
        <ods-logo v-else
          ref="logo"
          :style="[productInfo.negative ? { backgroundColor: 'var(--color-txt-primary)' } : { backgroundColor: 'var(--color-bg-primary)' }]"
          :suite="productInfo.suite"
          :product="productInfo.product"
          :productModule="productInfo.productModule"
          :secondary="productInfo.secondary"
          :negative="productInfo.negative"
          :simple="productInfo.simple"
          :onesait="productInfo.onesait">
        </ods-logo>
      </div>
      <div class="clientLogo grid_cell" :style="setLogos('clientLogo')">
        <div v-if="Logo" class="ods-logo" style="background-color: var(--color-bg-primary);justify-content: center;flex-wrap: initial;align-items: flex-end;">
          <img title="Logo" alt="Logo" :src="'/web/' + appFolder + '/img/' + Logo" width="auto" height="60px">
        </div>
      </div>
    </header>
    <main class="login__main" :style="{background: background}">
      <router-view :loading-text="password ? $t('password.sending') : $t('login.logging')"></router-view>
    </main>
  </section>
</template>

<script>
import LoginLogo from '@/components/login/LogoOnesait'
import { mapGetters } from 'vuex'
// import LangSelector from '@/components/shared/LangSelector'

export default {
  name: 'Login',
  components: {
    // LangSelector,
    LoginLogo
  },
  computed: {
    ...mapGetters({
      password: 'getIsPasswordForm',
      productInfo: 'getCurrentProductInfo',
      getCurrentCustomization: 'getCurrentCustomization'
    }),
    // apply centralized customization for main login form and section
    background () {
      var background = '#FFF'
      var customization = this.getCurrentCustomization || {}
      var loginInfo = customization?.login
      if (loginInfo) {
        background = loginInfo?.backgroundColor || '#FFF'
      }
      return background
    }
  },
  data: function () {
    return {
      appFolder: process.env.VUE_APP_APPLICATION,
      Logo: process.env.VUE_APP_LOGO || 'onesait-brand-logo.svg'
    }
  },
  methods: {
    // check empty objects
    isEmpty (o) {
      return Object.keys(o).length === 0
    },
    // apply centralized customization for logos
    setLogos (logo) {
      var customization = this.getCurrentCustomization || {}
      var loginInfo = customization?.login
      var style = {}
      var order = 0
      var show = true

      if (loginInfo) {
        order = logo === 'mainLogo' ? loginInfo.mainLogo.order : loginInfo.clientLogo.order
        show = logo === 'mainLogo' ? loginInfo.mainLogo.show : loginInfo.clientLogo.show
        style = !show ? { visibility: 'hidden', order: order } : order === 1 ? { order: 1, justifyContent: 'start', alignSelf: 'center' } : { order: 2, justifyContent: 'end', alignSelf: 'center' }
      } else {
        style = logo === 'mainLogo' ? { order: 1, justifyContent: 'start', alignSelf: 'center' } : { order: 2, justifyContent: 'end', alignSelf: 'center' }
      }
      return style
    }
  }
}

</script>

<style lang="scss" >
.login {
  height: 100vh;
  display: flex;
  flex-direction: column;
  color: var(--color-txt-primary);
  background-color: var(--color-bg-primary);

  &__header {
    padding: $space-300 $space-500;
    width: 100%;
    border-bottom: $border-size-200 solid var(--color-border-hard-divisor);
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
    gap: 12px 12px;
    grid-auto-flow: column;
    justify-content: stretch;
    align-content: stretch;
    justify-items: stretch;
    align-items: start;

    & > svg path {
      fill: var(--color-txt-primary);
      width: 100%
    }

    & > grid_cell { display: grid; }

    &__theme-selector {
      position: absolute;
      right: rem(20);
      top: rem(20);
    }
  }

  &__main {
    padding: $space-300;
    display: flex;
    justify-content: center;
    width: 100%;
    flex: 1;
  }
}
.ods-logo {
  background-color: var(--color-bg-primary);
  display: flex;
  text-align: center;
  align-items: center;
  align-content: center;
  flex-flow: column;
  width: auto;
}
.ods-logo a {
    display: block;
    overflow: hidden;
}

.ods-logo a > svg > path {
  width: auto;
}

.ods-logo a > svg {
  width: auto;
}

.mainLogo {
  display:grid;
  align-self: center;
}

.clientLogo {
  display:grid;
  align-self: center;
}

</style>
