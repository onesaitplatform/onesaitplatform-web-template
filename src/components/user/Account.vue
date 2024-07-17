<template>
  <ods-module class="user__module">
    <header class="user__header">
      <h1 class="ods-txt-title-200">{{$t('user.account.header')}}: <span style="font-size: 85%; color: var(--color-txt-secondary);">{{ accountForm.fullName }}</span></h1>
      <ods-button class="cancelBtn" type="secondary" @click.native="resetForm('accountForm')">{{$t('user.account.inputs.cancel')}}</ods-button>
    </header>
    <!-- USER DATA SECTION -->
    <section class="user__data">
      <section class="user__form-container">
        <ods-form ref="accountForm" :rules="accountRules" class="user__form" :model="accountForm" :inline="false">
          <div class="current-user">
            <ods-form-item :label="$t('user.account.inputs.userName')" style="width: 33%">
                <ods-input v-model="accountForm.userName" :readonly="true"/>
            </ods-form-item>

            <ods-form-item :label="$t('user.account.inputs.role')" style="width: 33%" >
                <ods-input v-model="accountForm.role" :readonly="true"/>
            </ods-form-item>

            <ods-form-item :label="$t('user.account.inputs.date')" style="width: 33%">
                <ods-input :readonly="true" :value="formatDate()" />
            </ods-form-item>

            <ods-form-item prop="fullName" :label="$t('user.account.inputs.fullName')"  style="width: 60%">
                <ods-input v-model="accountForm.fullName" :readonly="false" :class="{ error: errors }" />
            </ods-form-item>

            <ods-form-item prop="mail" :label="$t('user.account.inputs.email')"  style="width: 60%">
                <ods-input v-model="accountForm.mail" :readonly="false"  :class="{ error: errors }"/>
            </ods-form-item>

            <!--<ods-form-item label="Active" >
              <ods-icon v-if="user.active" :name="'checksignal-chat'" :size="'22'" :color="'green'" />
              <ods-icon v-else :name="'error-alert'" :size="'22'" :color="'red'" />
            </ods-form-item> -->
            <!-- extrafields: from user and from component if its defined, then will merged -->
            <ods-form-item  v-for="(value, name, index) in user.extraFields" :key="index" :label="$te('user.account.inputs.' + name) ? $t('user.account.inputs.' + name) : name" style="width: 60%" >
                <ods-input v-model="user.extraFields[name]" :readonly="checkReadOnly(name)" />
            </ods-form-item>
          </div>
          <ods-button :disabled="!user" @click.native="submitUserForm()" style="margin-top:1rem;">{{$t('user.account.inputs.send')}} </ods-button>

          <ods-divider  direction="horizontal" contentPosition="center"></ods-divider>

          <div class="user__change-password">
            <h2 class="user__section-title">{{$t('user.account.title')}}</h2>

            <ods-form-item  prop="newPassword" :label="$t('user.account.inputs.password')">
                  <ods-input
                    v-model="accountForm.newPassword"
                    :class="{ error: errors }"
                    :size="'mega'"
                    type="password"
                    show-password
                    :autocomplete="$t('user.account.inputs.password')" />
              </ods-form-item>

              <ods-form-item prop="checkPassword" :label="$t('user.account.inputs.checkpassword')">
                  <ods-input
                    v-model="accountForm.checkPassword"
                    :class="{ error: errors }"
                    :size="'mega'"
                    type="password"
                    show-password
                    :autocomplete="$t('user.account.inputs.checkpassword')" />
              </ods-form-item>
          </div>

          <ods-button :disabled="disableButton" @click.native="submitPasswordForm()" style="margin-top:1rem;">{{$t('user.account.inputs.sendPassword')}} </ods-button>

        </ods-form>
      </section>
      <!-- INFORMATION SECTION -->
      <section class="user__info">
        <p>{{$t('user.account.info')}}</p>
      </section>
    </section>
      </ods-module>
