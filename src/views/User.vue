<template>
  <div class="user">
    <Account></Account>
  </div>
</template>

<script>
import Account from '@/components/user/Account.vue'

export default {
  name: 'User',
  components: {
    Account
  }
}
</script>
<style lang="scss" scoped>
.user {
  margin: rem(24);
}
</style>
