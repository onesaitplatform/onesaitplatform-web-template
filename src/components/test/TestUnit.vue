<template>
  <ods-module class="test__module">
    <header class="test__header">
      <h1 class="ods-txt-title-200">{{ $t("user.testUnit.title") }}</h1>
      <ods-button
        @click.native="toggleInfo.show = !toggleInfo.show"
        type="secondary"
        :autofocus="toggleInfo.autofocus"
        :disabled="toggleInfo.disabled"
        :loading="toggleInfo.loading"
        :icon="toggleInfo.icon"
        :icon-position="toggleInfo.iconPosition !== 'default' ? toggleInfo.iconPosition : null"
        :icon-aria-hidden="toggleInfo.iconAriaHidden"
        :icon-aria-label="toggleInfo.iconAriaLabel"
        :size="toggleInfo.size !== 'default' ? size : null"
        :nativeType="toggleInfo.nativeType"
        :full="toggleInfo.full"
        :rtl="toggleInfo.rtl"
        ref="btnToogle"
        class="toggleBtn"
      >
        <template v-if="toggleInfo.text">{{ toggleInfo.text }}</template>
      </ods-button>
    </header>
    <!-- test DATA SECTION -->
    <section class="test__data">
      <section class="test__form-container" :class="adjustInfo">
        <p>{{ info }}</p>
      </section>
      <!-- INFORMATION SECTION -->
      <Transition name="slide-fade">
        <section v-if="toggleInfo.show" class="test__info">
          <h3 class="ods-txt-title-200 ods-pb-3">
            {{ $t("user.testUnit.infoTitle") }}
          </h3>
          <p>{{ $t("user.testUnit.infoDescription") }}</p>
        </section>
      </Transition>
    </section>
  </ods-module>
</template>
<script>

import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'TestUnit',
  // COMPONENT PROPS ---
  props: {
    /* dynFilters: { type: Array, required: true },
      dashboardId: { type: String, required: true },
      location: { type: String, required: true }, */
  },
  // COMPONENT DATA ---
  data () {
    return {
      // default values
      info: 'SECTION FOR MANAGEMENT AND CARRYING OUT TESTS AGAINST THE APP.',
      // toggleInfo Btn
      toggleInfo: {
        show: true,
        text: 'Toogle Info',
        size: 'default',
        icon: 'ods-icon-info',
        iconPosition: 'left',
        iconAriaHidden: true,
        iconAriaLabel: 'icon',
        full: false,
        disabled: false,
        loading: false,
        autofocus: false,
        nativeType: 'text',
        accentBlock: false,
        rtl: false
      }
    }
  },
  // WATCH ---
  watch: {},

  // DIRECTIVES ---
  directives: {
    'click-outside': {
      bind: function (element, binding, vnode) {
        element.clickOutsideEvent = function (event) {
          // check that click was outside the el and his children
          if (!(element === event.target || element.contains(event.target))) {
            // and if it did, call method provided in attribute value
            vnode.context[binding.expression](event)
          }
        }
        document.body.addEventListener('click', element.clickOutsideEvent)
      },
      unbind: function (element) {
        document.body.removeEventListener('click', element.clickOutsideEvent)
      }
    }
  },

  // METHODS ---
  methods: {
    ...mapActions([
      // ACTIONS NEEDED FROM STOREs
    ])
  },
  computed: {
    ...mapGetters({
      // GETTERS NEEDED FROM STOREs
    }),

    // ADJUSTINFO: adjust panels between form and info
    adjustInfo () {
      return this.toggleInfo.show
        ? 'test__form-container'
        : 'test__form-container__noInfo'
    }
  },

  // MOUNTED
  mounted () {
    console.log('Dashboard Test Unit Component ---> Loaded.')
  }
}
</script>

<style lang="scss" scoped>
.test {
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
  }

  &__form-container {
    width: 70%;
    padding: $space-300;
  }

  &__form-container__noInfo {
    width: 100%;
    padding: $space-300;
  }

  &__info {
    width: 30%;
    padding: rem(24);
    background: var(--color-bg-secondary);
  }

  &__form {
    max-width: rem(550);
  }
}

::v-deep .ods-module__body {
  padding: 0;
}

::v-deep .ods-form-item {
  margin-bottom: 2rem !important;
  margin-top: 2rem !important;
}

.test__section-title {
  @include txt-title-150;
  border-bottom: $border-size-200 solid var(--color-border-soft-divisor);
  padding: $space-200;
}
.title {
  @include txt-title-300;
  margin-bottom: $space-200;
}
.toggleBtn {
  display: block;
  float: right;
  position: absolute;
  right: 42px;
  top: 42px;
}
::v-deep .ods-alert {
  margin: 12px 0px 24px 0px;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}
</style>
