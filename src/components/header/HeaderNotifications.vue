<template lang="pug">
div.header-notifications__wrapper
    ods-badge(
      type="error"
      :value="unreadNotifications"
      :is-dot="false"
    )
      ods-actions-menu.header-notifications(
        icon="notification"
        customClass="header-notifications__popover"
        width="360"
        :onShowEvent="true"
        :onHideEvent="true"
        @show="showMobileOverlay"
        @hide="hideMobileOverlay"
        boundariesElement=".ods-main-header")
        ul.ods-actions-menu__ul.ods-actions-menu__ul--notifications
          li.ods-actions-menu__notifications__item.ods-actions-menu__notifications__item--title
            .notification__inner
              h6.notification__title {{ $t('notifications.popoverTitle') }}
                span.notifications-counter {{ unreadNotifications }}
          li.ods-actions-menu__notifications__item(
            v-for="(notification, index) in notifications"
            :key="notification.title + index"
            :class="{'ods-actions-menu__notifications__item--unread': !notification.status}")
            .notification__inner
              h6.notification__title {{ notification.title }}
              p.notification__content {{ notification.content | truncate(150, '...') }}
              time.notification__date(
                :datetime="notification.date") {{ notification.date }}
              component.notification__link(
                :is="linkTag(notification)"
                v-bind="properties") {{ notification.linkText }}
</template>

<script>
import * as _ from 'lodash'
import notificationsDemo from '../../../public/notificationsDemo.json'

export default {
  name: 'HeaderNotifications',
  data () {
    return {
      isPhone: window.matchMedia('(max-width: 767px)').matches
    }
  },
  computed: {
    notifications () {
      return _.orderBy(notificationsDemo, ['status', 'date'], ['asc', 'desc'])
    },
    unreadNotifications () {
      return this.notifications.filter(e => !e.status).length
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
    showMobileOverlay () {
      this.$parent.showMobileOverlay()
    },
    hideMobileOverlay () {
      this.$parent.hideMobileOverlay()
    }
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
