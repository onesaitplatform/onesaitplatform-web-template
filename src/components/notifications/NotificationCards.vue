<template>
    <div class="notification-card" @click="select(notification)" :class="NotificationClasses" :id="notification.id">
        <div class="notification-card-header">
          <div>
            <h3 class="ods-pt-2"><small>{{ index + 1 }}.-</small> {{ notification.subject }}</h3>
          </div>
            <label class="notification-status">
              <ods-icon name="tag" size="12" class="ods-mr-1" /><span :class="'status-' + notification.id" class="family">{{ notification.status }}</span>
            </label>
        </div>
        <div class="notification-card-body">
          <div class="ods-pt-2"><ods-icon name="clock" size="12" style="margin-right: 4px"></ods-icon> <time class="notification__date" :datetime="notification.date">{{ moment.utc(notification.date,'YYYY-MM-DD[T]HH:mm:ss[Z]').locale($i18n.locale).fromNow()}} - {{ notification.date | formatDate($i18n.locale === 'en' ? "MM/DD/YYYY HH:mm:ss" : "DD/MM/YYYY HH:mm:ss")}}</time></div>
          <div>
            <div data-name="OdsBadge" class="ods-badge family" v-for="(label,index) in notification.labels" :key="index">
              <span class="ods-badge__content ods-badge__content--default" :style="getLabelColor(label)">{{label}}</span>
            </div>
          </div>
        </div>
        <div v-if="withFooter" class="notification-card-footer">
        </div>
    </div>
</template>

<script>
import i18n from './lang'
import moment from 'moment'
import { FormatDateFilter } from '@/utils/filters'
export default {
  name: 'NotificationCards',
  i18n,
  mixins: [FormatDateFilter],
  props: {
    notification: {
      type: Object,
      default: () => {},
      required: true
    },
    labels: {
      type: Array,
      default: () => [],
      required: true
    },
    index: {
      type: Number,
      required: true
    }

  },

  data () {
    return {
      loading: true,
      selected: false,
      withFooter: false,
      moment: moment
    }
  },
  watch: {
    '$i18n.locale': {
      async handler (val) {
        // reload moment calculation in order to show in the new language.
        this.$moment.locale(val)
      },
      immediate: true
    }
  },
  computed: {
    NotificationClasses () {
      return !this.notification.read ? 'notification-unread' : ''
    }
  },
  methods: {
    // click on notification send to parent to update NotificationMessage
    select (notification) {
      this.selected = !this.selected
      this.$emit('action:selection', this.notification)
    },
    // get color from labels
    getLabelColor (label) {
      const toRGBObject = rgbStr => {
        var [red, green, blue, opacity] = [0, 0, 0, 1]
        if (rgbStr !== undefined) {
          [red, green, blue, opacity] = rgbStr.match(/\d+/g).map(Number)
        } else {
          [red, green, blue, opacity] = [0, 0, 0, 0.5]
        }
        return { red, green, blue, opacity }
      }
      const color = this.labels.length === 0 ? 'rgba(215,218,220,1)' : this.labels.filter(x => x.name === label).map(y => y.color)[0]
      var fontColor = '#333'
      var { red, green, blue } = toRGBObject(color)
      if ((red * 0.299 + green * 0.587 + blue * 0.114) > 160) { fontColor = '#333' } else { fontColor = '#fff' }
      return {
        'margin-right': '4px',
        'background-color': color,
        color: fontColor,
        'font-size': '.70rem',
        'border-radius': '4px'
      }
    }
  },
  created () {
    // adjust moment for from now and locale.
    this.moment.relativeTimeThreshold('m', '59')
    this.moment.locale(this.$i18n.locale) || window.moment.locale(this.$i18n.locale)
  }
}
</script>

<style lang="scss">
.notification-card {
  background-color: #ffffff;
  border-bottom: 1px solid var(--color-border-hard-divisor);
  border-radius: 0px;
  overflow: hidden;
  display: flex;
  cursor: pointer;
  flex-direction: column;
  transition: 0.25s ease;
}

.family {font-family: 'Poppins', 'Soho Gothic Pro'}

.notification-card:hover {
  transform: translateX(-5px);
  background-color: cornsilk;
}

.notification-card:focus-within {
  box-shadow: 0 0 0 2px #1f1f1f, 0 0 0 4px #bdbbb7;
}
.notification-card > p {
    margin-top: 0;
    margin-bottom: 0.3rem;
}

.notification-selected {
  background-color: whitesmoke;
  border-radius: 4px;
}

.notification-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .5rem;
}
.notification-card-header div {
  display: flex;
  align-items: center;
}
.notification-card-header div span {
    width: 36px;
    height: 36px;
    border-radius: 0px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.notification-card-header div h3 {
    font-weight: 500;
    font-size: 0.90rem;
    font-family: Poppins,'Soho Gothic Pro','Soho Gothic Pro';
}

.notification-status {
    margin: 0;
    font-size: 12px;
    font-weight: 500;
    margin-right: .3rem;
    min-width: 75px;
    text-align: right;
}

.notification-card-body {
  padding: 0rem .5rem 1rem .5rem;
  font-size: 0.8rem;
  font-family: Poppins, "soho-light", "Soho Gothic Pro";
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.notification-card-body div {
  display: flex;
  align-items: center;
}

.notification-card-footer {
    margin-top: auto;
    padding: .6rem 1rem;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    border-top: 1px solid #eff1f6;
}
.notification-card-footer a {
  color: #404089;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.80rem;
  font-family: Poppins,'Soho Gothic Pro','Soho Gothic Pro';
}
</style>
