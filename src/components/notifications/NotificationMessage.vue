<template>
  <div class="notification-message">
    <ods-scrollbar wrap-class="wrap-styles" :tag="tag" :wrapStyle="wrapStyle" :viewStyle="viewStyle">
    <div class="notification">
      <div class="notification-body pb-0">
        <h4 class="notification-title family ods-mb-6">
          {{notification.subject}}
          <span class="notification-close" v-if="isAdmin">
            <ods-tooltip  :content="notification.status !== 'Closed' ? $t('closeToolTip') : $t('closedToolTip')" :placement="'top'">
              <ods-button v-if="notification.status !== 'Closed'" @click="closeNotification"  type="primary" :icon="'ods-icon-close'" :icon-position="'left'" :size="'default'" ref="buttonClose"> {{ $t('closeBtn') }} </ods-button>
              <span v-else class="ods-badge__content ods-badge__content--default" style="background-color: rgb(151 144 144); color: white; font-size: 0.7rem; border-radius: 4px;">
                <ods-icon name="lock" size="12" :color="'#fff'" class="ods-mr-1"></ods-icon> {{ $t('closed') }}
              </span>
            </ods-tooltip>
            <ods-tooltip  :content="$t('deleteToolTip')" :placement="'top'">
              <ods-button @click="deleteDialogVisible = true" class="ods-ml-2"  type="destructive" :icon="'ods-icon-delete'" :icon-position="'left'" :size="'default'" ref="buttonDelete"> {{ $t('deleteBtn') }}</ods-button>
            </ods-tooltip>
          </span>
        </h4>
        <p class="text-muted mb-4 family"> {{notification.text}} </p>
        <div class="table-responsive">
          <table class="table table-notification family mb-0">
            <tbody>
              <tr>
                <td class="property">{{ $t('dateField') }}:</td>
                <td class=""><ods-icon name="clock" size="12" class="ods-mr-1"/> <time class="notification__date" :datetime="notification.date"><b>{{ fromNow(notification.date) }}</b> - {{ notification.date | formatDate($i18n.locale === 'en' ? "MM/DD/YYYY HH:mm:ss" : "DD/MM/YYYY HH:mm:ss")}}</time></td>
              </tr>
              <tr>
                <td class="property">{{ $t('statusField') }}:</td>
                <td class=""> <ods-icon name="tag" size="12" class="ods-mr-1" /> <span style="font-weight: 500">{{ notificationStatus }}</span></td>
              </tr>
              <tr>
                <td class="property">{{ $t('labelField') }}:</td>
                <td  class="">
                  <ods-icon name="offer" size="12" class="ods-mr-1" />
                  <div data-name="OdsBadge" class="ods-badge family" v-for="(label,index) in labelsOfNotification" :key="index">
                    <span class="ods-badge__content ods-badge__content--default" :style="getLabelColor(label)">{{label}}</span>
                  </div>
                  <div data-name="OdsBadge" class="ods-badge family" v-if="!notification.labels">
                      <span class="ods-badge__content ods-badge__no-content">{{ $t('emptyLabels') }}</span>
                  </div>
                  <span class="ods-ml-2" v-if="isAdmin"> | <a class="ods-link__text" @click="editLabelDialogVisible = true">{{ $t('editLabels') }}</a></span>
                </td>
              </tr>
              <tr>
                <td class="property">{{ $t('typeField') }}:</td>
                <td class=""> <ods-icon name="notification" size="12" class="ods-mr-1" /> {{notification.type}}</td>
              </tr>
              <tr>
                <td class="property">{{ $t('ownerField') }}:</td>
                <td class=""> <ods-icon name="user" size="12" class="ods-mr-1" /> <span style="font-weight: 500">{{entireNotification ? entireNotification.owner : ' --- '}}</span></td>
              </tr>
              <tr>
                <td class="property">{{ $t('assignedField') }}:</td>
                <td class="">
                  <div v-if="isAssigned">
                   <ods-icon name="user" size="12" class="ods-mr-1" /> <span style="font-weight: 500">{{entireNotification ? entireNotification.assigned : ' --- '}}</span>
                  </div>
                  <div v-else>
                    <ods-icon name="tick" size="12" class="ods-mr-1" />
                    <div data-name="OdsBadge" class="ods-badge family">
                      <span class="ods-badge__content ods-badge__no-content">{{ $t('notAssigned') }}</span>
                    </div>
                    <!-- <ods-button  @click="assignTo"  type="secondary" :icon="'ods-icon-plus-medium'" :color="'#2e4454'" :icon-position="'default'" :size="'default'" ref="buttonAssign"></ods-button> -->
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
     </div>
     <!-- MESSAGES -->
    <div class="ods-p-5" v-if="entireNotification && messages">
      <ods-divider class="family" direction="horizontal" :contentPosition="'center'" style="background-color: white;color: #2e4454;font-size: .80rem;">{{ $t('messages') }} ({{ messages.length }})</ods-divider>
      <ul class="ods-timeline ods-pt-2">
        <li class="ods-timeline-item" v-for="(message, index) in messages" :key="index" :class="!message.read ? 'message-unread' : ''">
          <div class="ods-timeline-item__tail"></div>
          <div class="ods-timeline-item__node ods-timeline-item__node--normal ods-timeline-item__node--primary"></div>
          <div class="ods-timeline-item__wrapper">
            <div class="ods-timeline-item__content">
              <ul class="notification-fromTo family">
                <li>
                  <span class="property">{{ $t('from') }}:</span> {{ message.from }} <span class="property">{{ $t('to') }}:</span> {{ message.to }}
                </li>
                <li>
                  <ods-button-group style="margin: 0 0.2rem">
                    <div class="ods-badge family ods-mr-2" v-if="message.read">
                      <span class="ods-badge__content ods-badge__content--default" style="background-color: #8abf9e; color: white; font-size: 0.7rem; border-radius: 4px;">
                      <ods-icon name="eye" size="12" :color="'#fff'" class="ods-mr-1"></ods-icon> {{ $t('read') }}
                      </span>
                    </div>
                    <div v-else class="ods-badge family ods-mr-2">
                      <span class="ods-badge__content ods-badge__content--default" style="background-color: rgb(191 138 138); color: white; font-size: 0.7rem; border-radius: 4px;">
                      <ods-icon name="eye-off" size="12" :color="'#fff'" class="ods-mr-1"></ods-icon> {{ $t('unread') }}
                      </span>
                    </div>
                    <ods-icon name="clock" size="12" class="ods-mr-1"/>
                    <time class="notification__date" :datetime="notification.date">
                      <b>{{ fromNow(message.timestamp) }}</b> - {{ message.timestamp | formatDate($i18n.locale === 'en' ? "MM/DD/YYYY HH:mm:ss" : "DD/MM/YYYY HH:mm:ss")}}</time>
                  </ods-button-group>
                </li>
              </ul>
              <div class="text-muted mt-3 mb-3 family mr-5" >
                <span class="message-text"><pre v-html="message.text"></pre></span>
                <span class="download">
                  <ods-button v-if="entireNotification.typeId === 'DOWNLOAD_DATA'" @click="downloadNotificationFile(entireNotification.filepath, entireNotification.filename)"  type="primary" :icon="'ods-icon-download'" :icon-position="'left'" :size="'default'" ref="buttonDownload"> {{ $t('downloadBtn') }} </ods-button>
                  <!-- <a v-if="notification.type === 'Download data'" :href="entireNotification.file" target="_blank" type="primary" :icon="'ods-icon-download'" :icon-position="'left'" :size="'default'" ref="buttonDownload"> {{ $t('downloadBtn') }} </a> -->
                </span>
              </div>
            </div>
          </div>
        </li>
      </ul>

      <!-- REPLY SECTION -->
      <section class="reply-section" v-if="(notification.status !== 'Closed') && (notification.type !== 'Download data')">
        <ods-divider class="family" direction="horizontal" :contentPosition="'center'" style="background-color: white;color: #2e4454;font-size: .80rem;">{{ $t('replyZone') }} </ods-divider>
          <div  class="reply-text">
              <ods-input v-model="messageText" type="textarea" class="family" :size="'default'" :placeholder="$t('replyPlaceholder')" :detail="remainingChars" :rows="5" :resize="'vertical'"
                :maxlength="limitChars"
                :minlength="2">
              </ods-input>
          </div>
          <div class="reply-send">
          <ods-tooltip  :content="$t('replyToolTip')" :placement="'left'">
            <ods-button @click="replySend()" class="ods-ml-2"  type="primary" :icon="replyLoading ? 'ods-icon-loading' : 'ods-icon-save'" :icon-position="'left'" :size="'default'" ref="buttonReplySend"> {{ $t('reply') }}</ods-button>
          </ods-tooltip>
        </div>
      </section>
     </div>
     <p  v-else class="text-muted mt-3 mb-3 family mr-5"> No Data </p>
    </ods-scrollbar>

    <!-- DELETE DIALOG -->
    <ods-dialog  :title="$t('deleteDialog') + notification.subject" :visible.sync="deleteDialogVisible" :width="'500px'"  :append-to-body="true" :modal="true"  :modal-append-to-body="true"  :lock-scroll="true" :close-on-click-modal="true"  :close-on-press-escape="true"  :show-close="true">
      <span>{{$t('deleteDesc')}}</span>
      <div slot="footer" class="dialog-footer">
        <ods-button type="neutral" @click="deleteDialogVisible = false">{{$t('cancelBtn')}}</ods-button>
        <ods-button @click="deleteDialogVisible = false; deleteNotification()">{{$t('deleteBtn')}}</ods-button>
      </div>
    </ods-dialog>

    <!-- EDIT LABEL DIALOG -->
    <ods-dialog  :title="$t('editLabelDialog')" :visible.sync="editLabelDialogVisible" :width="'500px'"  :append-to-body="true" :modal="true"  :modal-append-to-body="true"  :lock-scroll="true" :close-on-click-modal="true"  :close-on-press-escape="true"  :show-close="true">
      <div class="edit-labels" >
        <label>Add or remove labels: </label>
        <ods-select  v-model="notificationLabels" :multiple="true" :size="'default'" class="ods-mr-3">
          <ods-option v-for="(label, index) in labels" :key="index" :label="label.name" :value="label.name">
            <div data-name="OdsBadge" class="ods-badge family">
              <span class="ods-badge__content ods-badge__content--default" :style="getLabelColor(label.name)">{{label.name}}</span>
            </div>
          </ods-option>
        </ods-select>
      </div>
      <div slot="footer" class="dialog-footer">
        <ods-button type="neutral" @click="editLabelDialogVisible = false">{{$t('cancelBtn')}}</ods-button>
        <ods-button @click="editLabelDialogVisible = false; editNotificationLabels()">{{$t('updateBtn')}}</ods-button>
      </div>
    </ods-dialog>
  </div>
