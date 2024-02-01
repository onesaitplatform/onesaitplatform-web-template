import Api from '@/store/services'

const baseURL =
  process.env.NODE_ENV === 'local'
    ? process.env.VUE_APP_PLATFORM
    : process.env.VUE_APP_PLATFORM

export const api = new Api(baseURL, {
  unauthorizedNotification: 'Unauthorized Action.',
  setClean: true
})

api.add('platform', { endpoint: '/controlpanel/api' })
