<template>
  <ods-module class="users__module">
    <header class="users__header">
      <h1 class="ods-txt-title-200">{{ $t("title") }}</h1>
      <ods-button  @click.native="toggleInfo.show = !toggleInfo.show" type="secondary" :autofocus="toggleInfo.autofocus" :disabled="toggleInfo.disabled" :loading="toggleInfo.loading" :icon="toggleInfo.icon" :icon-position="toggleInfo.iconPosition !== 'default' ? toggleInfo.iconPosition : null" :size="toggleInfo.size !== 'default' ? size : null"  ref="btnToogle" class="toggleBtn" >
        <template v-if="toggleInfo.text">{{ toggleInfo.text }}</template>
      </ods-button>
    </header>
    <!-- users DATA SECTION -->
    <section class="users__data">
      <section class="users__form-container" :class="adjustInfo"  v-loading="loading" loading-background="transparent">
        <!-- USERS TABLE LAYOUT BEGIN -->
        <!-- active: true creationDate: "2023-07-26T10:05:42.000+00:00" extraFields: "" fullName: "Keaton Chia" mail: "kwchia@ucsd.edu" role: "Admin" username: "kwchia" -->
        <table-layout class="users-table ods-mt-6" pagination="client" :data="list" :page.sync="page" :pageSize.sync="pageSize" :minimumPageSize="10" :totalElements="totalElements" :fullHeight="false">
          <template v-slot:default="users">
            <ods-table :data="users.paginatedData">
              <ods-table-column :label="$t('table.name')" prop="username"></ods-table-column>
              <ods-table-column :label="$t('table.autor')" prop="fullName" :show-overflow-tooltip="true" width="225px">
                <template v-slot:default="{ row: user }"><span>{{ user.fullName | truncate(50,'...') }}</span></template>
              </ods-table-column>
              <!-- <ods-table-column class="state" :label="$t('table.state')" prop="active">
                <template v-slot:default="{ row: user }">
                  <ods-badge :type="user.active ? 'success' : 'error'" is-dot="is-dot"></ods-badge><span class="ods-ml-2" :class="user.active ? 'txt-public' : 'txt-private'">{{ user.active ? $t("table.activate") : $t("table.deactivate") }}</span>
                </template>
              </ods-table-column> -->
              <ods-table-column :label="$t('table.category')" prop="role">
                <template v-slot:default="{ row: user }">
                  <div class="ods-flex ods-justify-between ods-flex-wrap categories">
                    <ods-tag class="ods-mr-1" v-if="user.role" type="active">{{ user.role }}</ods-tag>
                  </div>
                </template>
              </ods-table-column>
              <ods-table-column :label="$t('table.email')" prop="mail" :show-overflow-tooltip="true"></ods-table-column>
              <ods-table-column :label="$t('table.created')" prop="creationDate">
                <template v-slot:default="{ row: user }"><span>{{ user.creationDate | formatDate("DD/MM/YYYY") }}</span></template>
              </ods-table-column>
              <!--<ods-table-column :label="$t('table.actions')" prop="" width="100">
                <template v-slot:default="{ row: user }">
                  <div class="users-table-actions ods-flex ods-ods-justify-between ods-justify-center">
                    <ods-tooltip effect="light" :content="$t('tooltips.delete')" placement="top">
                      <ods-button class="users-table-actions__delete" ref="deleteButton" type="neutral" icon="ods-icon-delete" size="small" :full="true" @click="openDelete(user)"></ods-button>
                    </ods-tooltip>
                    <ods-tooltip effect="light" :content="$t('tooltips.detail')" placement="top">
                      <ods-button class="users-table-actions__detail" ref="goToButton" type="neutral" icon="ods-icon-edit" size="small" :full="true" @click="goToUserUpdate(user)"></ods-button>
                    </ods-tooltip>
                  </div>
                </template>
              </ods-table-column> -->
            </ods-table>
          </template>
        </table-layout>
        <!-- USERS TABLE LAYOUT END -->
      </section>
      <!-- INFORMATION SECTION -->
      <Transition name="slide-fade">
        <section v-if="toggleInfo.show" class="users__info">
          <h3 class="ods-txt-title-200 ods-pb-3">
            {{ $t("infoTitle") }}
          </h3>
          <p>{{ $t("infoDescription") }}</p>
        </section>
      </Transition>
    </section>
  </ods-module>
</template>
<script>

import { mapActions, mapGetters } from 'vuex'
import TableLayout from '@/components/shared/TableLayout'
import TableLayoutCommons from '@/mixins/TableLayoutCommons'
import { FormatDateFilter } from '@/utils/filters'
import { getUsers } from '@/services/users/users'
import i18n from './lang'
export default {
  name: 'Users',
  i18n,
  components: {
    TableLayout
  },
  mixins: [TableLayoutCommons, FormatDateFilter],

  // COMPONENT DATA ---
  data () {
    return {
      list: [],
      loading: false,
      // parámetros para tabla
      page: 1,
      pageSize: 10,
      totalElements: 0,

      // toggleInfo Btn
      toggleInfo: {
        show: false,
        text: 'Toogle Info',
        size: 'default',
        icon: 'ods-icon-info',
        iconPosition: 'left',
        iconAriaHidden: true,
        iconAriaLabel: 'an Icon',
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

  // METHODS ---
  methods: {
    ...mapActions([
      // ACTIONS NEEDED FROM STOREs
    ]),
    async getAppUsers () {
      this.loading = true
      try {
        var users = await getUsers({})
      } finally {
        this.loading = false
        this.backgroundLoading = false
        this.list = users
      }
    }
  },
  computed: {
    ...mapGetters({
      // GETTERS NEEDED FROM STOREs
    }),

    // ADJUSTINFO: adjust panels between form and info
    adjustInfo () {
      return this.toggleInfo.show
        ? 'users__form-container'
        : 'users__form-container__noInfo'
    }
  },
  // CREATED
  async created () {
    await this.getAppUsers()
  },

  // MOUNTED
  mounted () {
    console.log('Dashboard Users Unit Component ---> Loaded.')
  }
}
</script>

<style lang="scss" scoped>

::v-deep td:not(:has(button)) {
    padding-top: 0rem!important;
}
.users {
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
    height: 100%;
    min-height: 100%;
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

.users-table {
  .categories {
    row-gap: rem(4);
  }

  .fav {
    &.ods-tooltip {
      cursor: pointer;
      &.ods-icon-star_on {
        transition: all 0.2s linear;
        &:hover {
          color: var(--color-data-semantic-warning);
          &:before {
            content: '≠';
          }
        }
      }
      &.ods-icon-star_off {
        &:hover {
          color: var(--color-data-semantic-warning);
          &:before {
            content: 'Œ';
          }
        }
      }
    }
  }

  .txt-public {
    color: var(--color-status-success-400);
  }
  .txt-private {
    color: var(--color-status-error-400);
  }
}

.users-table-actions {
  &__duplicate &__detail {
    &#{&} {
      color: var(-color-icon-interactive);
    }
    &:hover {
      cursor: pointer;
    }
  }
  &__delete {
    &#{&} {
      color: var(--color-status-error-400);
    }
    &:hover {
      cursor: pointer;
    }
  }
}

::v-deep .ods-module__body {
  padding: 0;
}

::v-deep .ods-form-item {
  margin-bottom: 2rem !important;
  margin-top: 2rem !important;
}

.users__section-title {
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