</template>

<script>
import i18n from './lang'
import moment from 'moment'
import { getById, sendReply, close, update, updateLabels, remove } from '@/services/notifications/notifications'
import { FormatDateFilter } from '@/utils/filters'
export default {
  name: 'NotificationMessage',
  i18n,
  mixins: [FormatDateFilter],
  props: {
    notification: {
      type: Object,
      default: () => {},
      required: true
    },
    options: {
      type: Object,
      default: () => {},
      required: true
    },
    labels: {
      type: Array,
      default: () => [],
      required: true
    }
  },

  data () {
    return {
      loading: true,
      entireNotification: null,
      moment: moment,
      // scroll
      tag: 'div',
      wrapStyle: { height: 'calc(98vh - 60px)', padding: '0px' },
      viewStyle: { padding: '0px' },
      // reply
      replyLoading: false,
      isReplyMessage: false,
      messageText: '',
      // dialogs
      closeLoading: false,
      deleteDialogVisible: false,
      editLabelDialogVisible: false,
      notificationLabels: [],
      // status change control
      isChanged: false,
      changedStatus: null,
      role: sessionStorage.getItem('role')
    }
  },
  methods: {
    // retry list of notifications (list)
    async getNotificationById (notificationId) {
      const EndPoint = this.options?.API?.id || ''
      const locale = this.$i18n.locale || 'en'
      if (EndPoint) {
        try {
          const notification = await getById(`${EndPoint}${notificationId}/?i18n=${locale}`)
          return notification
        } catch (error) {
          console.log('Error fetching notification ', notificationId, ':', error)
        } finally {
          console.log('getNotificationsById finished')
          this.notificationLabels = this.notification.labels
          this.loading = false
        }
      }
    },
    // update notification status
    async updateNotification () {
      const notificationId = this.notification.id
      var EndPoint = this.options?.API?.update || ''
      EndPoint = EndPoint.replace('<notification_id>', notificationId)
      console.log('UPDATE NOTIFICATION: ', EndPoint)

      if (!notificationId || notificationId === '') {
        // notify
        this.$notify({
          title: this.$t('notifyTitle'),
          message: this.$t('notifyMsgUpdate'),
          type: 'warning'
        })
        return false
      }
      if (EndPoint && notificationId) {
        try {
          const updateMessage = await update(EndPoint)
          return updateMessage
        } catch (error) {
          console.log('Error Update status notification ', notificationId, ':', error)
        } finally {
          console.log('updateNotification finished')
        }
      }
    },
    // delete notification
    async deleteNotification () {
      const notificationId = this.notification.id
      var EndPoint = this.options?.API?.delete || ''
      EndPoint = EndPoint.replace('<notification_id>', notificationId)
      if (!notificationId || notificationId === '') {
        // notify
        this.$notify({
          title: this.$t('notifyTitle'),
          message: this.$t('notifyMsgDelete'),
          type: 'warning'
        })
        return false
      }
      if (EndPoint && notificationId) {
        this.$emit('action:loaded', this.notification)
        try {
          const deleteMessage = await remove(EndPoint)
          return deleteMessage
        } catch (error) {
          console.log('Error Deleting notification ', notificationId, ':', error)
        } finally {
          console.log('deleteNotification finished')
          this.$emit('action:deleting', this.notification)
        }
      }
    },
    // load entire notification (notification + messages)
    async loadNotification (notificationId, doUpdate = true) {
      try {
        this.entireNotification = await this.getNotificationById(this.notification.id)
        if (doUpdate) {
          // eslint-disable-next-line no-unused-vars
          const update = await this.updateNotification()
          console.log('notification loaded and updated: ', this.entireNotification)
        }
      } catch (error) {
        console.log('Error Deleting notification ', notificationId, ':', error)
      } finally {
        console.log('loadNotification finished')
      }
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
    },
    // edit labels
    async editNotificationLabels () {
      const notificationId = this.notification.id
      var EndPoint = this.options?.API?.updatelabels || ''
      var body = { labels: this.notificationLabels }
      EndPoint = EndPoint.replace('<notification_id>', notificationId)
      console.log('UPDATE LABELS NOTIFICATION: ', EndPoint)

      if (!notificationId || notificationId === '') {
        // notify
        this.$notify({
          title: this.$t('notifyTitle'),
          message: this.$t('notifyMsgEditLabels'),
          type: 'warning'
        })
        return false
      }
      if (EndPoint && notificationId) {
        try {
          const updateLabelMessage = await updateLabels(EndPoint, body)
          console.log('NEW LABELS: ', updateLabelMessage)
          return updateLabelMessage
        } catch (error) {
          console.log('Error Update labels on notification ', notificationId, ':', error)
        } finally {
          console.log('editNotificationLabels finished')
          this.notification.labels = this.notificationLabels
          this.$emit('action:updated', this.notification)
        }
      }
    },

    // close notification
    async closeNotification () {
      const notificationId = this.notification.id
      var EndPoint = this.options?.API?.close || ''
      EndPoint = EndPoint.replace('<notification_id>', notificationId)

      if (!notificationId || notificationId === '') {
        // notify
        this.$notify({
          title: this.$t('closeNotificationTitle'),
          message: this.$t('closeNotificationMessageWarning'),
          type: 'warning'
        })
        return false
      }

      // loading till action finished
      this.closeLoading = true

      if (EndPoint && notificationId) {
        try {
          const closeMessage = await close(EndPoint)
          return closeMessage
        } catch (error) {
          console.log('Error Closing notification ', notificationId, ':', error)
        } finally {
          console.log('closeNotification finished')
          this.closeLoading = false
          this.changedStatus = 'Closed'
          this.isChanged = true
          this.$emit('action:loaded', this.notification)
          this.$emit('action:closing', this.notification)
          this.loadNotification(notificationId, false)
        }
      }
    },

    // send reply message notification
    async replySend () {
      const notificationId = this.notification.id
      var EndPoint = this.options?.API?.reply || ''
      EndPoint = EndPoint.replace('<notification_id>', notificationId)
      var reply = { from: this.entireNotification.owner, text: '', read: false }

      if (!this.messageText || this.messageText.length < 2) {
        // notify
        this.$notify({
          title: this.$t('replyMessageTitle'),
          message: this.$t('replyMessageWarning'),
          type: 'warning'
        })
        return false
      } else {
        reply.text = this.messageText
      }
      this.replyLoading = true
      if (EndPoint && notificationId) {
        try {
          const replyMessage = await sendReply(EndPoint, reply)
          return replyMessage
        } catch (error) {
          console.log('Error Reply notification ', notificationId, ':', error)
        } finally {
          console.log('replySend finished')
          this.replyLoading = false
          this.messageText = ''
          // end state, load notification again.
          this.loadNotification(notificationId, false)
        }
      }
    },
    // Download files in message.
    async downloadNotificationFile (file, fileName) {
      const notificationId = this.notification.id
      const fileToDownload = file
      var done = false

      if (!notificationId) {
        // notify
        this.$notify({
          title: this.$t('notifyTitle'),
          message: this.$t('notifyMsgDownload'),
          type: 'warning'
        })
        return false
      }
      if (notificationId && fileToDownload && fileName) {
        try {
          const myHeaders = new Headers()
          myHeaders.append('Authorization', 'Bearer ' + sessionStorage.getItem('sessionToken'))

          const requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
          }
          fetch('https://onesaitplatform.ucsd.edu/controlpanel/api/objectstorage?filePath=' + fileToDownload, requestOptions)
            .then((response) => response.blob())
            .then((blob) => {
              done = true
              var url = window.URL.createObjectURL(blob)
              var a = document.createElement('a')
              a.href = url
              a.download = fileName || fileToDownload.split('/').pop()
              document.body.appendChild(a) // append the element to the dom
              a.click()
              a.remove() // afterwards, remove the element
              if (done) {
                // if the file was downloaded correctly, then automatically close the notification
                this.closeNotification()
              }
            })
            .catch((error) => console.error(error))
        } catch (error) {
          console.log('Error download notification´s file ', fileToDownload, ':', error)
          done = false
        } finally {
          console.log('downloadFile finished')
        }
      }
    },
    // calculates time date from now to date
    fromNow (date) {
      const now = moment()
      const timestamp = moment.utc(date, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]')
      return moment.duration(timestamp.diff(now)).locale(this.$i18n.locale).humanize(true) || date
    }
  },
  computed: {
    labelsOfNotification () { return this.notification.labels || [] },
    messages () {
      return this.entireNotification?.messages || []
    },
    limitChars () { return this.options.replyLimit || 250 },
    remainingChars () { return (this.limitChars - this.messageText.length) + this.$t('remaining') },
    isAssigned () {
      if (!this.entireNotification) {
        return false
      } else {
        return this.entireNotification?.assigned ? this.entireNotification.assigned : false
      }
    },
    // adjust for "admin" in component options
    isAdmin () {
      if (this.options.adminRole) {
        return sessionStorage.getItem('role') === this.options.adminRole
      } else {
        return false
      }
    },
    // status of notification, can be changed to closed.
    notificationStatus () {
      if (this.isChanged) {
        return this.changedStatus
      } else {
        return this.notification.status
      }
    }
  },
  watch: {
    notification: {
      immediate: true,
      handler (notification, oldNotification) {
        this.loadNotification(notification.id, true)
        this.messageText = ''
        this.isReplyMessage = false
      }
    },
    '$i18n.locale': {
      async handler (val) {
        // reload Notifications in order to show in the new language.
        console.log('locale changes to ', val)
        this.$moment.locale(val)
      },
      immediate: true
    }
  },
  mounted () {
    // time ago adjust
    moment.relativeTimeThreshold('m', '59')
  }
}
</script>

