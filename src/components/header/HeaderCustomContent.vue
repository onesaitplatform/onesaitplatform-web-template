
<template>
  <div v-click-outside="close">
      <ods-button type="neutral" size="small" @click="show = !show">
        <ods-icon :name="'setting'"  :size="'18'"  :color="'#060E14'" />
      </ods-button>
        <transition name="slide">
          <aside v-show="show">
            <ods-module class="ods-dashboard">
              <h2 class="ods-dashboard__title">Alertas y Eventos</h2>
              <div class="ods-dashboard__desc">
                <p>Maquetación para alertas y eventos</p>
              </div>
              <ods-scrollbar wrap-class="wrapStyles" >
              <section class="">
                <article class="ods-dashboard__box">
                  <!-- <h4 class="ods-dashboard__box__subtitle">Estilos centralizados y gobernados por el equipo de diseño de Onesait UX</h4> -->
                  <h3 class="ods-dashboard__box__title">Creado el sistema de Eventos y Alertas</h3>
                  <p class="ods-dashboard__box__desc">Los tokens de diseño son piezas centrales y diminutas de información de la interfaz de usuario para almacenar información relacionada con el diseño, como colores, fuentes, espacios, animaciones, etc. Sus beneficios son que se pueden transformar y formatear para satisfacer las necesidades de cualquier plataforma (Android, iOS , Web, etc…). Esto añade una capa más de control a los estándares Onesait, la calidad final, y la imagen de marca para distintos productos, sin importar la tecnología en que estén construidos, facilitando la colaboración entre los equipos de producto y garantizando la coherencia de marca a través de cualquier plataforma específica.</p>
                </article>
                <article class="ods-dashboard__box">
                  <!-- <h4 class="ods-dashboard__box__subtitle">Estilos centralizados y gobernados por el equipo de diseño de Onesait UX</h4> -->
                  <h3 class="ods-dashboard__box__title">Creado el sistema de Eventos y Alertas</h3>
                  <p class="ods-dashboard__box__desc">Los tokens de diseño son piezas centrales y diminutas de información de la interfaz de usuario para almacenar información relacionada con el diseño, como colores, fuentes, espacios, animaciones, etc. Sus beneficios son que se pueden transformar y formatear para satisfacer las necesidades de cualquier plataforma (Android, iOS , Web, etc…). Esto añade una capa más de control a los estándares Onesait, la calidad final, y la imagen de marca para distintos productos, sin importar la tecnología en que estén construidos, facilitando la colaboración entre los equipos de producto y garantizando la coherencia de marca a través de cualquier plataforma específica.</p>
                </article>
                <article class="ods-dashboard__box">
                  <!-- <h4 class="ods-dashboard__box__subtitle">Estilos centralizados y gobernados por el equipo de diseño de Onesait UX</h4> -->
                  <h3 class="ods-dashboard__box__title">Creado el sistema de Eventos y Alertas</h3>
                  <p class="ods-dashboard__box__desc">Los tokens de diseño son piezas centrales y diminutas de información de la interfaz de usuario para almacenar información relacionada con el diseño, como colores, fuentes, espacios, animaciones, etc. Sus beneficios son que se pueden transformar y formatear para satisfacer las necesidades de cualquier plataforma (Android, iOS , Web, etc…). Esto añade una capa más de control a los estándares Onesait, la calidad final, y la imagen de marca para distintos productos, sin importar la tecnología en que estén construidos, facilitando la colaboración entre los equipos de producto y garantizando la coherencia de marca a través de cualquier plataforma específica.</p>
                </article>
                <article class="ods-dashboard__box">
                  <!-- <h4 class="ods-dashboard__box__subtitle">Estilos centralizados y gobernados por el equipo de diseño de Onesait UX</h4> -->
                  <h3 class="ods-dashboard__box__title">Creado el sistema de Eventos y Alertas</h3>
                  <p class="ods-dashboard__box__desc">Los tokens de diseño son piezas centrales y diminutas de información de la interfaz de usuario para almacenar información relacionada con el diseño, como colores, fuentes, espacios, animaciones, etc. Sus beneficios son que se pueden transformar y formatear para satisfacer las necesidades de cualquier plataforma (Android, iOS , Web, etc…). Esto añade una capa más de control a los estándares Onesait, la calidad final, y la imagen de marca para distintos productos, sin importar la tecnología en que estén construidos, facilitando la colaboración entre los equipos de producto y garantizando la coherencia de marca a través de cualquier plataforma específica.</p>
                </article>
                <article class="ods-dashboard__box">
                  <!-- <h4 class="ods-dashboard__box__subtitle">Estilos centralizados y gobernados por el equipo de diseño de Onesait UX</h4> -->
                  <h3 class="ods-dashboard__box__title">Creado el sistema de Eventos y Alertas</h3>
                  <p class="ods-dashboard__box__desc">Los tokens de diseño son piezas centrales y diminutas de información de la interfaz de usuario para almacenar información relacionada con el diseño, como colores, fuentes, espacios, animaciones, etc. Sus beneficios son que se pueden transformar y formatear para satisfacer las necesidades de cualquier plataforma (Android, iOS , Web, etc…). Esto añade una capa más de control a los estándares Onesait, la calidad final, y la imagen de marca para distintos productos, sin importar la tecnología en que estén construidos, facilitando la colaboración entre los equipos de producto y garantizando la coherencia de marca a través de cualquier plataforma específica.</p>
                </article>
                <article class="ods-dashboard__box">
                  <!-- <h4 class="ods-dashboard__box__subtitle">Estilos centralizados y gobernados por el equipo de diseño de Onesait UX</h4> -->
                  <h3 class="ods-dashboard__box__title">Creado el sistema de Eventos y Alertas</h3>
                  <p class="ods-dashboard__box__desc">Los tokens de diseño son piezas centrales y diminutas de información de la interfaz de usuario para almacenar información relacionada con el diseño, como colores, fuentes, espacios, animaciones, etc. Sus beneficios son que se pueden transformar y formatear para satisfacer las necesidades de cualquier plataforma (Android, iOS , Web, etc…). Esto añade una capa más de control a los estándares Onesait, la calidad final, y la imagen de marca para distintos productos, sin importar la tecnología en que estén construidos, facilitando la colaboración entre los equipos de producto y garantizando la coherencia de marca a través de cualquier plataforma específica.</p>
                </article>
              </section>
            </ods-scrollbar>
            </ods-module>
          </aside>
        </transition>
  </div>
