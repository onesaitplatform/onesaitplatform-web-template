<template>
  <ods-form class="login__form" :model="loginForm" :rules="rules" ref="loginForm" :hide-required-asterisk="true">
    <div v-loading="loading && !mobile" v-loading.fullscreen.lock="loading && mobile" v-if="this.showForm">
      <h1 class="login__form__title">{{ $t('login.title') }}</h1>
      <div class="login__form__errors">
        <ods-alert v-show="errors" :title="errorInfo || $t('login.loginError')" type="error" :closable="false"></ods-alert>
      </div>
      <ods-form-item :label="$t('login.user')" prop="user">
        <ods-input :class="{ error: errors }" type="text" v-model="loginForm.user"></ods-input>
      </ods-form-item>
      <div class="login__form__label-pass">
        <label for="password">{{ $t('login.password') }}</label>
        <router-link to="/login/password" custom="custom" v-slot="{ href, navigate }"><a :href="href" @click="navigate" @keypress.enter="navigate" v-if="showForgot" role="link">{{ $t('login.forgotPassword') }}</a></router-link>
      </div>
      <ods-form-item prop="password">
        <ods-input :class="{ error: errors }" type="password" v-model="loginForm.password" show-password="show-password"></ods-input>
      </ods-form-item>
      <ods-select v-model="application" v-if="isLogged && isMultipleApp" @change="handleChangeApplication" placeholder="Seleccionar Aplicación" selectLabel="Aplicaciones" size="exa">
        <ods-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></ods-option>
      </ods-select>
      <div class="login__form__actions">
        <ods-checkbox v-model="keepMeLogged" v-if="showKeepMeLogged">{{ $t('login.keepMeLogged') }}</ods-checkbox>
        <ods-button v-if="!isLogged" size="large" native-type="submit" @click.prevent="submitForm('loginForm')">{{ $t('login.login') }}</ods-button>
      </div>
      <div class="login__form__register"><span v-if="showRegister">{{ $t('login.register.account') }}
          <router-link to="/login" custom="custom" v-slot="{ href, navigate }"><a :href="href" @click="navigate" @keypress.enter="navigate" role="link">{{ $t('login.register.register') }}</a></router-link></span></div>
    </div>
    <!-- access for keycloak -->
    <ods-module class="ods-dashboard" v-if="this.showAccess" v-loading="loading && !mobile" v-loading.fullscreen.lock="loading && mobile">
      <h2 class="ods-dashboard__title">Accessing the Application...</h2>
      <div class="ods-dashboard__desc">
        <p class="ods_dashboard__info">You are accessing the application, we are loading the Environment, in a few seconds you will be redirected...</p>
      </div>
    </ods-module>
    <!-- invalid user in app -->
    <ods-module class="ods-dashboard has-errors" v-if="this.showInvalid" v-loading="loading && !mobile" v-loading.fullscreen.lock="loading && mobile">
      <h2 class="ods-dashboard__title"><span class="ods-icon-warning icon-sm"></span> User has no access to this APP.</h2>
      <div class="ods-dashboard__desc">
        <p class="ods_dashboard__info">You are a valid platform User, but you don't have permission on this APP. Please contact the administrator of the platform.</p>
        <div class="block">
          <ods-button size="large" type="primary" @click="goToLogin()">Back to Login</ods-button>
        </div>
      </div>
    </ods-module>
    <!-- invalid centralized configuration -->
    <ods-module class="ods-dashboard has-errors" v-if="this.showInvalidConfiguration" v-loading="loading && !mobile" v-loading.fullscreen.lock="loading && mobile">
      <h2 class="ods-dashboard__title"><span class="ods-icon-warning icon-sm"></span> Centralized configuration Error</h2>
      <div class="ods-dashboard__desc">
        <p class="ods_dashboard__info">The centralized configuration file has errors, or can't be loaded, so the APP will not run. Please contact the administrator of the platform.</p>
        <div class="block">
          <ods-button size="large" type="primary" @click="goToLogin()">Back to Login</ods-button>
        </div>
      </div>
    </ods-module>
  </ods-form>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { member } from '@/services/login/login'
