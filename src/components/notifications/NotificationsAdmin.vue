<template>
  <div class="notificationsManagement">
    <div class="notify-menu">
      <ods-accordion v-model="active" :accordion="false">
        <!-- TYPES-->
          <ods-accordion-item :name="1" :title="title" :key="0">
            <template slot="title"><ods-icon name="notification" size="16" class="ods-mr-3" /> <span class="family">{{ title }}</span></template>
            <ods-table ref="typesTable" v-loading="typeLoading" :data="types" :height="types.length === 0 ? 60 : 30 * types.length" :maxHeight="'100%'"  :size="size" :fit="true" :showHeader="false" :highlight-current-row="true" :emptyText="emptyTypes" style="width: 100%; height: 100%; min-height:max-content;" @row-click="filterNotificationType">
              <ods-table-column prop="name" label="Type" :align="'left'" :class-name="'td-filter'"></ods-table-column>
              <ods-table-column prop="count" Label="Count" :align="'right'" :class-name="'td-filter'" width="55">
                <template slot-scope="scope">
                  <span style="font-family: 'soho-light';">({{ scope.row.count }})</span>
                </template>
              </ods-table-column>
            </ods-table>
          </ods-accordion-item>

          <div class="ods-divider ods-divider--horizontal" style="margin: 1.5rem 0;  width:95%"><div class="ods-divider__text is-center" style="background-color: white;"></div></div>

          <!-- LABELS -->
          <ods-accordion-item :name="2" :title="label" :key="1">
            <template slot="title"><ods-icon name="offer" size="16" class="ods-mr-3" /> <span class="family">{{ label }}</span></template>
            <ods-table ref="labelsTable" :overflow="false" v-loading="labelLoading" :data="labels"  :height="labels.length === 0 ? 60 :30 * labels.length"  :size="size" :fit="true" :showHeader="false" :highlight-current-row="true" :emptyText="emptyLabels" style="width: 100%" @row-click="filterNotificationLabel">
              <ods-table-column prop="name" label="Label" :align="'left'" :class-name="'td-filter'"></ods-table-column>
              <ods-table-column prop="color" Label="Color" :align="'right'" :class-name="'td-filter'" width="50">
                <template slot-scope="scope">
                  <div data-name="OdsBadge" class="ods-badge is-dot"><span class="ods-badge__content ods-badge__content--custom" :style="labelColor(scope.row.color)"></span></div>
                </template>
              </ods-table-column>
            </ods-table>
          </ods-accordion-item>

          <div class="ods-divider ods-divider--horizontal" style="margin: 1.5rem 0;  width:95%"><div class="ods-divider__text is-center" style="background-color: white;"></div></div>

          <!-- STATUS -->
          <ods-accordion-item :name="3" :title="statusTitle" :key="2">
            <template slot="title"><ods-icon name="tag" size="16" class="ods-mr-3" /> <span class="family">{{ statusTitle }}</span></template>
            <ods-table ref="statusTable" :overflow="false" v-loading="statusLoading" :data="status"  :height="status.length === 0 ? 60 : 30 * status.length"  :size="size" :fit="true" :showHeader="false"  :highlight-current-row="true" :emptyText="emptyStatus" style="width: 100%" @row-click="filterNotificationStatus">
              <ods-table-column prop="name" label="Label" :align="'left'" :class-name="'td-filter'"></ods-table-column>
              <ods-table-column prop="count" Label="Count" :align="'right'" :class-name="'td-filter'">
                <template slot-scope="scope">
                  <span style="font-family: 'soho-light';">({{ scope.row.count }})</span>
                </template>
              </ods-table-column>
            </ods-table>
          </ods-accordion-item>
        </ods-accordion>
    </div>
  <div class="notify-content">
    <splitpanes class="default-theme" :push-other-panes="false">
      <pane ref="list" min-size="35"  max-size="50" v-if="toggleList">
        <div class="notity-content-list notification-grid" v-loading="loading">
          <ods-tabs v-model="activeTab" @tab-click="handleClick">
            <ods-tab-pane label="Unread" name="unreadTab">
              <span class="family" slot="label">
                <ods-icon :name="'pushpin'"/> {{ $t('unread') }}
              </span>
            </ods-tab-pane>
            <ods-tab-pane  label="All" name="allTab">
              <span class="family" slot="label">
                <ods-icon :name="'reception'"/> {{ $t('all') }}
              </span>
            </ods-tab-pane>
            <div class="notification-new">
              <ods-tooltip  :content="$t('newToolTip')" :placement="'right'">
                <ods-button @click="openNewNotification()" class="ods-ml-2"  type="primary" :icon="'ods-icon-plus'" :icon-position="'left'" :size="'small'" ref="buttonNew"> {{ $t('newBtn') }}</ods-button>
              </ods-tooltip>
              <ods-tooltip  :content="$t('reloadTooltip')" :placement="'left'">
                <ods-button @click="initNotifications()" class="ods-ml-2"  type="primary" :icon="'ods-icon-reload'" :icon-position="'left'" :size="'small'" ref="buttonReload"> {{ $t('reloadBtn') }}</ods-button>
              </ods-tooltip>
            </div>
          </ods-tabs>
          <ods-scrollbar  wrap-class="wrap-styles" :tag="tag" :wrapStyle="wrapStyle" :viewStyle="viewStyle">
            <!-- NOTIFICATIONS -->
            <div class="load-more" v-if="notificationList.length > 0">
              <span class="family ods-txt-body-400"> {{ moreShowing }}</span>
              <ods-tooltip v-if="moreToShow && !loading" :content="$t('loadMoreBtn')" :placement="'top'">
                <ods-button  @click="loadMore()" class="ods-ml-2" :icon="loading ? 'ods-icon-loading' : 'ods-icon-more'" :icon-Position="'default'" type="primary"  ref="buttonLoadMore"> </ods-button>
              </ods-tooltip>
            </div>
            <notification-cards v-for="(notification, index) in notificationList" :key="index" :index="index" :notification="notification" :labels="labels" @action:selection="selectNotification"></notification-cards>
            <div v-if="!showNotifications && !loading" data-name="OdsModule" class="ods-module">
            <div class="ods-module__body">
              <div dir="" class="ods-empty-state ods-empty-state--landscape" style="width: 100%; height: 100%; background-color: transparent;">
                <div class="ods-empty-state__picto ods-empty-state__picto--landscape">
                  <ods-icon :name="'notification-off'" :size="'60'" :color="'rgba(67,71,71,1)'" />
                </div>
                <div class="ods-empty-state__info ods-empty-state__info--landscape">
                  <h3 class="ods-empty-state__title">{{ $t('wellcome') }} {{ usuario }}</h3>
                  <p class="ods-empty-state__description"> {{ $t('emptyNotifications') }} </p>
                </div>
              </div>
            </div>
          </div>
          </ods-scrollbar>
        </div>
      </pane>
      <pane ref="notification" min-size="50" size="65" max-size="65" v-if="toggleMessage">
        <div class="notity-content-item" v-loading="notificationLoading">
          <!-- NOTIFICATION VIEW -->
          <notification-message v-if="!isNewNotification" :notification="selectedNotification" :options="options" :labels="labels" @action:deleting="deletedNotification" @action:closing="closedNotification" @action:updated="refreshNotification" @action:loaded="loadedNotification"></notification-message>
          <div v-else>No data</div>
          <!-- <notification-form v-if="isNewNotification"></notification-form> -->
        </div>
      </pane>
    </splitpanes>
  </div>
  <!-- new Notification -->
  <ods-dialog  :title="$t('newToolTip')" :visible.sync="newDialogVisible" :width="'500px'"  :append-to-body="true" :modal="true"  :modal-append-to-body="true"  :lock-scroll="true" :close-on-click-modal="true"  :close-on-press-escape="true"  :show-close="true">
    <span>{{ $t('newNotificationDesc') }}</span>
        <div class="settings-form">
        <ods-form :model="newNotification" ref="NotificationForm" class="ods-form-dashboard">
          <ods-form-item prop="subject" :label="$t('subject')" class="family" :rules="[{required: true, message: $t('subjectReq') },{ min: 5, max: 100, message: $t('subjectMinChars'), trigger: 'blur' }]">
            <ods-input v-model="newNotification.subject"  :size="'deci'" :placeholder="'subject'"  :readonly="false" style="width: 100%"/>
          </ods-form-item>
          <ods-form-item :label="$t('type')" prop="type" :rules="[{ required: true, message: $t('typeReq') }]">
            <ods-select v-model="newNotification.type" :size="'default'" :multiple="false" style="width: 100%">
              <ods-option v-for="type, index in typesSelector" :key="index" :label="type.name" :value="type.id"></ods-option>
            </ods-select>
          </ods-form-item>
          <ods-form-item  :label="$t('text')" prop="text" :rules="[{ required: true, message: $t('textReq') }, { min: 3, max: 100, message: $t('textMinChars'), trigger: 'blur' }]">
            <ods-input v-model="newNotification.text" type="textarea" class="family" :size="'default'" style="width: 100%" :placeholder="$t('newNotification')" :detail="remainingChars" :rows="5" :resize="'vertical'"  :maxlength="limitChars" :minlength="2"></ods-input>
          </ods-form-item>
        </ods-form>
      </div>
    <div slot="footer" class="dialog-footer">
      <ods-button type="neutral" @click="newDialogVisible = false">{{$t('closeBtn')}}</ods-button>
      <ods-button @click="newDialogVisible = false; createNewNotification()">{{$t('newBtn')}}</ods-button>
    </div>
  </ods-dialog>
