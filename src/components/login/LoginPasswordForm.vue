<template lang="pug">
ods-form.login__form.login__form--password(
    :model='passwordForm'
    :rules='rules'
    ref='passwordForm'
    :hide-required-asterisk="true")

    template(v-if="emailSent===0")
      div
        h1.login__form__title {{ $t('password.title') }}
        p.login__form__description {{ $t('password.message') }}
        .login__form__errors
          ods-alert(
            v-show="errors"
            :title="$t('password.error')"
            type="error"
            :closable="false")

        ods-form-item(:label="$t('password.email')" prop='email')
          ods-input(
            :class="{error: errors}"
            type="text"
            v-model="passwordForm.email")

      .login__form__actions
        router-link(
          to="/login"
          custom
          v-slot="{ navigate }")
          div(
            @click="navigate"
            @keypress.enter="navigate"
            role="link"
          )
            ods-button(type="neutral" ) {{ $t('password.goBack') }}

        ods-button(
          size='large'
          native-type="submit"
          @click.prevent="submitForm('passwordForm')") {{ $t('password.submitButton') }}

    div.login__password-msg(v-else)
      div
        template(v-if="emailSent===1")
          img(src="../../assets/images/login/email-sent.svg")
          p.login__password-msg__text {{ $t('password.emailSubmitted') }}

        template(v-else-if="emailSent===-1")
          img(src="../../assets/images/login/email-error.svg")
          p.login__password-msg__text {{ $t('password.emailError') }}

        template(v-else-if="emailSent===-2")
          img(src="../../assets/images/login/email-error.svg")
          p.login__password-msg__text {{ $t('serverError') }}

        p.login__password-msg__email(v-if="userEmail") {{ userEmail }}

      router-link(
        to="/login"
        class="login__password-msg__actions"
        custom
        v-slot="{ navigate }")
        div(
          @click="navigate"
          @keypress.enter="navigate"
          role="link"
        )
          ods-button(size='large') {{ $t('password.done') }}
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'LoginPasswordForm',

  data () {
    return {
      passwordForm: {
        email: 'test@test.es'
      },
      rules: {
        email: [
          { required: true, message: this.$t('password.rules.email'), trigger: 'submit' }
        ]
      },
      errors: false,
      emailSent: 0,
      userEmail: ''
    }
  },

  methods: {
    ...mapActions([
      'login',
      'loader'
    ]),

    submitForm (formName) {
      const _this = this
      const emailReg = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
      this.$refs[formName].validate(async valid => {
        if (valid & emailReg.test(this.passwordForm.email)) {
          this.loader({ loader: true, password: true })
          const response = await this.login({ email: this.passwordForm.email })
          const isError = response instanceof Error
          /********************************************
          // Elimina este setTimeout! Es sólo para demo
          ********************************************/
          setTimeout(() => {
            if (!isError) {
              this.errors = false
              this.$notify.closeAll()
              this.emailSent = 1
              this.loader({ loader: false, password: true })
              this.userEmail = response.data.email
            } else {
              this.errors = true
              this.$notify.closeAll()
              this.$notify({
                title: 'Error',
                message: _this.$t('password.error'),
                type: 'error',
                position: 'top-right',
                duration: 5000
              })
              this.emailSent = -1
              this.loader({ loader: false, password: true })
              this.userEmail = this.passwordForm.email
            }
          }, 2500)
          /*   /setTimeout */
        } else {
          console.log('error submit!!')
          this.errors = true
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login__password-msg {
  @include txt-body-500;
  text-align: center;

  &__text {
    padding: $space-300 0 $space-100 0;
    text-align: left;
  }

  &__email {
    padding-bottom: $space-300;
    text-align: left;
  }

  &__actions {
    text-align: right;
  }
}
</style>
