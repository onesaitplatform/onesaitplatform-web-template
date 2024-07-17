<template>
  <ods-module class="admin__module">
    <header class="admin__header">
      <h1 class="ods-txt-title-200">{{ $t('title') }}</h1>
      <ods-button v-if="isEditMode" @click.native="openNewForm()" type="secondary" :icon="toggleInfo.icon" :icon-Position="toggleInfo.iconPosition !== 'default' ? toggleInfo.iconPosition : null" :size="toggleInfo.size !== 'default' ? size : null"  ref="btnToogle" class="toggleBtn" >
        <template >{{ $t('addDashboard') }}</template>
      </ods-button>
    </header>
    <!-- admin DATA SECTION -->
    <section class="admin__data">
      <section class="admin__form-container" :class="adjustInfo">
        <div v-if="!loading && dashboards.length === 0" class="dashboard-noData">
          <ods-module>
            <div>
              <div class="ods-empty-state ods-empty-state--portrait" style="width: 100%; height: 100%; background-color: transparent;">
                <div class="ods-empty-state__picto ods-empty-state__picto--portrait">
                  <i class="ods-icon-cards ods-icon-xl"></i>
                </div>
                <div class="ods-empty-state__info ods-empty-state__info--portrait">
                  <h3 class="ods-empty-state__title">Welcome to dashboards management section</h3>
                  <p class="ods-empty-state__description">{{ dashboardsDescription }}</p>
                </div>
              </div>
            </div>
          </ods-module>
        </div>
        <div v-else class="dashboard-table">
          <!-- dashboard cards -->
          <div class="dashboard-cards ods-flex ods-flex-col ods-flex-wrap ods-mt-6" v-loading="loading" loading-background="transparent">
              <transition-group class="dashboard-cards__container ods-flex ods-flex-1 ods-flex-wrap" name="slide-fade">
                  <dashboard-card v-for="item in cards" :options="options" :key="item.identification" :dashboard="item" :background-loading="backgroundLoading" @open:delete="openDeleteModal" @open:edit="openEditForm" @open:config="openEditForm" @open:duplicate="openDuplicateModal" @add:fav-dashboard="addFavDashboard" @remove:fav-dashboard="removeFavDashboard" v-on="$listeners"></dashboard-card>
              </transition-group>
              <div class="ods-flex ods-flex-col ods-items-center" v-if="list.length > cardsIndex * count">
                <ods-button class="ods-mb-4" type="neutral" @click="() => { count++; cardsIndex * count; }">{{ $t("loadMore") }}</ods-button>
              </div>
          </div>
          <!-- dashboard cards end -->
        </div>
      </section>
      <!-- FORM SECTION -->
      <Transition name="slide-fade">
        <section v-if="toggleInfo.show && isEditMode" class="admin__info">
          <h3 class="ods-txt-title-200 ods-pb-3">
            {{ dashboardFormTitle }}
          </h3>
          <p>{{ $t('infoDescription') }}</p>
          <settings ref="settings" :options="options" :dashboard="dashboardConfig" v-on="$listeners" :isNew="isNew" :edit="edit" :isValid="isValid" :buttonLoading="buttonLoading" @action:dashboard="nextStep" @action:closeSettings="closeSettings"  @validate="(validation) => validate(validation.isValid, validation.dashboard)"></settings>
        </section>
      </Transition>
    </section>
    <delete-modal v-model="deleteDataModal.show" :data="deleteDataModal.dashboard" :title="deleteDataModal.title" :loading="deleteDataModal.loading" item="dashboard" @delete:dashboard="deleteDashboard"></delete-modal>
    <duplicate-dashboard-modal v-model="duplicateModal.show" :dashboard="duplicateModal.dashboard" :title="duplicateTitle" @duplicate:dashboard="duplicateDashboard"></duplicate-dashboard-modal>
  </ods-module>
</template>