</template>
<script>
import moment from 'moment'
import { mapActions } from 'vuex'
import { getUser, updateUser } from '@/services/users/users'
import { HTTP_PLATFORM } from '../../store/modules/http'
export default {
  name: 'Account',
  props: {
    options: {
      type: Object,
      default: () => {},
      required: false
    }
  },
  data () {
    // 10-128 CHARS, A-Z,a-z and at least 1 special char.
    var passwordPattern = new RegExp(/(?=^.{10,128}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z])(?=.*[-@#!;._?¿$%^&+=]).*$/)

    // Password validation rule
    var validatePass = (rule, value, callback) => {
      if (this.action === 'data') { callback() }
      if (value === '') {
        callback(new Error('' + this.$i18n.t('user.account.validations.newpassword.required')))
      } else {
        if (passwordPattern.test(value)) {
          if (this.accountForm.checkPassword !== '') {
            this.$refs.accountForm.validateField('checkPassword')
          }
        } else {
          callback(new Error('' + this.$i18n.t('user.account.validations.newpassword.pattern')))
        }
        callback()
      }
    }
    // Repeat Password validation rule
    var validatePass2 = (rule, value, callback) => {
      if (this.action === 'data') { callback() }
      if (value === '') {
        callback(new Error('' + this.$i18n.t('user.account.validations.checkpassword.required')))
      } else if (value !== this.accountForm.newPassword) {
        callback(new Error('' + this.$i18n.t('user.account.validations.checkpassword.same')))
      } else {
        callback()
      }
    }
    return {
      $t: this.$i18n.t,
      // user Account
      currentUser: sessionStorage.username,
      user: {},
      action: 'data',
      accountForm: {
        userName: '',
        fullName: '',
        mail: '',
        role: '',
        newPassword: '',
        checkPassword: ''
      },
      // Validation Form Rules
      accountRules: {
        newPassword: [
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPassword: [
          { validator: validatePass2, trigger: 'blur' }
        ],
        fullName: [
          { required: true, message: this.$t('user.account.inputs.errors.fullName'), trigger: 'blur' }
        ],
        mail: [
          { required: true, message: this.$t('user.account.inputs.errors.emailRequired'), trigger: 'blur' },
          { type: 'email', message: this.$t('user.account.inputs.errors.emailIncorrect'), trigger: ['blur', 'change'] }
        ]
      },
      errors: false
    }
  },
  methods: {
    ...mapActions([
      'login'
    ]),
    // GET CURRENT USER INFO ON REALM
    async getCurrentUser () {
      this.loading = true
      try {
        var user = await getUser(sessionStorage.username)
      } finally {
        this.loading = false
        this.user = user.length > 0 ? user[0] : {}
        // optional fields defined in component extraFields merged with users extrafields
        var componentExtraFields = this.options?.extraFields ? this.options.extraFields : {}

        if (this.user.extraFields) {
          var extra = JSON.parse(this.user.extraFields)
          this.user.extraFields = { ...componentExtraFields, ...extra }
        } else {
          // only component extrafields to add
          this.user.extraFields = { ...componentExtraFields }
        }
        // add to form
        this.accountForm.userName = this.user.username
        this.accountForm.fullName = this.user.fullName || ''
        this.accountForm.mail = this.user.mail || ''
        this.accountForm.role = this.user.role
        this.accountForm.creationDate = this.user.creationDate
      }
    },
    // submit user form (not password)
    submitUserForm () {
      this.action = 'data'
      this.$refs.accountForm.validate(async (valid) => {
        if (!valid) {
          this.errors = true
          return false
        }
        try {
          // only allowed fields and extraFields if able
          var userData = {
            username: this.user.username,
            fullName: this.accountForm.fullName,
            mail: this.accountForm.mail
          }
          // check for extraFields
          if (this.user?.extraFields && Object.keys(this.user?.extraFields).length > 0) {
            userData.extraFields = JSON.stringify(this.user.extraFields)
          }
          const userform = await updateUser(userData)
          console.log(userform)
        } catch (error) {

        } finally {
          console.log('User data proccess ended.')
        }
      })
    },
    submitPasswordForm () {
      this.action = 'password'
      this.$refs.accountForm.validate(async (valid) => {
        if (!valid) {
          this.errors = true
          return false
        }
        try {
          // only allowed fields
          var userData = {
            username: this.user.username,
            password: this.accountForm.newPassword
          }
          const userform = await updateUser(userData)
          console.log(userform)
        } catch (error) {

        } finally {
          console.log('User data proccess ended.')
        }
      })
    },
    async successChangeClose (newPass) {
      // GO TO LOGIN AND LOGIN AGAIN.
      setTimeout(function () { this.$router.push({ name: 'Login' }) }.bind(this), 3000)
      // MAKE A INTERNAL LOGIN TO UPDATE DE USER SESSION AUTH.-
      const data = {
        username: sessionStorage.username,
        password: newPass
      }
      try {
        // LOGIN, update API auth
        const response = await this.login(data)
        const isError = response instanceof Error

        if (!isError) {
          sessionStorage.sessionToken = response.data.access_token
          this.setJWTToken(response.data.access_token)
          HTTP_PLATFORM.defaults.headers.common.Authorization = 'Bearer ' + response.data.access_token
          this.goBack()
        } else {
          // error in login again, go to login.
          setTimeout(function () { this.$router.push({ name: 'Login' }) }.bind(this), 3000)
        }
      } catch (error) {
        console.log(error)
        return false
      }
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
      this.goBack()
    },
    goBack () {
      var previousRoute = sessionStorage.getItem('prevRoute') ? sessionStorage.getItem('prevRoute') : '/dashboard/' + sessionStorage.getItem('favorite')
      setTimeout(function () { this.$router.push({ path: previousRoute }) }.bind(this), 2000)
    },
    formatDate () {
      if (!this.accountForm.creationDate) return this.accountForm.creationDate
      return moment(this.accountForm.creationDate).format('YYYY-MM-DD HH:mm:ss a')
    },
    // component can define readonly special fields, so check It.
    checkReadOnly (field) {
      if (!field) { return false }
      const readOnlyFields = this.options?.readOnly ? this.options?.readOnly : []
      if (readOnlyFields.length === 0) {
        return false
      } else {
        // check if field is in readOnly component list
        return readOnlyFields.includes(field)
      }
    }
  },
  computed: {
    isSamePassword () {
      return ((this.accountForm.newPassword === this.accountForm.checkPassword) && (this.accountForm.newPassword !== '') && (this.accountForm.checkPassword !== ''))
    },
    disableButton () {
      return !this.isSamePassword
    }
  },
  // CREATED
  async created () {
    await this.getCurrentUser()
  },
  mounted () {
    console.log('USER ACCOUNT OPTIONS:', this.options)
  }
}
</script>
<style lang="scss" scoped>

.user {
  &__module {
    border: 1px solid var(--color-border-soft-divisor);
  }

  &__header {
    @include txt-title-150;
    border-bottom: $border-size-200 solid var(--color-border-soft-divisor);
    padding: $space-300;
  }

  &__data {
    display: flex;
    height: calc(100vh - 175px);
    min-height: 900px;
  }

  &__form-container {
    width: 70%;
    height: 100%;
    padding: $space-300;
  }

  &__change-password{
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: flex-start;
    margin-top: 50px;
  }

  &__info {
    width: 30%;
    padding: rem(24);
    background: var(--color-bg-secondary);
  }

  &__form {
    max-width: 85%;
  }
}

::v-deep .ods-module__body {
  padding: 0;
}

::v-deep.ods-input__inner:read-only:not(:disabled) {
    font-weight: bold;
}

::v-deep .ods-form-item {
  margin-bottom: 1rem !important;
  margin-top: 1rem !important;
}

.user-account { display: block; }
.user__section-title {
  @include txt-title-150;
    border-bottom: $border-size-200 solid var(--color-border-soft-divisor);
    padding: $space-200;
    width: 100%;
  }
.title {
    @include txt-title-300;
    margin-bottom: $space-200;
}
.cancelBtn {
  display: block;
  float: right;
  position: absolute;
  right: 42px;
  top: 42px;
}

.current-user{
  display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: center;
    justify-content: space-between;
}
::v-deep .ods-alert { margin: 12px 0px 24px 0px; }
</style>
