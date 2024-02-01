import { api } from '@/store'
import Vue from 'vue'

import VueI18n from 'vue-i18n'
import messages from './lang'
import { notifierFactory } from '@/utils/notifier'

Vue.use(VueI18n)
const i18n = new VueI18n(messages)
const notifier = notifierFactory(i18n)

/**
 * @typedef {Object} GetDatasourcesResponse
 * @property {array} datasources - A list of datasources
 */

/**
 * @typedef {Object} GetDatasourceFieldsResponse
 * @property {Array} fields - A list of datasource fields
 */

/**
 * Controller for the GET datasources service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the list
 * of Datasources
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {GetDatatasourcesResponse} - An object containing the list of Datasources
 */
export const getDatasources = async (params, config = {}) => {
  const notify = notifier('getDatasources', ['error'])
  const { data: datasources } = await api.platform.get('/gadgetdatasources/', {
    ...config,
    notify
  })
  return datasources
}

/**
 * Controller for the GET datasource fields service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an array of fields
 * @param {string} id               - Id of Datasource that is needed recover data
 * @param {RequestConfiguration}    - Custom axios configuration that is used to control the behaviour of the request
 * @return {GetDatasourceFieldsResponse} - An array containing a list of Datasource fields
 */
export const getDatasourceFields = async (id, config = {}) => {
  const notify = notifier('getDatasourceFields', ['error'], { id })
  const { data: fields } = await api.platform.get(
    `/gadgetdatasources/getFields/${id}`,
    { ...config, notify }
  )
  return fields
}

export default {
  getDatasources,
  getDatasourceFields
}