</div>
</template>

<script>
import i18n from './lang'
import { count, countAll, list, listAll, listAllUnread, types, newTypes, status, labels, createNotification } from '@/services/notifications/notifications'
import { Splitpanes, Pane } from 'splitpanes'
import NotificationCards from './NotificationCards.vue'
import NotificationMessage from './NotificationMessage.vue'
import 'splitpanes/dist/splitpanes.css'

export default {
  name: 'NotificationsAdmin',
  i18n,
  components: {
    Splitpanes,
    Pane,
    NotificationCards,
    NotificationMessage
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
      loading: true,
      labelLoading: true,
      typeLoading: true,
      notificationLoading: false,
      statusLoading: true,
      active: [1, 2, 3],
      size: 'medium',
      count: 0, // counter for load more...
      list: [], // main list of notifications
      types: [], // notification types
      status: [], // notification status
      labels: [], // notifications labels
      messages: [], // messages of each notification
      selectedNotification: null,
      updatedNotification: null,
      selectedType: null,
      selectedLabel: null,
      selectedStatus: null,
      toggleList: true,
      usuario: sessionStorage.getItem('username'),
      activeTab: 'allTab',
      page: 0,
      // scroll conf.
      tag: 'div',
      wrapStyle: { height: 'calc(98vh - 100px)', padding: '0px' },
      viewStyle: { padding: '18px' },
      // new notification
      isNewNotification: false,
      newDialogVisible: false,
      newNotification: {
        text: '',
        type: '',
        subject: ''
      },
      typesSelector: [],
      createLoading: false,
      isLocaleChanged: false
    }
  },
  // WATCH ---
  watch: {
    '$i18n.locale': {
      async handler (val) {
        // reload Notifications in order to show in the new language.
        this.$moment.locale(val)
        window.moment.locale(val)
        this.initNotifications()
      },
      immediate: true
    }
  },

  // METHODS ---
  methods: {
    // types selection for notification filter
    filterNotificationType (row) {
      this.selectedType = this.selectedType === row.id ? null : row.id
      if (!this.selectedType) {
        this.$refs.typesTable.setCurrentRow()
      }
      this.page = 0 // init page when select a filter
      this.list = this.filterNotifications(this.limit, this.offset, this.selectedType, this.selectedStatus, this.selectedLabel)
    },

    // label selection for notification filter
    filterNotificationLabel (row) {
      this.selectedLabel = this.selectedLabel === row.name ? null : row.name
      if (!this.selectedLabel) {
        this.$refs.labelsTable.setCurrentRow()
      }
      this.page = 0 // init page when select a filter
      this.list = this.filterNotifications(this.limit, this.offset, this.selectedType, this.selectedStatus, this.selectedLabel)
    },

    // Status selection for notification filter
    filterNotificationStatus (row) {
      this.selectedStatus = this.selectedStatus === row.id ? null : row.id
      if (!this.selectedStatus) {
        this.$refs.statusTable.setCurrentRow()
      }
      this.page = 0 // init page when select a filter
      this.list = this.filterNotifications(this.limit, this.offset, this.selectedType, this.selectedStatus, this.selectedLabel)
    },

    // filter notifications by type, label and status, and (unread or all)
    async filterNotifications () {
      var page = []
      var that = this
      this.selectedNotification = null
      try {
        if (that.activeTab === 'unreadTab' && that.selectedStatus !== 'CLOSED') {
          this.count = await this.totalNotificationsUnread()
          page = await that.getAllNotificationsUnreadList(that.limit, that.offset, that.selectedType, that.selectedStatus, that.selectedLabel)
          that.list = that.list.length > 0 ? [...that.list, ...page] : page
        } else {
          if (that.selectedStatus === 'CLOSED') { setTimeout(() => { that.activeTab = 'allTab' }, 10) }
          this.count = await this.totalNotifications()
          page = await that.getAllNotificationsList(that.limit, that.offset, that.selectedType, that.selectedStatus, that.selectedLabel)
          that.list = that.list.length > 0 ? [...that.list, ...page] : page
        }
      } catch (error) {
        console.log('Error fetching filter notifications:', error)
      } finally {
        console.log('filterNotifications finished')
      }
    },
    selectNotification (notification) {
      if (this.selectedNotification === null) {
        this.selectedNotification = notification
      } else {
        this.selectedNotification = (this.selectedNotification?.id !== notification.id) ? notification : null
      }
      // remove previous selected css class
      document.body.querySelectorAll('.notification-card').forEach(i => i.classList.remove('notification-selected'))
      if (this.selectedNotification !== null) {
        // select new one
        if (document.getElementById(this.selectedNotification.id)) {
          document.getElementById(this.selectedNotification.id).className += ' notification-selected'
        }
      }
    },

    // open new notification form
    openNewNotification () {
      this.newNotification.text = ''
      this.newNotification.type = ''
      this.newNotification.subject = ''
      this.newDialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.NotificationForm) { this.$refs.NotificationForm.resetFields() }
      })
    },
    // New notification hides notification message and show notificationForm
    async createNewNotification () {
      // get new notification
      console.log('new notification: ', this.newNotification)

      var EndPoint = this.options?.API?.create || ''
      var body = { text: this.newNotification.text, type: this.newNotification.type, subject: this.newNotification.subject }

      if (body.text === '' || body.type === '') {
        // notify
        this.$notify({
          title: this.$t('notificationMessage'),
          message: this.$t('newNotificationFormValidation'),
          type: 'warning'
        })
        return false
      }

      this.createLoading = true
      if (EndPoint && body) {
        try {
          const newNotification = await createNotification(EndPoint, body)
          return newNotification
        } catch (error) {
          console.log('Error Creating notification:', error)
        } finally {
          console.log('createNewNotification finished')
          this.createLoading = false
          this.initNotifications()
          // this.messageText = ''
          // end state, load notification again.
        }
      }
    },
    // refresh Notification after action or proccess , reload notifications and select the notification that was changed
    async refreshNotification (notification) {
      this.updatedNotification = notification
      this.list.find(el => el.id === notification.id).labels = notification.labels
      this.selectedNotification = this.updatedNotification
      this.notificationLoading = false
    },

    // loading state for notification method
    loadedNotification (notification) {
      console.log('notification loading...')
      this.notificationLoading = true
    },
    // when a notification is deleted, then reload the notification list and menu counters.
    async deletedNotification (notification) {
      // this.list = []
      // deleting from notification list
      this.list.splice(this.list.findIndex(x => x.id === notification.id), 1)
      this.count--
      this.loading = true
      try {
        this.types = await this.getNotificationTypes() || []
        this.labels = await this.getNotificationLabels() || []
        this.status = await this.getNotificationStatus() || []
        // this.list = this.activeTab === 'unreadTab' ? await this.getAllNotificationsUnreadList() : await this.getAllNotificationsList()
      } catch (error) {
        console.log('updating after remove notification:', error)
      } finally {
        console.log('refresh after delete notification.')
        // remove previous selected css class if able
        document.body.querySelectorAll('.notification-card').forEach(i => i.classList.remove('notification-selected'))
        this.selectedNotification = null
        this.notificationLoading = false
        this.loading = false
      }
    },

    // when a notification is closed, then reload the notification status counter
    async closedNotification (notification) {
      try {
        this.status = await this.getNotificationStatus() || []
        var updatedNotification = document.getElementById(notification.id)
        if (updatedNotification) {
          updatedNotification.className = updatedNotification.className + ' updated'
          var status = updatedNotification.querySelector('.status-' + notification.id)
          if (status) {
            status.innerText = this.$t('closedState')
          }
        }
      } catch (error) {
        console.log('Error getting notification status:', error)
      } finally {
        console.log('closedNotification finished')
        setTimeout(() => { document.querySelector('.notification-card.updated').classList.remove('updated') }, 2500)
        notification.status = 'Closed'
        this.selectNotification = null
        this.refreshNotification(notification)
        this.notificationLoading = false
      }
    },

    async handleClick (tab, event) {
      this.page = 0
      this.list = []
      this.filterNotifications()
    },
    labelColor (color) {
      if (!color) {
        return { 'background-color': 'ghostgray' }
      } else {
        return { 'background-color': color }
      }
    },
    // retry total unread notificacions (count)
    async totalNotificationsUnread () {
      const countEndPoint = this.options.API.count || ''
      const locale = this.$i18n.locale || 'en'
      var queryString = ''

      // query params
      queryString += this.selectedStatus ? '&status=' + this.selectedStatus : ''
      queryString += this.selectedType ? '&type=' + this.selectedType : ''
      queryString += this.selectedLabel ? '&label=' + this.selectedLabel : ''

      if (countEndPoint) {
        try {
          const totalUnread = await count(`${countEndPoint}?i18n=${locale}${queryString}`)
          return totalUnread
        } catch (error) {
          console.log('Error fetching notifications unread data:', error)
        } finally {
          console.log('totalNotificationsUnread finished')
        }
      }
    },

    // retry total notificacions (count)
    async totalNotifications () {
      const countEndPoint = this.options.API.countAll || ''
      const locale = this.$i18n.locale || 'en'
      var queryString = ''

      // query params
      queryString += this.selectedStatus ? '&status=' + this.selectedStatus : ''
      queryString += this.selectedType ? '&type=' + this.selectedType : ''
      queryString += this.selectedLabel ? '&label=' + this.selectedLabel : ''
      if (countEndPoint) {
        try {
          const total = await countAll(`${countEndPoint}?i18n=${locale}${queryString}`)
          return total
        } catch (error) {
          console.log('Error fetching notifications count (all):', error)
        } finally {
          console.log('totalNotifications finished')
        }
      }
    },

    // retry list of notifications (list)
    async getNotificationsList () {
      const listEndPoint = this.options.API.list || ''
      const locale = this.$i18n.locale || 'en'
      const limit = this.options.limit || 10
      if (listEndPoint) {
        try {
          const notifications = await list(`${listEndPoint}?limit=${limit}&i18n=${locale}`)
          return notifications
        } catch (error) {
          console.log('Error fetching notifications list data:', error)
        } finally {
          console.log('getNotificationsList finished')
          this.loading = false
        }
      }
    },

    // retry list of All notifications (list) with filter parameters (optional)
    async getAllNotificationsList (limit, offset, type = null, status = null, label = null) {
      const listAllEndPoint = this.options.API.all || ''
      const locale = this.$i18n.locale || 'en'
      var queryString = ''
      // conf.
      limit = limit || this.options.limit || 10
      offset = offset || this.offset || 0
      if (this.count > 0) {
        limit = (this.count - (limit * this.page) < limit) ? this.count - (limit * this.page) : limit
      }

      // query params
      queryString += status ? '&status=' + status : ''
      queryString += type ? '&type=' + type : ''
      queryString += label ? '&label=' + label : ''

      if (listAllEndPoint) {
        try {
          const notifications = await listAll(`${listAllEndPoint}?limit=${limit}&offset=${offset}&i18n=${locale}${queryString}`)
          return notifications
        } catch (error) {
          console.log('Error fetching all notifications list data:', error)
        } finally {
          console.log('getAllNotificationsList finished')
          this.loading = false
          this.selectedNotification = null // once we search, notification selected is null
        }
      }
    },

    // retry list of All notifications (list) with filter parameters (optional)
    async getAllNotificationsUnreadList (limit, offset, type = null, status = null, label = null) {
      const EndPoint = this.options.API.unread || ''
      const locale = this.$i18n.locale || 'en'
      var queryString = ''

      // conf.
      limit = limit || this.options.limit || 10
      offset = offset || this.offset || 0
      if (this.count > 0) {
        limit = (this.count - (limit * this.page) < limit) ? this.count - (limit * this.page) : limit
      }
      // query params
      queryString += status ? '&status=' + status : ''
      queryString += type ? '&type=' + type : ''
      queryString += label ? '&label=' + label : ''

      if (EndPoint) {
        try {
          const notifications = await listAllUnread(`${EndPoint}?limit=${limit}&offset=${offset}&i18n=${locale}${queryString}`)
          return notifications
        } catch (error) {
          console.log('Error fetching all notifications ureaded list data:', error)
        } finally {
          console.log('getAllNotificationsUnreadList finished')
          this.loading = false
          this.selectedNotification = null // once we search, notification selected is null
        }
      }
    },

    // retry list of notification types
    async getNotificationTypes () {
      const typesEndPoint = this.options.API.types || ''
      const locale = this.$i18n.locale || 'en'
      if (typesEndPoint) {
        try {
          const typesList = await types(typesEndPoint + '?i18n=' + locale)
          return typesList
        } catch (error) {
          console.log('Error fetching notifications types data:', error)
        } finally {
          console.log('getNotificationTypes finished')
          this.typeLoading = false
        }
      }
    },

    // retry list of notification types for creation
    async getNewNotificationTypes () {
      const typesEndPoint = this.options.API.newtypes || ''
      const locale = this.$i18n.locale || 'en'
      if (typesEndPoint) {
        try {
          const typesList = await newTypes(typesEndPoint + '?i18n=' + locale)
          return typesList
        } catch (error) {
          console.log('Error fetching notifications types data:', error)
        } finally {
          console.log('getNewNotificationTypes finished')
          this.typeLoading = false
        }
      }
    },

    // retry list of notification status
    async getNotificationStatus () {
      const statusEndPoint = this.options.API.status || ''
      const locale = this.$i18n.locale || 'en'
      if (statusEndPoint) {
        try {
          const statusList = await status(statusEndPoint + '?i18n=' + locale)
          return statusList
        } catch (error) {
          console.log('Error fetching notifications status data:', error)
        } finally {
          console.log('getNotificationStatus finished')
          this.statusLoading = false
        }
      }
    },

    // retry list of notification types
    async getNotificationLabels () {
      const labelsEndPoint = this.options.API.labels || ''
      if (labelsEndPoint) {
        try {
          const labelList = await labels(labelsEndPoint)
          return labelList
        } catch (error) {
          console.log('Error fetching notifications labels data:', error)
        } finally {
          console.log('getNotificationLabels finished')
          this.labelLoading = false
        }
      }
    },
    // load more notifications
    async loadMore () {
      this.page++
      console.log('LoadMore notifications..., page: ', this.page)
      await this.filterNotifications()
    },
    async initNotifications () {
      // init offset
      this.page = 0

      // load filters by type, label and status
      this.types = await this.getNotificationTypes() || []
      this.labels = await this.getNotificationLabels() || []
      this.status = await this.getNotificationStatus() || []
      this.typesSelector = await this.getNewNotificationTypes() || []

      // load notifications and counters
      this.list = this.activeTab === 'unreadTab' ? await this.getAllNotificationsUnreadList() : await this.getAllNotificationsList()
      this.count = this.activeTab === 'unreadTab' ? await this.totalNotificationsUnread() : await this.totalNotifications()
    }
  },
  computed: {
    title () { return this.$t('title') || 'Notifications' },
    type () { return this.$t('types') || 'types' },
    emptyTypes () { return this.$t('emptyTypes') },
    showTypes () { return this.types.length > 0 },
    label () { return this.$t('labels') || 'Labels' },
    emptyLabels () { return this.$t('emptyLabels') },
    showLabels () { return this.labels.length > 0 },
    statusTitle () { return this.$t('status') || 'Status' },
    emptyStatus () { return this.$t('emptyStatus') },
    showStatus () { return this.status.length > 0 },
    toggleMessage () { return this.selectedNotification },
    showNotifications () { return this.list.length > 0 },
    currentTab () { return this.activeTab },
    notificationList () { return this.list },
    limit () { return this.options.limit ? this.options.limit : 10 },
    moreToShow () { return this.count > this.notificationList.length },
    moreShowing () {
      var partial = this.notificationList.length ? this.notificationList.length : '-'
      var total = this.count ? this.count : '-'
      return this.$t('showing') + ' ' + partial + ' ' + this.$t('of') + ' ' + total
    },
    offset () { return this.limit * this.page },
    limitChars () { return this.options.replyLimit || 100 },
    remainingChars () { return (this.limitChars - this.newNotification.text.length) + this.$t('remaining') }
  },
  // CREATED
  async created () {
    this.initNotifications()
  }
}
</script>

