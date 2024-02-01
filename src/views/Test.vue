<template>
  <div class="testUnit">
    <Test-Unit></Test-Unit>
  </div>
</template>

<script>
import TestUnit from '@/components/test/TestUnit.vue'

export default {
  name: 'Test',
  components: {
    TestUnit
  }
}
</script>
  <style lang="scss" scoped>
.testUnit {
  margin: rem(24);
}
</style>
