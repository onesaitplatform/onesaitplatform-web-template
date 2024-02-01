import axios from 'axios'
import { merge } from 'lodash'
import { OdsNotification as Notify } from '@ods/ods'

/** @class Services */

class Services {
  /**
   * Constructor function that sets the base configuration for every microservice. It uses the BaseURL passed as an argument for determining
   * the endpoint and merges the custom configuration with the preconfigured configuration. It will check the URL against a regex to check wheter
   * it is valid or not. It will add a default _baseInstance to the services list in case at some point a clean base instance is needed.
   * @param {string} baseURL          - The base url for all the microservices that share the same server entry point
   * @param {object} configuration    - Custom axios and notifications configuration that will be merged with the default configuration
   */
  constructor (baseURL, config) {
    if (!this.URL_REGEX.test(baseURL)) throw new Error(`Invalid URL: ${baseURL}`)
    const configuration = merge(this._defaultConfiguration, config)
    this._services = new Set()
    this._configuration = {
      axios: merge(configuration.axiosConfiguration, {
        baseURL: baseURL.replace(/\/$/, '')
      }),
      notification: configuration.notificationConfiguration
    }
    this._unauthorized = {
      cb: configuration.unauthorizedCallback,
      notification: configuration.unauthorizedNotification
    }
    // Set a clean axios instance (no baseURL) for this services instance if the setClean configuration is set to true
    if (configuration.setClean) {
      this._createBaseInstance()
    }
  }

  // eslint-disable-next-line
  URL_REGEX = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi

  /**
   * @property {object}   _defaultConfiguration                                      - The default instance configuration
   * @property {string}   _defaultConfiguration.axiosConfiguration                   - The default axios configuration
   * @property {object}   _defaultConfiguration.notificationConfiguration            - The default noitificationConfiguration
   * @property {function} _defaultConfiguration.unauthorizedCallback                 - The default callback for unauthorized calls
   * @property {string}   _defaultConfiguration.unauthorizedNotification             - The default notification for unauthorized calls
   * @property {boolean}  _defaultConfiguration.setClean                             - The default setClean value
   */
  _defaultConfiguration = {
    axiosConfiguration: this._axiosConfig,
    notificationConfiguration: this._notificationConfig,
    unauthorizedCallback: null,
    unauthorizedNotification: null,
    setClean: false
  }

  /**
   * @property {object}  _axiosConfig                       - The default axios configuration
   * @property {string}  _axiosConfig.baseURL               - The base url for the axios requests
   * @property {object}  _axiosConfig.headers               - The default headers for the axios configuration
   * @property {string}  _axiosConfig.headers.Accept        - The default Accept header for the axios configuration
   * @property {string}  _axiosConfig.headers.ContentType   - The default ContentType header for the axios configuration
   */
  _axiosConfig = {
    baseURL: null,
    headers: {
      Accept: 'application/json',
      ContentType: 'application/json'
    }
  }

  /**
   * @property {object}  _notificationConfig              - The default axios configuration.
   * @property {string}  _notificationConfig.position     - The default position for the ods notifications
   * @property {object}  _notificationConfig.type         - The default type for the ods notifications
   * @property {string}  _notificationConfig.title        - The default title for the ods notifications
   * @property {string}  _notificationConfig.message      - The default message for the ods notifications
   * @property {string}  _notificationConfig.offset       - The default offset for the ods notifications
   * @property {string}  _notificationConfig.duration     - The default duration for the ods notifications
   * @property {string}  _notificationConfig.showClose    - Show close button by default on the notiications
   * @property {string}  _notificationConfig.notify       - // ??
   */
  _notificationConfig = {
    position: 'top-right',
    type: 'success',
    title: '',
    message: '',
    offset: 0,
    duration: '0',
    showClose: true,
    notify: true
  }

  /**
   * Check if the response handler should be enabled for a specific axios call. By default if the configuration doesn't have the 'handlerEnabled'
   * property set we will infer that the handler is enabled. In the case that the property is set we use its value to determine whether the
   * handler should be enabled or not
   * @param {object} config - The axios call configuration
   * @return {boolean} Whether the handler should be enabled or not. True by default if the property 'handlerEnabled' has not been set within the config
   */
  _isHandlerEnabled (config = {}) {
    return (
      !Object.prototype.hasOwnProperty.call(config, 'handlerEnabled') ||
      config.handlerEnabled
    )
  }

  /**
   * Handler function for successful axios calls. It acts as a middleware that intercepts the response and checks if the handler is enabled, in which case
   * it calls the corresponding handler. In any case the response object is still returned.
   * @param {object} response - The axios call response object
   * @return {response} The axios call response object
   */
  _successHandler = (response) => {
    if (!this._isHandlerEnabled(response.config)) return response
    this._responseHandler(response.config, response.status)
    return response
  }

