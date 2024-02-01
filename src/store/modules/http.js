// Retry interceptor function
import axiosRetry from 'axios-retry'
import axios from 'axios'
import login from './login.js'

// AXIOS PLATFORM BASE CONFIGURATION
export const HTTP_PLATFORM = axios.create({
  baseURL: process.env.VUE_APP_PLATFORM
})

axiosRetry(HTTP_PLATFORM, {
  retries: 3, // Number of retries
  retryCondition: () => true // Retry all errors
})
export function jwtInterceptor () {
  axios.interceptors.request.use(request => {
    // add auth header with jwt if account is logged in and request is to the api url
    const keyCloakToken = login.getLoginToken || localStorage.getItem('vue-token')
    const isLoggedIn = keyCloakToken !== '' || null

    if (isLoggedIn) {
      request.headers.common.Authorization = `Bearer ${keyCloakToken}`
      console.log('jwt interceptor: ', keyCloakToken)
    }
    return request
  })
}

// Alter defaults after HTTP_PLATFORM has been created
if (sessionStorage.sessionToken) {
  HTTP_PLATFORM.defaults.headers.common.Authorization = 'Bearer ' + sessionStorage.sessionToken
}
