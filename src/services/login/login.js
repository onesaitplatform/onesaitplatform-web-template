import { api } from '@/store'
import Vue from 'vue'

import VueI18n from 'vue-i18n'
import messages from './lang'
import { notifierFactory } from '@/utils/notifier'

Vue.use(VueI18n)
const i18n = new VueI18n(messages)
const notifier = notifierFactory(i18n)

// A LIST OF SERVICES RELATED TO LOGIN PROCESS *************************************************************

/**
 * @typedef {Object} member
 * @property {array} member - A list of realms (apps) where current user has at least one role, so is valid.
 */

/**
 * Controller for the GET MEMBER service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the list
 * of REALMS related to current user.
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {GetDatatasourcesResponse} - An object containing data and the list of realms
 */
export const member = async (params, config = {}) => {
  const notify = notifier('member', ['error'])
  const { data: member } = await api.platform.get('/realms/member', {
    ...config,
    notify
  })
  return member || []
}

export default {
  member
}