import { HTTP_PLATFORM } from '../../store/modules/http'
export default {
  name: 'LoginForm',
  data () {
    return {
      loginForm: {
        user: '',
        password: ''
      },
      rules: {
        user: [
          { required: true, message: this.$t('login.rules.user'), trigger: 'submit' }
        ],
        password: [
          { required: true, message: this.$t('login.rules.password'), trigger: 'submit' }
        ]
      },
      options: [],
      application: '',
      isLogged: false,
      isMultipleApp: false,
      showForgot: false,
      showRegister: false,
      showKeepMeLogged: false,
      keepMeLogged: true,
      errors: false,
      errorInfo: '',
      showForm: true,
      showAccess: false,
      showInvalid: false,
      showInvalidConfiguration: false
    }
  },
  methods: {
    ...mapActions([
      'login',
      'preLogin',
      'loader',
      'getRealmData',
      'getUserData',
      'getI18nData',
      'getConfiguration',
      'setCurrentApplication',
      'loadAvailableApplications',
      'loadEnvironment',
      'resetGlobalFilters',
      'setJWTToken',
      'setKUser'
    ]),

    // isMember: check if a valid user is a valid APP user checking if has role in app realm.
    async isMember (realmId) {
      var valid = false
      const APP = realmId
      var apps = []
      try {
        const memberInformation = await member()
        apps = memberInformation || []
        valid = apps.length > 0 && apps.includes(APP)
        return valid
      } catch (error) {
        console.error('Error checking Member:', error)
      }
    },

    // Check logOut messages
    checkLogOut () {
      if (sessionStorage.getItem('sessionOut') && sessionStorage.getItem('sessionOut') === '1') {
        this.$notify({
          title: 'Session Expires',
          message: sessionStorage.getItem('sessionOutMessage') ? sessionStorage.getItem('sessionOutMessage') : 'The session expired due to timeout or some other problem, please login in the application.',
          type: 'success',
          iconClass: 'ods-icon-filter',
          duration: 10000,
          position: 'top-right',
          showClose: true
        })
        sessionStorage.removeItem('sessionOut')
        sessionStorage.removeItem('sessionOutMessage')
      }
    },

    // got to login when error hapends.
    goToLogin () {
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
    },

    // SUBMIT LOGIN FORM
    submitForm (formName) {
      // remove previous data in session
      sessionStorage.clear()
      // validation
      this.$refs[formName].validate(async valid => {
        if (valid) {
          this.loader({ loader: true })
          const data = {
            username: this.loginForm.user,
            password: this.loginForm.password
          }
          // first default login to get user and procceed with available Applications
          const user = await this.preLogin(data)
          const isError = user instanceof Error

          // IF PRELOGIN OK
          if (!isError) {
            this.$notify.closeAll()
            this.isLogged = true
            // console.log('user info: ', JSON.stringify(user))
            HTTP_PLATFORM.defaults.headers.common.Authorization = 'Bearer ' + user.data.access_token

            // GET CONFIGURATION
            const configuration = await this.getConfiguration()

            // check available Apps for user
            const availableApps = await this.loadAvailableApplications()
            // console.log('Available Apps: ', JSON.stringify(availableApps))

            // To-Do: encapsular esté código
            // handleConfiguration:
            // mount application selector or directly load application information (just only 1 App.)
            const nApps = configuration.filter(function (obj) { return availableApps.indexOf(obj.realmId) !== -1 }).map(({ realmId, title }) => ({ value: realmId, label: title }))
            if (nApps.length === 0) {
              // TO-DO: ver que hacer cuando no hayan aplicaciones, en principio error de acceso.
            } else if (nApps.length === 1) {
              // 1 APP directly load this app.
              // console.log('JUST ONE APP: ', JSON.stringify(nApps))
              this.isMultipleApp = false
              this.$notify({
                title: 'Accesing to ' + nApps[0].label + ':',
                message: 'This User only has this Application available, loading its environment...',
                type: 'success',
                iconClass: 'ods-icon-multiple',
                duration: 5000,
                position: 'top-right',
                showClose: true
              })
              const selectedApp = configuration.filter(x => x.realmId === nApps[0].value).map(y => y.realmId)[0]
              this.setCurrentApplication(selectedApp) // set current App.
              this.handleChangeApplication(selectedApp)
            } else {
              // +1 App so load the App selector to select one and load it
              this.options = nApps
              this.isMultipleApp = true
              this.$notify({
                title: 'Selection of Applications:',
                message: 'This User has several Applications Available, please select which one you want to access...',
                type: 'success',
                iconClass: 'ods-icon-multiple',
                duration: 30000,
                position: 'top-right',
                showClose: true
              })
            }
            this.loader({ loader: false })
          } else {
            console.log('error retriving User Data...')
            this.$notify({
              title: 'Login error',
              message: 'Check the username and password provided, and try again.',
              type: 'error',
              iconClass: 'ods-icon-error-alert',
              duration: 4000,
              position: 'top-right',
              showClose: true
            })
            this.loader({ loader: false })
          }
        } else {
          console.log('error submit!!')
          this.errors = true
          this.loader({ loader: false })
          return false
        }
      })
    },
    // handleChangeApplication: application selector, on Change launch login against this App.
    async handleChangeApplication (app) {
      var that = this
      var isaChangeOfApp = localStorage.getItem('accessAppRequest') !== null
      this.loader({ loader: true })
      this.resetGlobalFilters() // reset filters configuration.
      var config = this.getCurrentConfiguration
      var appConfig = config.length > 0 ? config.filter(x => x.realmId === app)[0] : {}

      // set current App
      this.setCurrentApplication(app)

      // add user to App conf to use as payload or get from app if is a multi-app change application process
      const user = that.loginForm.user !== '' ? that.loginForm.user : config.find(o => o.username !== '').username
      const pass = that.loginForm.password !== '' ? that.loginForm.password : config.find(o => o.password !== '').password
      this.$set(appConfig, 'username', user)
      this.$set(appConfig, 'password', pass)

      // make app-login and load environment
      const userApp = await this.login(appConfig)
      const isAppError = userApp instanceof Error

      // IF APP-LOGIN OK
      if (!isAppError) {
        this.$notify.closeAll()
        this.setJWTToken(userApp.data.access_token)
        HTTP_PLATFORM.defaults.headers.common.Authorization = 'Bearer ' + userApp.data.access_token
        sessionStorage.setItem('sessionToken', userApp.data.access_token)
        this.$set(appConfig, 'role', userApp.data.authorities[0])

        // LOAD APP i18n
        // eslint-disable-next-line no-unused-vars
        const i18nPlatform = await this.getI18nData(this)
        // console.log('|--> Available App I18n:', JSON.stringify(i18nPlatform))

        // LOAD APP ENVIRONMENT
        const environment = await this.loadEnvironment(appConfig)
        const isEnvironmentError = environment instanceof Error
        if (!isEnvironmentError) {
          console.log('environment APP Loaded... redirecting to home.')
          // INITIAL NAVIGATION NOW CAN BE AN OBJECT OR STRING, if string is just a dashboard, if object can be dashboard or component
          if (typeof environment === 'string') {
            console.log('Initial navigation: ', environment)
            this.$router.push({ name: 'Dashboard', params: { dashboardId: environment } }).catch(() => {})
          } else {
            console.log('Initial navigation: ', environment.type, environment.id)
            if (environment.type === 'dashboard') {
              this.$router.push({ name: 'Dashboard', params: { dashboardId: environment.id } }).catch(() => {}) // catch cause environment is a promise
            } else {
              this.$router.push({ name: environment.id, path: environment.path, params: environment.params ? environment.params : {} }).catch(() => {}) // catch cause environment is a promise
            }
          }
          this.loader({ loader: false })
          if (isaChangeOfApp) {
            // remove change app request if it is a change of Application Proccess, its finished.
            localStorage.removeItem('accessAppRequest')
          }
        } else {
          console.log('error loading environment')
        }
      } else {
        console.log('error nuevo login')
      }
    },
    accessToApp () {
      console.log('Checking Access to APP...')
      this.loader({ loader: false })
      if (localStorage.getItem('accessAppRequest')) {
        console.log('There an Access APP request, hide login form , show access card, and launch APP configuration...')
        this.showForm = false
        this.showAccess = true
        console.log('APP INFO: ', JSON.stringify(this.availableApps))
        var accessData = JSON.parse(localStorage.getItem('accessAppRequest'))
        this.handleChangeApplication(accessData.realm)
      } else {
        console.log('There NO Access APP request, so loading login form...')
      }
    },
    async accessKeyCloak () {
      // accesing application directly from keycloak auth
      var app = this
      var isArray = function (a) {
        return Object.prototype.toString.apply(a) === '[object Array]'
      }

      if (localStorage.getItem('vue-token')) {
        this.showForm = false
        const DecodeJWT = (token) => { try { return JSON.parse(atob(token.split('.')[1])) } catch (e) { return null } }
        var keyCloakToken = localStorage.getItem('vue-token')
        if (keyCloakToken) {
          this.setJWTToken(keyCloakToken)
        }
        // GET USER INFO.
        const keycloakInfo = DecodeJWT(keyCloakToken)
        const project = process.env.VUE_APP_PROJECT
        const appInfo = { realmId: keycloakInfo.azp, username: keycloakInfo.username, role: keycloakInfo.authorities[0], project: project }
        const kUser = { user: appInfo.username, username: appInfo.preferred_username, email: keycloakInfo.email, role: appInfo.role }
        this.setKUser(kUser)

        HTTP_PLATFORM.defaults.headers.common.Authorization = 'Bearer ' + keyCloakToken
        sessionStorage.setItem('sessionToken', keyCloakToken)

        // check user is member of application (can be a valid platform user but not a valid app user)
        if (await this.isMember(appInfo.realmId)) {
          console.log('IS A VALID MEMBER...')
          this.showAccess = true
        } else {
          // valid user, but not valid in APP, so inform and do login again.
          console.log('IS NOT A VALID MEMBER...')
          this.showAccess = false
          this.showInvalid = true
          return false
        }

        // GET CONFIGURATION
        const configuration = await this.getConfiguration()
        if (configuration instanceof SyntaxError) {
          console.log('ERROR ON CENTRALIZED CONFIGURATION FILE...')
          this.showInvalid = false
          this.showAccess = false
          this.showInvalidConfiguration = true
          return false
        } else {
          const selectedApp = configuration.filter(x => x.realmId === keycloakInfo.azp).map(y => y.realmId)[0]
          this.setCurrentApplication(selectedApp)
        }
        // GET ENVIRONMENT
        const environment = await this.loadEnvironment(appInfo)
        const isEnvironmentError = environment instanceof Error
        if (!isEnvironmentError) {
          const i18nPlatform = await this.getI18nData(app)
          console.log('I18n loaded... ', i18nPlatform)

          // INITIAL NAVIGATION NOW CAN BE AN OBJECT, ARRAY OR STRING, if string is just a dashboard, if object can be dashboard or component and if is an array we can have one initial navigation for each role
          if (typeof environment === 'string') {
            console.log('Initial navigation: ', environment)
            this.$router.push({ name: 'Dashboard', params: { dashboardId: environment } }).catch(() => {})
          } else if (!isArray(environment)) {
            console.log('Initial navigation: ', environment.type, environment.id)
            if (environment.type === 'dashboard') {
              this.$router.push({ name: 'Dashboard', params: { dashboardId: environment.id } }).catch(() => {}) // catch cause environment is a promise
            } else {
              this.$router.push({ name: environment.id, path: environment.path, params: environment.params ? environment.params : {} }).catch(() => {}) // catch cause environment is a promise
            }
          } else {
            // array of initial navigation by role
            console.log('Initial navigation: ', environment, environment.length, ' roles')
            if (environment.filter(x => x.role === appInfo.role).length > 0) {
              var navigation = environment.filter(x => x.role === appInfo.role)[0]
              if (navigation.type === 'dashboard') {
                this.$router.push({ name: 'Dashboard', params: { dashboardId: navigation.id } }).catch(() => {}) // catch cause environment is a promise
              } else {
                this.$router.push({ name: navigation.id, path: navigation.path, params: navigation.params ? navigation.params : {} }).catch(() => {}) // catch cause environment is a promise
              }
            }
          }
          this.loader({ loader: false })
        } else {
          console.log('ERROR ON ENVIROMENT LOAD...')
        }
      } else {
        console.log('There NO keycloak Auth, so loading login form...')
      }
    }
  },
  computed: {
    ...mapGetters({
      loading: 'getLoaderState',
      mobile: 'isMobile',
      loginType: 'getLoginType',
      realm: 'getRealmInfo',
      availableApps: 'getRealmsApp',
      getCurrentConfiguration: 'getCurrentConfiguration',
      getLoginToken: 'getLoginToken',
      getCurrentCustomization: 'getCurrentCustomization'
    })
  },
  watch: {
    async getLoginToken (newValue, oldValue) {
      var that = this
      if (newValue !== '' || newValue !== undefined) {
        const i18nPlatform = await this.getI18nData(that)
        console.log('i18n: ', i18nPlatform)
      }
    }
  },
  mounted: function () {
    this.accessToApp()
    this.accessKeyCloak()
    this.checkLogOut()
  }
}

