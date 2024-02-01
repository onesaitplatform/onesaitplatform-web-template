<template>
  <ul class="ods-actions-menu__ul ods-actions-menu--user__ul">
    <li class="user-ul__user-name">
      {{ userName }}
      {{ userMail }}
    </li>
    <li class="ods-actions-menu__separator"></li>
    <li v-if="showLanguage">
      <lang-selector
        cssClass="user-ul__languages"
        :mobile="isMobile"
      ></lang-selector>
    </li>
    <li v-if="showLanguage" class="ods-actions-menu__separator"></li>
    <router-link to="/User" custom="custom" v-slot="{ href, navigate }">
      <li @click="navigate" @keypress.enter="navigate" role="link">
        <a :href="href">
          <ods-icon name="user-role"></ods-icon>{{ $t("header.user.account") }}
        </a>
      </li>
    </router-link>
    <li class="ods-actions-menu__separator"></li>
    <ods-select
      v-if="showThemes"
      class="user-ul__languages"
      v-model="themeSelector"
      @change="handleTheme"
      :selectLabel="$t('header.user.theme')"
    >
      <ods-option key="1" value="light"></ods-option>
      <ods-option key="2" value="dark"></ods-option>
    </ods-select>
    <li v-if="showThemes" class="ods-actions-menu__separator"></li>
    <li @click="logOut" class="logout">
      <ods-icon name="logout"></ods-icon>{{ $t("header.user.logout") }}
    </li>
  </ul>
</template>

<script>
import LangSelector from '@/components/shared/LangSelector'
import { mapGetters } from 'vuex'

export default {
  name: 'UserMenu',

  components: {
    LangSelector
  },

  data () {
    return {
      langSelector: '',
      themeSelector: 'light',
      href: '',
      userName: sessionStorage.username,
      userMail: sessionStorage.usermail
    }
  },

  computed: {
    ...mapGetters({
      isMobile: 'isMobile',
      getUser: 'getUser',
      getCurrentCustomization: 'getCurrentCustomization'
    }),
    showLanguage () {
      var customization = this.getCurrentCustomization || null
      if (customization) {
        return customization.user ? customization.user.showLanguage : false
      } else {
        return true
      }
    },
    showThemes () {
      var customization = this.getCurrentCustomization || null
      if (customization) {
        return customization.user ? customization.user.showTheme : false
      } else {
        return true
      }
    }
  },

  methods: {
    handleTheme (val) {
      document.querySelector('html').dataset.theme = val
      window.localStorage.setItem('theme', val)
    },
    logOut () {
      localStorage.removeItem('vuex')
      localStorage.removeItem('vue-token')
      localStorage.removeItem('vue-refresh-token')
      localStorage.clear()
      sessionStorage.clear()

      // LOGOUT IS DIFFERENT FOR KEYCLOAK AUTH APP OR REALM ONLY APP
      var platformUrl = process.env.VUE_APP_PLATFORM
      if (process.env.VUE_APP_AUTH_TYPE === 'KEYCLOAK') {
        var keycloakRealmId = process.env.VUE_APP_KEYCLOAK_REALMID
        var keycloakApplication = process.env.VUE_APP_APPLICATION
        window.location.href = '/auth/realms/' + keycloakRealmId + '/protocol/openid-connect/logout?redirect_uri=' + platformUrl + '/web/' + keycloakApplication + '/'
      } else {
        var webApplication = process.env.VUE_APP_APPLICATION
        window.location.href = platformUrl + '/web/' + webApplication + '/login'
      }
    }
  }
}
</script>
<style scoped>
.logout {
  font-size: 12px;
  font-weight: 400;
  font-style: normal;
  font-stretch: normal;
  letter-spacing: normal;
  color: #060e14;
  padding-top: 12px;
  padding-right: 8px;
  padding-bottom: 12px;
  padding-left: 8px;
  cursor: pointer;
}
.logout:hover {
  color: var(--color-txt-button);
  background: var(--color-bg-interactive);
}
</style>
