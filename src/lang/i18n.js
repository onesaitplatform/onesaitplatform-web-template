import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { HTTP_PLATFORM } from '../store/modules/http'

import esLocale from './locale/es'
import enLocale from './locale/en'
import store from '../store/store'
// TO-DO: call https://lab.onesaitplatform.com/controlpanel/api/internationalizations/MDPi18n/ where MDPi18n is i18n key
// in case i18n not exists load fallback i18n Libs.

Vue.use(VueI18n)

// TO-DO: FROM CONTROLPANEL BY API
var localeDefault = process.env.VUE_APP_I18N_LOCALE || 'en'
var messagesBackup = {
  es: esLocale,
  en: enLocale
}
var messages = messagesBackup

var i18n = new VueI18n({
  locale: localeDefault,
  messages
})

// load locales if i18nId exists
export async function loadMessages (i18nId) {
  try {
    if (i18nId) {
      const i18nApiEndPoint = '/controlpanel/api/internationalizations/' + i18nId + '/'
      const i18nData = await HTTP_PLATFORM.get(i18nApiEndPoint, { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } })
      if (i18nData.data.jsoni18n && i18nData.data.jsoni18n.languages && Object.keys(i18nData.data.jsoni18n.languages).length > 0) {
        var i18nFiles = i18nData.data.jsoni18n.languages
        var i18Label = ''
        localeDefault = (i18nData.data.default).toLowerCase()
        // iterate and mount messages object (es,en,...)
        Object.keys(i18nFiles).forEach(key => {
          // create new message file
          i18Label = (key).toLowerCase()
          // mount messages
          var i18nL = {
            ...i18n.getLocaleMessage(key.toLowerCase()),
            ...i18nFiles[key]
          }
          messages[i18Label] = {}
          messages[i18Label] = i18nL
          i18n.setLocaleMessage(key.toLowerCase(), i18nL)
        })
        sessionStorage.setItem('languages', JSON.stringify(Object.keys(messages)))
        i18n.locale = localeDefault
      } else {
        messages = messagesBackup
      }
      return i18n
    } else {
      // no i18n yet, set backUp
      console.log('Loading Local i18n files')
      i18n.setLocaleMessage('es', messagesBackup.es)
      i18n.setLocaleMessage('en', messagesBackup.en)
      return i18n
    }
  } catch (error) {
    console.log('(error request) Loading Local i18n files...')
    i18n.setLocaleMessage('es', messagesBackup.es)
    i18n.setLocaleMessage('en', messagesBackup.en)
    return i18n
  }
}

;(async function () {
  var Token = sessionStorage.getItem('sessionToken') || sessionStorage.getItem('vue-token')
  const i18Id = process.env.VUE_APP_PLATFORM_I18n
  var i18nFromApp = store.getters.getAppI18nId || i18Id
  console.log('Checking i18n: ', store.getters.getAppI18nId || '---')
  // define i18n and setup with messages from backUp or from App already Loaded.
  if (Token) { await loadMessages(i18nFromApp) }
})()

export default i18n
