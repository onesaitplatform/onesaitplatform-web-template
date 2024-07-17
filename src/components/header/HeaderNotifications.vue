<template>
  <div class="header-notifications__wrapper">
    <ods-badge type="error" :value="unreadNotifications" :is-dot="false">
      <ods-actions-menu class="header-notifications" icon="notification" customClass="header-notifications__popover" width="360" :onShowEvent="true" :onHideEvent="true" @show="showMobileOverlay" @hide="hideMobileOverlay" boundariesElement=".ods-main-header">
        <ul class="ods-actions-menu__ul ods-actions-menu__ul--notifications">
          <li class="ods-actions-menu__notifications__item ods-actions-menu__notifications__item--title">
            <div class="notification__inner">
              <h6 class="notification__title">{{ $t('notifications.popoverTitle') }}<span v-if="unreadNotifications > 0" class="notifications-counter">{{ unreadNotifications }}</span></h6>
            </div>
          </li>
          <li class="ods-actions-menu__notifications__item" v-for="(notification, index) in notifications" :key="index" :class="{'ods-actions-menu__notifications__item--unread': !notification.read}">
            <div class="notification__inner">
              <h6 class="notification__title">{{ notification.subject }}</h6>
              <p class="notification__content">{{ notification.text | truncate(150, '...') }}</p>
              <time class="notification__date" :datetime="notification.date">{{ notification.date | formatDate("MM/DD/YYYY HH:mm:ss")}}</time>
              <component class="notification__link" :is="linkTag(notification)" v-bind="properties">{{ notification.linkText }}</component>
            </div>
          </li>
          <li class="ods-actions-menu__notifications__item ods-actions-menu__notifications__item--title">
            <div class="notification__inner" style="background-color: ghostwhite;">
              <h6 class="notification__title">
                <span data-name="OdsIcon" class="ods-icon-notification ods-main-nav__icon ods-mr-3" style="color: var(--color-txt-primary);  position: relative; top: 4px; left: 6px;"></span>
                <component class="notification__link" :is="linkTag(notificationComponent)" v-bind="properties">{{$t('notifications.viewAll')}}</component>
              </h6>
            </div>
          </li>
        </ul>
      </ods-actions-menu>
    </ods-badge>
  </div></template>

<script>
import * as _ from 'lodash'
import { FormatDateFilter } from '@/utils/filters'
import {
  count,
  list
} from '@/services/notifications/notifications'

export default {
  name: 'HeaderNotifications',
  props: {
    options: {
      type: Object,
      default: () => {},
      required: false
    }
  },
  mixins: [FormatDateFilter],
  data () {
    return {
      totalUnread: 0,
      list: [], // notifications
      polling: null,
      isPhone: window.matchMedia('(max-width: 767px)').matches,
      notificationComponent: {
        url: '/notifications'
      }
    }
  },
  computed: {
    notifications () {
      return _.orderBy(this.list, ['read', 'date'], ['asc', 'desc'])
    },
    unreadNotifications () {
      // return this.notifications.filter(e => !e.status).length
      return this.totalUnread
    }
  },
  methods: {
    linkTag (notification) {
      if (this.$router && !notification.url.includes('http')) {
        this.properties = {
          to: notification.url
        }
        return 'router-link'
      } else {
        this.properties = {
          href: notification.url,
          target: '_blank'
        }
        return 'a'
      }
    },
    // retry total unread notificacions (count)
    async totalNotificationsUnread () {
      const countEndPoint = this.options.API.count || ''
      if (countEndPoint) {
        try {
          const totalUnread = await count(countEndPoint)
          return totalUnread
        } catch (error) {
          console.log('Error fetching notifications unread data:', error)
        } finally {
          console.log('totalNotificationsUnread finished')
        }
      }
    },
    // retry list of notifications (list)
    async getNotificationsList () {
      const listEndPoint = this.options.API.list || ''
      const limit = this.options.limit || 10
      if (listEndPoint) {
        try {
          const notifications = await list(`${listEndPoint}?limit=${limit}`)
          return notifications
        } catch (error) {
          console.log('Error fetching notifications list data:', error)
        } finally {
          console.log('getNotificationsList finished')
        }
      }
    },

    showMobileOverlay () {
      this.$parent.showMobileOverlay()
    },
    hideMobileOverlay () {
      this.$parent.hideMobileOverlay()
    },

    // polling data on frecuency (defined on component)
    async pollingNotifications () {
      const countEndPoint = this.options.API.count || ''
      const listEndPoint = this.options.API.list || ''
      const frequency = this.options.frequency || 60
      const limit = this.options.limit || 10
      if (countEndPoint && listEndPoint) {
        try {
          const totalUnread = await count(countEndPoint)
          if (totalUnread !== this.totalUnread) {
            this.list = []
            this.list = await list(`${listEndPoint}?limit=${limit}`)
            this.totalUnread = totalUnread
            // notify
            this.$notify({
              title: 'Notification Message:',
              message: 'You have new Notifications',
              type: 'success'
            })
          }
        } catch (error) {
          console.log('Error polling notifications:', error)
        } finally {
          console.log('|--> Polling Notifications (', frequency, 's.) finished.')
        }
      }
    },
    // polling Data set Interval on frequency
    pollData () {
      const frequency = (this.options?.frequency || 0) * 1000 // ms.
      if (frequency) {
        this.polling = setInterval(() => {
          this.pollingNotifications()
        }, frequency)
      }
    }
  },
  async created () {
    // load notifications and unreaded count
    this.totalUnread = await this.totalNotificationsUnread()
    this.list = await this.getNotificationsList()
  },
  mounted () {
    console.log('Notification Options: ', this.options)
    this.pollData()
  },
  beforeDestroy () {
    clearInterval(this.polling)
  }
}
</script>

<style lang="scss" scoped>
  .header-notifications__wrapper {
    position: relative;

    ::v-deep .ods-badge__content.is-fixed {
      top: 4px;
      right: 0.8rem;
      height: 1rem;
      min-width: 1rem;
      font-size: rem(10);
      font-weight: 500;
    }
  }
</style>
