<template>
  <div class="admin">
    <Dashboard-Admin :options="options"></Dashboard-Admin>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import DashboardAdmin from '@/components/admin/DashboardAdmin.vue'

export default {
  name: 'Admin',
  components: {
    DashboardAdmin
  },
  data () {
    return {
      componentOptions: {}
    }
  },
  methods: {
    getComponentOptions () {
      const componentId = 'Admin'
      const role = this.getUser?.role
      const allowedComponents = this.getAllowedComponents ? this.getAllowedComponents : []
      const options = allowedComponents.filter(x => x.role === role).map(y => y.components)[0]?.filter(z => z.id === componentId)[0]?.options
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
.admin {
  margin: rem(24);
}
</style>
