<template>
  <div class="dashboard-card">
    <div
      class="dashboard-card__no-image"
      v-loading="backgroundLoading"
      v-if="!dashboardImage"
    >
      <ods-icon name="picture"></ods-icon>
    </div>
    <!--<img class="dashboard-card__image" v-else :src="dashboardImage" /> -->
    <div v-else style="overflow: hidden">
      <div class="img-dashboard" :style="setImage"></div>
    </div>
    <div class="dashboard-card__content">
      <div class="ods-flex ods-justify-between ods-items-center">
        <router-link
          class="dashboard-card__title ods-txt-title-150"
          :to="{
            name: 'Dashboard',
            params: {
              dashboardId: dashboard.identification,
              id: dashboard.id,
              edit: false,
            },
          }"
          tag="div"
          ><span>{{ dashboard.identification }}</span></router-link
        >
        <div class="dashboard-card__actions ods-flex" v-if="isEditMode">
          <ods-tooltip
            effect="light"
            :content="$t('tooltips.view')"
            placement="top"
          >
            <ods-icon
              class="card-option"
              ref="view-button"
              size="16"
              :name="'eye'"
              @click.native="openView"
              >{{ $t("view") }}</ods-icon
            >
          </ods-tooltip>
          <ods-tooltip
            effect="light"
            :content="$t('tooltips.edit')"
            placement="top"
            v-if="isOwner"
          >
            <ods-icon
              class="card-option"
              ref="edit-button"
              size="16"
              :name="'edit'"
              @click.native="openViewEditMode"
              >{{ $t("edit") }}</ods-icon
            >
          </ods-tooltip>
          <ods-tooltip
            effect="light"
            :content="
              !dashboard.fav
                ? $t('tooltips.addFavourite')
                : $t('tooltips.removeFavourites')
            "
            placement="top"
            v-if="isOwner"
          >
            <ods-icon
              class="card-option"
              :name="!dashboard.fav ? 'star_off' : 'star_on'"
              size="16"
              :color="
                !dashboard.fav ? '' : 'var(--color-data-semantic-warning)'
              "
              @click.native="
                $emit(
                  `${dashboard.fav ? 'remove' : 'add'}:fav-dashboard`,
                  dashboard.identification
                )
              "
            ></ods-icon>
          </ods-tooltip>
          <card-actions
            v-on="$listeners"
            :dashboard="dashboard"
            :type="type"
            :isOwner="isOwner"
          ></card-actions>
        </div>
      </div>
      <div class="dashboard-card__autor ods-flex ods-items-center">
        <span class="ods-txt-placeholder">{{ dashboard.user }}</span>
      </div>
      <div class="dashboard-card__date ods-flex ods-items-center">
        <span class="ods-txt-placeholder"
          >{{ $t("lastModified") }}
          {{ dashboard.modifiedAt | formatDate("DD/MM/YYYY") }}</span
        >
      </div>
      <div
        class="dashboard-card__tags ods-flex ods-flex-wrap ods-items-center ods-mt-4">
        <ods-tag
          class="ods-mr-3"
          :type="dashboard.public ? 'success' : 'danger'"
          >{{ dashboard.public ? $t("public") : $t("private") }}</ods-tag
        >
        <ods-tag
          class="ods-mr-3"
          v-if="dashboard.category && showCategories"
          type="active"
          >{{ dashboard.category }}</ods-tag
        >
        <ods-tag v-if="dashboard.subcategory && showCategories" type="active">{{
          dashboard.subcategory
        }}</ods-tag>
      </div>
    </div>
  </div>
</template>

<script>
import i18n from './lang'
import { FormatDateFilter } from '@/utils/filters'
import { getDashboardImage } from '@/services/dashboards/dashboards'
import CardActions from '@/components/admin/DashboardCardActions'
import { mapGetters } from 'vuex'

