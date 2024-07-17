<template>
  <div class="usersUnit">
    <Users :options="options"></Users>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Users from '@/components/user/Users.vue'

export default {
  name: 'Test',
  components: {
    Users
  },
  data () {
    return {
      componentOptions: {}
    }
  },
  methods: {
    getComponentOptions () {
      const componentId = 'users'
      const role = this.getUser?.role
      const COMPONENTS = this.getAllowedComponents ? this.getAllowedComponents : {}
      const defaultOptions = COMPONENTS.definition.filter(x => x.id === componentId).map(y => y.defaultOptions)[0] || {}
      const roleOptions = COMPONENTS.navigation.filter(x => x.role === role).map(y => y.allowed)[0].filter(z => z.id === componentId)[0]?.roleOptions || {}
      const options = { ...defaultOptions, ...roleOptions }
      this.componentOptions = options
    }
  },
  computed: {
    ...mapGetters({
      getUser: 'getUser',
      getAllowedComponents: 'getAllowedComponents'
    }),
    options () {
      return this.componentOptions
    }
  },
  created () {
    this.getComponentOptions()
  },
  mounted () {
    console.log('Components: ', this.getAllowedComponents, 'User: ', this.getUser, 'Options: ', this.options)
  }
}
</script>
  <style lang="scss" scoped>
.usersUnit {
  margin: rem(24);
}
</style>