<style lang="scss" scoped>

.notification-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  -moz-column-gap: 1.5rem;
       column-gap: 1.5rem;
  row-gap: .5rem;
}
.notificationsManagement {
  height: calc(100vh - 60px);
    display: flex;
    flex-direction: row;
    justify-items: center;
    flex-wrap: nowrap;
    align-items: stretch;
    padding: 0px;
}

.notify-menu {
  min-width: 240px;
  margin: 0px 0px 0px 0px;
  padding: 12px 0px;
  border-right: 1px solid var(--color-border-hard-divisor);
}

.notify-content {
  width: 100%;
  margin: 0px;
  padding: 0px;
}
.notity-content-list, .notity-content-item {
  height: auto;
  padding: 18px 12px;
  background-color: white;
}

.notification-new {
  position: relative;
  float: right;
  display: block;
  margin-top: -54px;
  margin-right: 16px;
}

.load-more{
  position: relative;
  text-align: right;
  top: -18px;
  right: 10px;
}

.settings-form {
  margin-top: 12px;
}

::v-deep .ods-module__body {
  padding: 0;
}

.ods-accordion-item__content {
  padding-bottom: 1.5rem!important;
}

.ods-accordion-item:first-child {
    border-top: none;
}
.ods-accordion-item {
    border-bottom: none;
}
.ods-accordion-item__wrap {
    padding: 0;
}
.ods-alert { padding: 8px; }