<style lang="scss">
.notification-message {
  width: 100%;
  min-height: 200px;
  cursor: pointer;
}
.notification {
margin-bottom: 24px;
position: relative;
display: flex;
flex-direction: column;
min-width: 0;
word-wrap: break-word;
background-color: white;
background-clip: border-box;
border: 0;
padding: 0px 0px 12px 0px;
}
.notification-title{
font-size: 15px;
  margin: 0 210px 7px 0;
  font-weight: 600;
  color: var(--color-txt-primary);
}
.notification-body{
flex: 1 1 auto;
padding: 0;
}
.notification-fromTo {
display: inline-flex;
flex-direction: row;
justify-content: space-between;
align-items: center;
flex-wrap: wrap;
align-content: normal;
border-bottom: 1px solid var(--color-border-soft-divisor);
line-height: 2rem;
width: 100%;
margin-top: -7px;
}
.notification-close{
position: absolute;
  top: 0px;
  right: 12px;
}
.table-notification {
font-size: 0.8125rem;
color: #495057;
}
.property {
background-color: white;
font-weight: 600;
width: 11%;
min-width: 112px
}
.text-muted {
  color: #6c757d !important;
  line-height: 1.5rem;
  font-size: 0.8125rem;
}
.table td, .table th {
  padding: 0.75rem;
  vertical-align: middle;
  border: 0px;
}
.ods-badge__no-content {
  background-color: #f3f5f5;
  color: #999;
  font-size: 0.7rem;
  border-radius: 4px;
  margin-right: 4px;
}
.reply-section {
display: block;
width: 100%;
height: auto;
}

.reply-send {
position: relative;
display: block;
float: right;
padding: 12px 12px 12px 0;
}

.reply-text {
background-color: white;
position: relative;
display: block;
width: 100%;
height: 100px;
border: none;
}

.fade-enter-active, .fade-leave-active {
transition: opacity .7s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
opacity: 0;
}

.updated {
background: lemonchiffon;
}
.download {
display: block;
padding: 12px 0px;
}

</style>