</script>

<style lang="scss" scoped>
.login__form {
  width: 100%;
  padding-top: $space-700;

  @include mediaXs {
    max-width: rem(400);
  }

  @include mediaLg {
    max-width: rem(600);
  }

  /* login title & description */

  &__title {
    @include txt-body-600;
    text-align: center;
    padding-bottom: $space-400;
  }

  &__description {
    @include txt-body-300;
    padding-bottom: $space-300;
  }

  /* label password */

  &__label-pass {
    display: flex;
    @include txt-body-200;
    color: var(--color-txt-secondary);
    padding-bottom: $space-050;

    & > a {
      color: var(--color-txt-interactive);
      margin-left: auto;
      transition: 0.3s all ease;

      &:hover {
        color: var(--color-bg-hover);
      }
    }
  }

  /* Input differences */

  .ods-input {
    &__inner {
      height: rem(40);
    }
    &__suffix {
      height: rem(40);

      .ods-input__icon.ods-icon-eye {
        font-size: rem(22);
      }
    }
  }

  /* Actions */

  &__actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: $space-700;
  }

  /* Errors */

  &__errors {
    margin-bottom: $space-300;
  }

  /* Register */

  &__register {
    margin-top: $space-400;
    padding-top: $space-300;
    border-top: $border-size-200 dotted var(--color-border-hard-divisor);
    @include txt-body-500;
    text-align: center;

    & > a {
      color: var(--color-txt-interactive);
      margin-left: $space-200;
      transition: 0.3s all ease;

      &:hover {
        color: var(--color-bg-hover);
      }
    }
  }
}

.ods-dashboard{
  padding: 24px;
  border-radius: 8px;
}
.has-errors {
  background: crimson;
  color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;
}
.ods-dashboard_title {
  padding-bottom: 12px;
  font-weight: bold;
}
.ods_dashboard__info {
  margin-bottom: 0px;
  font-size: 1rem;
  font-family: 'Soho','Poppins','soho-light';
  line-height: 24px;
}
.icon-sm { font-size: 2rem; }
.block {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
