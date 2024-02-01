import { CancelToken } from 'axios'

export const CancelRequest = {
  data () {
    return {
      /**
       * @property {object} $_executors - An object for storing the cancel executors created
       * by the getCancelToken(<executor key>) function in the form [<executor key>]: executor
       */
      $_executors: {}
    }
  },

  methods: {
    /**
     * Creates a new Cancel Token (https://github.com/axios/axios#cancellation) and stores the executor
     * in the executors object under the specified key. It returns the Cancel Token for the request
     * configuration.
     * @param {string} key - The name we want the executor to be stored under. Defaults to 'default'.
     * @returns {CancelToken} - The Cancel Token associated to the executor. This needs to be provided
     * to the request configuration.
     * @example
     *      const cancelToken = this.getCancelToken('request A')
     *      axios.get('...url', { cancelToken })
     */
    getCancelToken (key = 'default') {
      return new CancelToken(
        function executor (c) {
          // As $_executors is private it is not exposed to the component's root context
          this.$data.$_executors[key] = c
        }.bind(this)
      )
    },

    /**
     * Calls an executor function that has been previously stored in the
     * executors data object. After the executor has been called it is
     * removed from the object.
     * @param {string} key - The name of the executor to be called (ie: the name
     * of the request that is to be canceled). Defaults to 'default'.
     * @example
     *      this.cancelRequest('request A')
     */
    cancelRequest (key = 'default') {
      // As $_executors is private it is not exposed to the component's root context
      this.$data.$_executors[key] && this.$data.$_executors[key]()
      delete this.$data.$_executors[key]
    }
  }
}
