<script>
export default {
  name: 'Cards',

  data () {
    return {
      count: 1,
      cardsIndex: 12
    }
  },

  computed: {
    cards () {
      return this.list.filter((d, i) => i < this.cardsIndex * this.count)
    }
  }
}
</script>

<style lang="scss" scoped>
.slide-fade-enter-active {
  animation: slide-fade 0.8s ease-out;
}
.slide-fade-leave-active {
  animation: slide-fade 0.8s ease-out reverse;
}
@keyframes slide-fade {
  0% {
    max-height: 0;
    opacity: 0.4;
  }
  100% {
    max-height: rem(400);
    opacity: 1;
  }
}
</style>
