import { api } from '@/store'
import Vue from 'vue'

import VueI18n from 'vue-i18n'
import messages from './lang'
import { notifierFactory } from '@/utils/notifier'
import { getResourcesByTag, addResourcesByTag } from '@/services/tags/tags'

Vue.use(VueI18n)
const i18n = new VueI18n(messages)
const notifier = notifierFactory(i18n)

/**
 * @typedef {Object} GetDashboardsResponse
 * @property {array} dashboards - A list of dashboards
 */

/**
 * @typedef {Object} GetDashboardResponse
 * @property {Object} dashboard - A single Dashboard
 */

/**
 * @typedef {Object} GetCategoriesResponse
 * @property {array} categories - A list of Categories
 */

/**
 * @typedef {Object} PostDashboardResponse
 * @property {object} dashboard - The new Dashboard that has been created
 */

/**
 * @typedef {Object} PutDashboardResponse
 * @property {object} dashboard - The Dashboard that has been updated
 */

/**
 * @typedef {Object} GetFavDashboardsResponse
 * @property {array} dashboards - A list of fav dashboards
 */

/**
 * @typedef {Object} RequestConfiguration
 * @property {object} params  - Query params used for the request such as filters, queries and so on
 * @property {boolean} notify - Sets whether the notification system should or should not be used
 */

/**
 * Controller for the GET dashboards service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the list
 * of Dashboards
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @param {string} queryParams    - Params that is needed recover data
 * @return {GetDashboardsResponse} - An object containing the list of Dashboards
 */
export const getDashboards = async (config = {}) => {
  const notify = notifier('getDashboards', ['error'])
  const { data: dashboards } = await api.platform.get(
    '/dashboards',
    { params: config },
    { notify }
  )
  // generic filters using tags
  // if options contains filter key , then apply, if not just only identification.
  if (config.filter !== '') {
    console.log(' TAG SYSTEM ENABLED: ', config.filter)
    const resources = await getResourcesByTag(config.filter, 'Dashboard')
    const resourcesList = resources.length > 0 ? resources.map(x => x.name) : []
    return resourcesList.length > 0 ? dashboards.filter((d) => (resourcesList.includes(d.identification))) : []
  } else {
    // no filter using tags
    return dashboards.filter((d) => d.identification !== 'gadget-dashboard')
  }
}

/**
 * Controller for the GET dashboard service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns a single Dashboard
 * @param {string} id               - Id of Dashboard that is needed recover data
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {GetDashboardResponse} - An object containing a single Dashboard
 */
export const getDashboard = async (id, config = {}) => {
  const notify = notifier('getDashboard', ['error'], { id })
  const { data: dashboard } = await api.platform.get(
    `/dashboards/dashboard/${id}`,
    { ...config, notify }
  )
  return dashboard
}

/**
 * Controller for the POST dashboard service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the new Dashboard that has been created
 * @param {form} body             - The Dashboard data which will be sent within the request
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {PostDashboardResponse}  - An object containing the new Dashboard
 */
export const createDashboard = async (body, config) => {
  const notify = notifier('createDashboard', ['error', 'success'])
  const { data: dashboard } = await api.platform.post('/dashboards', body, {
    ...config,
    notify
  })
  // id tag system enable, after return dashboard, add dashboard to the tag system
  if (config?.tag) {
    console.log(' TAG SYSTEM ENABLED: ', config.tag)
    const body = [{ name: config.tag, resourceId: dashboard.id }]
    const resources = await addResourcesByTag(body)
    console.log('createDashboard, add dashboard to tag system: ', config.tag, 'resource: ', resources)
  }
  return dashboard
}

/**
 * Controller for the PUT dashboard service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the updated Dashboard
 * @param {string} id         - The id of the Dashboard that should be modified
 * @param {form} body         - The form parameters needed to perform the update
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {PutDashboardResponse}  - An object containing the updated Dashboard
 */
export const updateDashboard = async (id, body, config) => {
  const notify = notifier('updateDashboard', ['error', 'success'], { id })
  const { data: dashboard } = await api.platform.put(
    `/dashboards/${id}`,
    body,
    { ...config, notify }
  )
  return dashboard
}

