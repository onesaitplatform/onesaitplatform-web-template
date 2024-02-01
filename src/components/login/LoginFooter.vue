<template lang="pug">
footer.login__footer
    ul
      router-link(
      v-for="link in $t('login.footerLinks')"
      :key="link"
      :to="`/${link}`"
      custom
      v-slot="{ href, navigate }")
        li(
          @click="navigate"
          @keypress.enter="navigate"
          role="link"
        )
          a(:href="href") {{ link }}
</template>

<script>
/* eslint-disable */
export default {
  name: 'LoginFooter'
}
</script>

<style lang="scss" scoped>
  .login__footer {
  padding: $space-300;
  display: flex;
  justify-content: center;

  & > ul {
    display: flex;
    justify-content: space-around;
    width: rem(300);

    li > a {
      color: var(--color-txt-secondary);
      margin-left: auto;
      transition: 0.3s all ease;
      @include txt-body-300;

      &:hover {
        color: var(--color-txt-interactive);
      }
    }
  }
}
</style>