  /**
   * Handler function for unsuccessful axios calls. It acts as a middleware that intercepts the axios error and checks if the handler is enabled, in which case
   * it calls the corresponding handler.
   * @param {object} response - The axios call error object
   * @return {error} The error originated by axios
   */
  _errorHandler = (error) => {
    if (!this._isHandlerEnabled(error.config) || !error.response) return Promise.reject(error)
    this._responseHandler(error.response.config, error.response.status, 'error')
    return Promise.reject(error)
  }

  /**
   * Response handler used for both successful and unsuccessful axios calls. It reads the notification configuration from the axios config
   * (under the 'notify' key) and raises a notification using this configuration. For errors originated from a 401 (unauthorized) error it will dispatch a
   * logout action using the store which clears the user data and redirects to the login page.
   * If the notify configuration is not set or if it doesn't contain a configuration for the specific status or type it returns without raising any notifications.
   * The notify configuration can either be set by status (using the status as the key) or by type (either error or success), in which case it will trigger
   * distinct notifications for successful or unsuccessful responses.
   * Under the status or type key the content of the notification may be a string (which will be used as the notification title) or an object containing both
   * message and title properties for the notification to show.
   * @param {object} config           - The axios configuration object
   * @param {number} [status=500]     - The HTTP status code from the response object
   * @param {string} [type='error']   - The resulting intended behaviour corresponding to the status
   * @example
   *  const status = response.status // from the axios response object
   *  const status = response.status.match(/^[3, 4, 5]/) ? 'error' : 'success' // from the axios response object
   *  const config = {
   *    ...,
   *    notify: {
   *       '200': 'Success!',
   *       '500': 'Error!',
   *       'success': {
   *          'title': 'Success',
   *          'message': 'For any other success status other than 200'
   *        },
   *       'error': {
   *          'title': 'Error',
   *          'message': 'For any other error status other than 500'
   *        }
   *        '304': {
   *          'title': 'Success',
   *          'message': 'Content Not Modified',
   *          'type': 'success'
   *        }
   *    }
   *  }
   *
   *  responseHandler(config, status, type)
   */
  _responseHandler = ({ notify }, status = 500, type = 'success') => {
    if (status === 401) {
      if (this._unauthorized.notification) Notify({ ...this._configuration.notification, title: this._unauthorized.notification, type })
      if (this._unauthorized.cb) this._unauthorized.cb()
    }
    if (!notify || (!notify[status] && !notify[type])) return
    const notifyContent = notify[status] || notify[type]
    const message = notifyContent.message || ''
    const title = notifyContent.title || notifyContent
    Notify({
      ...this._configuration.notification,
      title,
      message,
      type: notifyContent.type || type
    })
  }

  /**
   * Static function that sets a base axios instance for each Services instance which can be used for performing axios requests
   * using a full url path instead of using the baseURL configured for the specific instance
   */
  _createBaseInstance () {
    this._baseInstance = axios.create(this._configuration.axios)
    this._baseInstance.interceptors.response.use(
      this._successHandler,
      this._errorHandler
    )
    this._services.add('_baseInstance')
  }

  /**
   * Add function that sets a new axios instance to the Services instance. It uses the name for easy access of the instance so
   * axios requests can be performed through the class instance (i.e: services['service-name'].get()). It will use the name as the
   * endpoint for the request if no endpoint is set in the configuration
   * @param {string} name                     - The name of the endpoint used for accessing the axios instance
   * @param {object} [configuration]          - The custom axios configuration for this specific endpoint
   * @param {string} [configuration.endpoint] - The partial url for this specific endpoint (will be concat with the Services instance baseURL)
   */
  add (name, { endpoint, ...config } = {}) {
    const baseURL = `${config.baseURL || this._configuration.axios.baseURL}${
      endpoint || `/${name}`
    }`
    const service = axios.create({
      ...merge(config, this._configuration.axios),
      baseURL
    })
    service.interceptors.response.use(this._successHandler, this._errorHandler)
    this._services.add(name)
    this[name] = service
  }

  /**
   * Set token function that allows a token to be set to either a specific service from the Services instance o to all of them at the same time
   * @param {string} token           - The token that has to be set
   * @param {string} [name]          - The name of the service we want to set the token to. If no name is specified all the services will be set with the token
   */
  setToken (token, name) {
    if (name) {
      this[name].defaults.headers.Authorization = `Bearer ${token}`
    } else {
      this._services.forEach((service) => {
        this[service].defaults.headers.Authorization = `Bearer ${token}`
      })
    }
  }

  setUnauthorizedCallback (callback) {
    this._unauthorized.cb = () => {
      return callback()
    }
  }
}

export default Services