/**
 * Controller for the GET and POST dashboard service. This method performs the request regarding the configuration and
 * parameters passed as arguments and create a copy of an existing Dashboard
 *  @param {string} id       - Id of Dashboard that is needed to recover data
 * @param {form} body        - Some custom parameters for the new Dashboard copy data which will be sent within the request
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {PostDashboardResponse} - An object containing a raw single Dashboard
 */
export const copyDashboard = async (id, body, config = {}) => {
  const notify = notifier('copyDashboard', ['error', 'success'], { id })
  const { data: dashboard } = await api.platform.get(
    `/dashboards/export/${id}`,
    { ...config }
  )
  const copy = { ...dashboard, ...body }
  const { data: newDashboard } = await api.platform.post(
    '/dashboards/import',
    copy,
    { ...config, notify }
  )
  return newDashboard
}

/**
 * Controller for the GET and POST dashboard service. This method performs a clone of the dashboard select with a new indetification
 *  @param {string} id       - Id of Dashboard that is needed to recover data
 * @param {form} body        - Some custom parameters for the new Dashboard: current identification and the new identification
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {PostDashboardResponse} - An object containing a raw single Dashboard
 */
export const cloneDashboard = async (id, body, config) => {
  const notify = notifier('copyDashboard', ['error', 'success'], { id })
  const { data: newDashboard } = await api.platform.post(
    '/dashboards/clone?identification=' + body.identification + '&newIdentification=' + body.newIdentification,
    {},
    { ...config, notify }
  )
  return newDashboard
}

/**
 * Controller for the DELETE dashboard service. This method performs the request regarding the configuration and
 * parameters passed as arguments and delete a single Dashboard
 * @param {string} id               - Id of Dashboard that is needed recover data
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 */
export const deleteDashboard = async (id, config = {}) => {
  const notify = notifier('deleteDashboard', ['error', 'success'], { id })
  const response = await api.platform.delete(`/dashboards/${id}`, {
    ...config,
    notify
  })
  return response
}

/**
 * Controller for the GET dashboard image service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns a single Dashboard
 * @param {string} id               - Id of Dashboard that is needed recover data
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {GetDashboardResponse} - An object containing a single Dashboard
 */
export const getDashboardImage = async (id, config = {}) => {
  // const notify = notifier('getDashboard', ['error'], { id })
  const response = await api.platform.get(
    `/dashboards/dashboard/generateDashboardImage/${id}`,
    { responseType: 'blob', ...config }
  )
  return response
}

/**
 * Controller for the GET fav dashboards service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns a list of dashboards
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {GetFavDashboardsResponse} - An object containing the list of fav Dashboards
 */
export const getFavDashboards = async (config = {}) => {
  const notify = notifier('getFavDashboards', ['error'])
  const { data: dashboards } = await api.platform.get(
    '/favorites/?type=DASHBOARD',
    { ...config, notify }
  )
  return dashboards
}

/**
 * Controller for the POST fav dashboard service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an empty object
 * @param {string} id             - The id of the Dashboard which will be sent within the request
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 */
export const addFavDashboard = async (id, config) => {
  const body = { identification: id, type: 'DASHBOARD' }
  const notify = notifier('addFavDashboard', ['error', 'success'], { id })
  const response = await api.platform.post('/favorites/', body, {
    ...config,
    notify
  })
  return response
}

/**
 * Controller for the DELETE fav dashboard service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an empty object
 * @param {string} id             - The id of the Dashboard which will be sent within the request
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 */
export const removeFavDashboard = async (id, config) => {
  const notify = notifier('removeFavDashboard', ['error', 'success'], { id })
  const response = await api.platform.delete(
    `/favorites/${id}/type/DASHBOARD`,
    { ...config, notify }
  )
  return response
}

/**
 * Controller for the GET categories service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the list
 * of Categories
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {GetCategoriesResponse} - An object containing the list of Categories
 */
export const getCategories = async (config = {}) => {
  const { data: categories } = await api.platform.get('/categories', {
    params: config
  })
  return categories
}

export default {
  getDashboards,
  getDashboard,
  createDashboard,
  updateDashboard,
  copyDashboard,
  deleteDashboard,
  getDashboardImage,
  getFavDashboards,
  addFavDashboard,
  removeFavDashboard,
  getCategories
}
