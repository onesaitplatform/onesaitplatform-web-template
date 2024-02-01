<template>
  <div class="usersUnit">
    <Users></Users>
  </div>
</template>

<script>
import Users from '@/components/user/Users.vue'

export default {
  name: 'Test',
  components: {
    Users
  }
}
</script>
  <style lang="scss" scoped>
.usersUnit {
  margin: rem(24);
}
</style>