<script>
import i18n from './lang'
import {
  getDashboards,
  deleteDashboard,
  createDashboard,
  updateDashboard,
  cloneDashboard,
  getFavDashboards,
  addFavDashboard,
  removeFavDashboard
} from '@/services/dashboards/dashboards'
import DeleteModal from '@/components/shared/modals/DeleteModal'
import DuplicateDashboardModal from '@/components/admin/DuplicateDashboardModal'
import Settings from '@/components/admin/settings/Settings'
import DashboardCard from '@/components/admin/DashboardCard'
// import Settings from './settings/Settings'
export default {
  name: 'DashboardAdmin',
  i18n,
  components: {
    DashboardCard,
    DeleteModal,
    DuplicateDashboardModal,
    Settings
  },
  props: {
    options: {
      type: Object,
      default: () => {},
      required: false
    }
  },
  // COMPONENT DATA ---
  data () {
    return {
      // default values
      loading: false,
      backgroundLoading: true,
      count: 1,
      cardsIndex: 12,
      // toggleInfo Btn
      toggleInfo: {
        show: false,
        size: 'default',
        icon: 'ods-icon-plus',
        iconPosition: 'left'
      },
      list: [], // main list of dashboards
      dashboards: [], // main list of dashboards from API
      dashboardsImages: [], // main list of dashboards images from API
      dashboardFormTitle: '',
      deleteDataModal: {
        show: false,
        dashboard: {},
        title: '',
        loading: false
      },
      duplicateModal: {
        show: false,
        dashboard: {}
      },
      duplicateTitle: '',
      isNew: false,
      edit: false,
      isValid: false,
      dashboard: null,
      dashboardConfig: {
        identification: '',
        description: '',
        category: '',
        public: true
      },
      newDashboard: {},
      buttonLoading: false
    }
  },
  // WATCH ---
  watch: {
    dashboardsImages: {
      handler (newImages, oldImages) {
        if (newImages.length) this.asignDashboardsImages()
      },
      deep: true
    }
  },

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
    openNewForm () {
      console.log('open Dashboard Form in insert mode.')
      this.toggleInfo.show = !this.toggleInfo.show
      this.dashboardFormTitle = 'Create new dashboard '
      this.isNew = true
      this.edit = false
      this.dashboardConfig = {}
    },

    // método para abrir el delete-dashboard-modal
    openDeleteModal (dashboard) {
      this.deleteDataModal.show = true
      this.deleteDataModal.dashboard = dashboard
      this.deleteDataModal.title = `${dashboard.identification}`
    },

    // método para abrir el form en modo edición
    openEditForm (dashboard) {
      this.isNew = false
      this.edit = true
      this.isValid = true
      this.dashboardConfig = dashboard
      this.dashboardFormTitle = 'Edit dashboard ' + (dashboard.identification ? dashboard.identification : dashboard.id)
      if (!this.toggleInfo.show) { this.toggleInfo.show = true }
    },
    closeSettings () {
      this.isNew = true
      this.edit = false
      this.dashboardConfig = {}
      this.dashboard = null
      this.dashboardFormTitle = ''
      this.toggleInfo.show = false
    },
    // método para abrir el duplicate-dashboard-modal
    openDuplicateModal (dashboard) {
      this.duplicateModal.show = true
      this.duplicateModal.dashboard = dashboard
      this.duplicateTitle = `${dashboard.identification}`
    },

    // método para borrar el dashboard y actualizar el listado de dashboards
    async deleteDashboard (dashboard) {
      this.deleteDataModal.loading = true
      try {
        await deleteDashboard(dashboard.identification)
      } finally {
        this.deleteDataModal.show = false
        this.deleteDataModal.dashboard = {}
        this.deleteDataModal.loading = false
        this.getDashboards()
      }
    },

    // método para duplicar el dashboard
    async duplicateDashboard (identification) {
      try {
        const id = this.duplicateModal.dashboard.identification
        await cloneDashboard(id, { identification: id, newIdentification: identification })
        this.duplicateModal.show = false
        this.duplicateModal.dashboard = {}
        this.getDashboards()
      } catch (error) {
        this.duplicateModal.show = false
        this.duplicateModal.dashboard = {}
      }
    },

    async getDashboards () {
      var filter = ''
      this.loading = true
      if (this.options) {
        filter = this.options.tag ?? ''
      }
      try {
        const dashboards = await getDashboards({
          orderType: 'IDENTIFICATION_ASC',
          includeImage: false,
          filter: filter
        })
        const favs = await getFavDashboards()
        this.dashboards = dashboards.map((d) => {
          return {
            ...d,
            fav: favs.map((f) => f.favoriteId).includes(d.identification)
          }
        })
        this.changeOrder('moreRecent')
      } finally {
        this.loading = false
        this.backgroundLoading = false
        this.list = this.dashboards
        this.dashboardImages = this.dashboards
      }
    },
    async addFavDashboard (id) {
      try {
        await addFavDashboard(id)
      } finally {
        this.getDashboards(false)
      }
    },

    async getDashboardsImages () {
      var filter = ''
      if (this.options) {
        filter = this.options.tag ?? ''
      }
      try {
        if (this.dashboardsImages.length) this.asignDashboardsImages()
        else this.backgroundLoading = true

        const response = await getDashboards({
          orderType: 'IDENTIFICATION_ASC',
          includeImage: true,
          filter: filter
        })
        const dashboardImages = await response.map((dashboard) => {
          return {
            id: dashboard.id,
            image: dashboard.image
          }
        })
        this.dashboardsImages = dashboardImages
        console.log('Images: ', this.dashboardImages)
      } finally {
        this.backgroundLoading = false
      }
    },

    asignDashboardsImages () {
      this.dashboards = this.dashboards.map((dashboard) => {
        const element = this.dashboardsImages.find(
          (el) => el.id === dashboard.id
        )
        return {
          ...dashboard,
          image: element.image || ''
        }
      })
    },

    async removeFavDashboard (id) {
      try {
        await removeFavDashboard(id)
      } finally {
        this.getDashboards(false)
      }
    },
    // método en el que se realiza la ordenación
    changeOrder (order) {
      switch (order) {
        case 'moreRecent':
          this.dashboards.sort(
            (a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt)
          )
          break
        case 'favoriteFirst':
          this.dashboards.sort((a, b) => b.fav - a.fav)
          break
        case 'orderAsc':
          this.dashboards.sort((a, b) =>
            a.identification.localeCompare(b.identification)
          )
          break
        case 'orderDesc':
          this.dashboards.sort((a, b) =>
            b.identification.localeCompare(a.identification)
          )
          break
        default:
          break
      }
    },
    validate (isValid, dashboard) {
      this.isValid = isValid
      this.newDashboard = dashboard
    },
    // chequear esta funcion a ver como ajustarla al boton.
    nextStep () {
      if (!this.isValid) return
      if (this.isNew) {
        if (!this.dashboard) {
          this.createDashboard()
          console.log('CREATE DASHBOARD...')
        } else {
          // this.updateDashboard(this.dashboard)
          console.log('UPDATE DASHBOARD...')
        }
      } else {
        console.log('UPDATE DASHBOARD sin dashboard')
        this.updateDashboard(this.newDashboard.information.dashboard)
        this.saveGadgets()
      }
    },
    async createDashboard () {
      var that = this
      this.buttonLoading = true
      var config = {}

      // tag system
      var tag = ''
      if (this.options) {
        tag = this.options.tag ?? ''
        if (tag) config.tag = tag
      }
      try {
        const dashboard = await createDashboard(this.newDashboard, config)
        this.dashboard = dashboard.id
        this.dashboardConfig = dashboard
      } finally {
        this.buttonLoading = false
        that.$refs.settings.clearForm()
        this.getDashboards()
      }
    },
    async updateDashboard (id) {
      this.buttonLoading = true
      try {
        const dashboard = await updateDashboard(id, this.newDashboard)
        this.dashboard = dashboard.id
        this.dashboardConfig = dashboard
      } finally {
        this.buttonLoading = false
        this.getDashboards()
      }
    },
    saveGadgets () {
      window.DSApi.inst1.api.disableEventEdit()
      window.DSApi.inst1.api.msgApi({
        command: 'saveDashboard',
        authorization: sessionStorage.keycloakToken,
        information: { dashboard: this.dashboard }
      })
      // clear cache after saving
      window.DSApi.inst1.api.clearCache(this.dashboard)
      return true
    }
  },
  computed: {
    // edit mode from component options
    isEditMode () {
      return this.options?.editMode ? this.options?.editMode : false
    },
    // ADJUSTINFO: adjust panels between form and info
    adjustInfo () {
      return this.toggleInfo.show && this.isEditMode
        ? 'admin__form-container'
        : 'admin__form-container__noInfo'
    },
    // dashboard pagination in client for cards
    cards () {
      return this.dashboards.filter((d, i) => i < this.cardsIndex * this.count)
    },
    info () { return this.$t('title') || 'Dashboard Management' },
    dashboardsDescription () { return this.dashboards.length > 0 ? this.$t('description') : this.$('wait') }
  },
  async created () {
    await this.getDashboards()
    await this.getDashboardsImages()
  },

  // MOUNTED
  mounted () {
    console.log('Dashboard Admin Component ---> Loaded, Dashboards: ', this.dashboards)
    this.isNew = true
    this.edit = false
    this.openNewForm() // open new dashboard form by default
    this.openNewForm()
  }
}
</script>

<style lang="scss" scoped>
.admin {
  &__module {
    border: none;
  }

  &__header {
    @include txt-title-150;
    border-bottom: $border-size-200 solid var(--color-border-soft-divisor);
    padding: 1rem 1.8rem;
  }

  &__data {
    display: flex;
    height: auto;
    min-height: 400px;
    width: 100%;
  }

  &__form-container {
    width: 70%;
    height: 100%;
    padding: $space-300;
  }

  &__form-container__noInfo {
    width: 100%;
    height: 100%;
    padding: 0 1.5rem;
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
  margin-bottom: 1em !important;
  margin-top: 1Rem !important;
}

.admin__section-title {
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
  position: relative;
  right: -5px;
  top: -30px;
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

.dashboard-cards {
  &__container {
    margin: rem(-12);
  }
}
.ods-icon-xl {
  font-size: 3rem;
  margin:1rem;
}
.form-footer {
  padding-bottom: 24px;
}
</style>
