/* eslint-disable */
const HELPER = {}

/**
 * Deep-Clone an Object
 * @param obj
 * @returns {any}
 */
HELPER.cloneDeep = function (obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Find-Deep in Array
 * @param arr
 * @returns {object}
 */
HELPER.findDeep = function (id, currentNode, prop, children) {
  var i, currentChild, result

  if (id == currentNode[prop]) {
      return currentNode
  } else {
    // Use a for loop instead of forEach to avoid nested functions
    // Otherwise "return" will not work properly
    for (i = 0; i < currentNode[children].length; i += 1) {
      currentChild = currentNode[children][i]

      // Search in the current child
      result = HELPER.findDeep(id, currentChild, prop, children)

      // Return the result if the node has been found
      if (result !== false) {
        return result
      }
    }

    // The node has not been found and we have no more options
    return false
  }
}

/**
 * Get UUIDv4
 * @returns {String}
 */
HELPER.getUUIDv4 = function () {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

/**
 * Find inside object/array by a specific rule
 * @param {Array|Object} collection
 * @param {string} ruleKey
 * @param {string} value
 * @returns {any|undefined} first item that matched the rule or undefined
 * @complexity O(n) for normal cases, best case will be O(1) or O(logn)
 */
HELPER.find = function (collection, ruleKey, value) {
  // Only array has `length` property
  if (collection.length) {
    // array
    return collection.find(item => item[ruleKey] == value)
  }

  // object traversal
  const keys = Object.keys(collection)
  for (const objKey of keys) {
    const data = collection[objKey]
    if (data && data[ruleKey] == value) {
      return data
    }
  }

  return undefined
}

/**
 * Find array by a specific rule and return the index
 * @param {Array} array
 * @param {string} ruleKey - If it's undefined, we check the item only
 * @param {string} value
 * @returns {number} first item that matched the rule or -1
 * @complexity O(n) for normal cases, best case will be O(1) or O(logn)
 */
HELPER.findIndex = function (array, ruleKey, value) {
  return array.findIndex(item => {
    if (!ruleKey) { return item == value }

    return item[ruleKey] == value
  })
}

export { HELPER }