</template>

<script>
export default {
  name: 'HeaderCustomContent',
  data () {
    return {
      show: false
    }
  },
  methods: {
    close () {
      this.show = false
      this.isOutside = true
    }
  },
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
  }
}
</script>

<style lang="scss">
.wrapStyles {
  height: calc(100vh - 250px);
  z-index: 9999999;
}
</style>

<style lang="scss" scoped>

.slide-enter-active {transition: all .3s cubic-bezier(0.215, 0.61, 0.355, 1) }
.slide-leave-active {transition: all .1s ease }
.slide-enter, .slide-leave-active {transform: translateX(100%) }
aside {width: 600px;height: 100vh;background-color: white;position: fixed;top: 111px; padding: 12px; right: 0; z-index: 99999999!important; border: 1px solid var(--color-border-hard-divisor); }
/*
  Dashboard base & description
 */

 .ods-dashboard {
  padding: $space-300 $space-100 $space-100 $space-100;

  &__title {
    @include txt-title-400;
    margin-bottom: $space-200;
  }

  &__desc {
    padding-bottom: $space-400;
    @include txt-body-400;

    @include mediaSm {
      display: flex;
    }

    &__actions {
      padding-top: $space-200;

      @include mediaSm {
        text-align: right;
        padding: 0 0 0 $space-300;

        .ods-dashboard__docu-btn {
          margin-bottom: $space-200;
        }
      }
    }
  }
}

.ods-dashboard{

  /*
  Dashboard grid
 */

  &__grid {
    @include mediaSm {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: $space-050;
    }
  }

  /*
  Dashboard box
 */

  &__box {
    background-color: var(--color-bg-secondary);
    padding: $space-200 $space-300;
    margin-bottom: $space-100;

    @include mediaSm {
      margin-bottom: 0;
    }

    &--large {
      grid-column: 1 / span 2;
    }

    &__title {
      position: relative;
      @include txt-title-200;
      padding-bottom: $space-300;

      &::after {
        content: '';
        position: absolute;
        bottom: rem(12);
        left: 0;
        width: rem(72);
        height: rem(4);
        background-color: var(--color-bg-hover);
      }
    }

    &__subtitle {
      @include txt-subtitle-100;
      padding-bottom: $space-100;
    }

    &__desc {
      @include txt-body-400;
    }

    &__image {
      max-width: 100%;
      margin-top: $space-300;
    }
  }
}

/*
  Dashboard news
 */

.ods-dashboard__news {
  padding-top: $space-200;

  @include mediaSm {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $space-400;
  }

  &__box {
    --border-color: var(--color-data-categorical-green);

    display: flex;
    border-left: $border-size-400 solid var(--border-color);
    padding-left: $space-200;
    margin-bottom: $space-300;

    @include mediaSm {
      margin-bottom: 0;
    }

    &--opt {
      --border-color: var(--color-data-categorical-yellow);
    }

    &--comp {
      --border-color: var(--color-data-categorical-garnet);
    }

    &--typo {
      --border-color: var(--color-data-categorical-magenta);
    }
  }

  &__title {
    @include txt-title-150;
    padding-bottom: $space-100;
  }

  &__desc {
    @include txt-body-400
  }

  &__image-wrap {
    flex-basis: rem(200);
    text-align: center;
    padding-left: $space-200;
  }
}

</style>