export default {
  name: 'DashboardCard',
  i18n,
  components: {
    CardActions
  },
  mixins: [FormatDateFilter],
  props: {
    dashboard: {
      type: Object,
      default: () => {},
      required: true
    },
    options: {
      type: Object,
      default: () => {},
      required: false
    },
    backgroundLoading: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      showPopover: false,
      showCategories: false,
      type: 'dashboard'
    }
  },
  computed: {
    ...mapGetters({
      getUser: 'getUser'
    }),
    dashboardImage () {
      return (
        this.dashboard.image && `data:image/png;base64, ${this.dashboard.image}`
      )
    },
    isOwner () {
      return this.dashboard.user === this.getUser.user
    },
    setImage () {
      return {
        height: '145px',
        backgroundImage: "url('" + this.dashboardImage + "')",
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        borderBottom: '1px solid #d7dadc',
        transition: 'all ease-in-out .4s'
      }
    },
    isEditMode () {
      return this.options?.editMode ? this.options?.editMode : false
    }
  },
  watch: {},
  methods: {
    async getDashboardImage (id) {
      try {
        const config = {
          params: { waittime: 2000, width: 294, height: 128, fullpage: false },
          cancelToken: this.getCancelToken()
        }
        const { data } = await getDashboardImage(id, config)
        const imageUrl = window.URL.createObjectURL(
          new Blob([data], { type: 'image/png;charset=UTF-8' })
        )
        this.dashboardImage = imageUrl
      } catch (e) {
        this.dashboardImage = ''
      }
    },
    // edit dashboard configuration
    openEdit () {
      this.$emit('open:edit', this.dashboard)
    },

    // go to dashboard in edit mode
    openViewEditMode () {
      this.$router.push({
        name: 'Dashboard',
        params: {
          dashboardId: this.dashboard.identification,
          id: this.dashboard.id,
          edit: true
        }
      })
    },

    // go to dashboard in view mode
    openView () {
      this.$router.push({
        name: 'Dashboard',
        params: {
          dashboardId: this.dashboard.identification,
          id: this.dashboard.id,
          edit: false
        }
      })
    }
  },
  mouted () {
    console.log('is Edit Mode? ', this.isEditMode)
  }
}
</script>

<style lang="scss" scoped>
@media only screen and (max-width: 900px) {
  .dashboard-card {
    margin: 0 rem(12) rem(24);
    background-color: var(--color-bg-primary);
    width: calc(50% - 24px) !important;
    min-height: rem(254);
    border: 1px solid var(--color-border-soft-divisor);
  }
}
.dashboard-card {
  margin: 0 rem(12) rem(24);
  background-color: var(--color-bg-primary);
  // min-width: rem(296);
  width: calc(25% - 24px);
  min-height: rem(254);
  border: 1px solid var(--color-border-soft-divisor);

  &:hover {
    border-color: var(--color-bg-interactive-soft);
  }
  &:hover .img-dashboard{
    transform: scale(1.25);
  }

  &__image {
    width: 100%;
    object-fit: cover;
    height: rem(128);
    border-bottom: $border-size-200 solid var(--color-border-hard-divisor);
    overflow: hidden;
    ::v-deep .ods-image {
      min-height: 100%;
      min-width: 100%;
      .image-slot {
        width: 100%;
      }
      img {
        object-position: 0% 0%;
      }
    }
  }
  &__no-image {
    width: 100%;
    height: 9.1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: $border-size-200 solid var(--color-border-hard-divisor);
  }

  &__content {
    padding: rem(10) $icon-size-200 $icon-size-200 $icon-size-200;
  }

  &__actions {
    &__duplicate {
      &#{&} {
        color: var(--color-icon-active);
      }
    }
    &__edit {
      &#{&} {
        color: var(--color-icon-active);
      }
    }
    &__delete {
      &#{&} {
        color: var(--color-bg-destructive);
      }
    }
    &:hover {
      cursor: pointer;
    }

    ::v-deep .card-actions-menu {
      min-width: 102px;
      padding: 0;
    }

    ::v-deep .ods-tooltip {
      &.ods-icon-star_on {
        transition: all 0.2s linear;
        &:hover {
          color: var(--color-data-semantic-warning);
          &:before {
            content: "≠";
          }
        }
      }
      &.ods-icon-star_off {
        &:hover {
          color: var(--color-data-semantic-warning);
          &:before {
            content: "Œ";
          }
        }
      }
    }
  }

  &__title {
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;

    &:hover {
      cursor: pointer;
    }
  }

  &__autor {
    margin-top: $space-100;
    span {
      color: var(--color-txt-secondary);
    }
  }

  &__date {
    margin-top: rem(4);
    span {
      color: var(--color-txt-secondary);
    }
  }

  &__tags {
    row-gap: rem(4);
  }
}
.card-option {
  padding: 0px 6px;
}
</style>