::v-deep td:not(:has(button)) {
    padding-top: 0px !important;
}
.ods-table .cell {
    font-family: poppins, 'soho';
}
  ::v-deep .ods-form-item {
  margin-bottom: 1em !important;
  margin-top: 1rem !important;
}
.ods-badge.is-dot .ods-badge__content--custom {
    background-color: transparent;
    border-color: transparent;
}
.family { font-family: Poppins, 'soho-light'; font-weight: 500;}
.ods-table--enable-row-hover .ods-table__body tr:hover>td {
  background-color: var(--color-bg-interactive);
    color: white;
}
.ods-table .cell {font-family: Poppins, 'soho-light'!important; font-weight: 500; }
::v-deep .td-filter {
  border-bottom: none !important;
  font-size: 12px;
  font-family: Poppins,'Soho Gothic Pro';
  }
  .ods-table__body tr.current-row>td {
  background-color: var(--color-bg-interactive)!important;
    color: white;
  }
::v-deep div.splitpanes__splitter:before {
  background-color: var(--color-bg-interactive)!important;
  width: 2px!important;
  height: 20px!important;
}

::v-deep .splitpanes.default-theme .splitpanes__pane {
    background-color: white;
}

.splitpanes__splitter:hover {
    border-left: 3px solid var(--color-bg-interactive)!important;
}

::v-deep div.splitpanes__splitter:after {
  background-color: var(--color-bg-interactive)!important;
  height: 20px!important;
  width: 2px!important;
}
::v-deep div.splitpanes__splitter {
  width: 8px!important;
  border-left: 1px solid var(--color-border-hard-divisor) !important;
  margin-left: -1px;
}

.splitpanes__splitter:after {
    transform: translateY(-50%);
    width: 2px!important;
    height: 20px!important;
}

.notifications-title {
  @include txt-title-150;
  border-bottom: $border-size-200 solid var(--color-border-soft-divisor);
  padding: $space-200;
  font-family: 'soho';
  font-weight: 400;
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
  top: -25px;
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

.ods-icon-xl {
  font-size: 3rem;
  margin: 1rem;
}
.wrap-styles.ods-scrollbar__wrap {
  height: calc(100vh - 60px);
}
.ods-table td {
    border-bottom: none!important;
}
</style>
