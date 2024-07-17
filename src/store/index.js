import Api from '@/store/services'

const baseURL =
  process.env.NODE_ENV === 'local'
    ? process.env.VUE_APP_PLATFORM
    : process.env.VUE_APP_PLATFORM

export const api = new Api(baseURL, {
  unauthorizedNotification: 'Unauthorized Action.',
  setClean: true
})
// New Axios Service Add: @name, @retry, @options
api.add('platform', false, { endpoint: '/controlpanel/api' }) // platform API Services
api.add('userDefined', true, { endpoint: '/api-manager/server/api' }) // User defined API Services
