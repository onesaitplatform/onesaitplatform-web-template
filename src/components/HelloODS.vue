<template>
  <ods-module class="ods-dashboard">
    <h2 class="ods-dashboard__title">Welcome to the Application</h2>
  </ods-module>
</template>

<script>
export default {
  name: 'HelloODS',
  methods: {
    goToDoc () {
      window.open(
        'https://mind.indra.es/pages/viewpage.action?pageId=447432543',
        '_blank'
      )
    },

    goToStorybook () {
      window.open(
        'https://lab.onesaitplatform.com/web/ods-storybook-v3/',
        '_blank'
      )
    }
  }
}
</script>

<style lang="scss" scoped>
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
  &__grid {
    display: grid;
    grid-template-rows: 1fr;
    grid-template-columns: 30% 1fr;
    grid-column-gap: 20px;
    grid-row-gap: 20px;
    justify-items: stretch;
    align-items: stretch;
    height: auto;
    width: 100%;
    padding: 12px;
  }
  &__grid-item {
    font-size: rem(1);

    &__desc {
      margin: 1.5rem 1rem;
      font-size: 0.75rem;
      font-weight: 400;
      font-style: normal;
      line-height: 1.25rem;
    }
  }
}

.ods-dashboard {
  /*
  Dashboard grid
 */

  &__grid {
    @include mediaSm {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: $space-050;
    }
  }

  /*
  Dashboard box
 */

  &__box {
    background-color: var(--color-bg-secondary);
    padding: $space-200 $space-500;
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
        content: "";
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
    @include txt-body-400;
  }

  &__image-wrap {
    flex-basis: rem(200);
    text-align: center;
    padding-left: $space-200;
  }
}
</style>
