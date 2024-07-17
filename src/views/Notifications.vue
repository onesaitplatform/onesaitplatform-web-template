<template>
  <div class="notifications">
    <Notifications-Admin :options="options"></Notifications-Admin>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import NotificationsAdmin from '@/components/notifications/NotificationsAdmin.vue'

export default {
  name: 'Admin',
  components: {
    NotificationsAdmin
  },
  data () {
    return {
      componentOptions: {}
    }
  },
  methods: {
    getComponentOptions () {
      const componentId = 'Notifications' // SAME ID DEFINED ON CC. (CENTRALIZED CONFIGURATION)
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

  }
}
</script>
<style lang="scss" scoped>
.notifications {
  margin: 0;
}
</style>
