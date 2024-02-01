import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
require('dayjs/locale/es')

dayjs.extend(timezone)
dayjs.extend(utc)
dayjs.extend(localizedFormat)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

export const Capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
export const ToUpperCase = (string) => string.toUpperCase()
export const StringToHours = (string) => string ? string.split(':').reduce((acc, val, index) => acc + Number(val) / 60 ** index, 0) : ''
export const HoursToString = (hours) => hours ? dayjs(`${Math.trunc(hours)}:${(hours * 60) % 60}`, 'HH:mm') : '00:00'
export const FormatPercentage = (number, decimals = 0, options = {}) => {
  if (isNaN(Number(number))) return '-'
  const options_ = {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
    ...options
  }
  return `${Number(number * 100).toLocaleString(
    navigator.language,
    options_
  )} %`
}

export const Trim = (string, chars) => {
  if (!string || string.length < chars || typeof string !== 'string') return string
  return `${string.substr(0, chars)}...`
}

/**
 * Converts a date value into the format given
 * @param {date} date - The date value to be formatted
 * @param {string} outputFormat - The expected output format
 * @param {string} lang - The current language
 * @returns {string} - A date with the expected format
 */
export const FormatDate = (date, outputFormat = 'DD.MM.YY', lang = 'es') => {
  if (!date || !dayjs(date).isValid()) return '-'
  return dayjs(date).locale(lang).format(outputFormat)
}

/**
 * Converts a date value into another given a specific timezone
 * @param {date} date - The date value to be changed.
 * @param {string} timezone - The value of current timezone.
 * @returns {date} - A day containing the new value
 */
export const DateByTimezone = (date, timezone) => {
  dayjs.tz.setDefault(timezone)
  const d = date ? dayjs.tz(date) : dayjs.tz()
  return d.add(d.utcOffset(), 'minutes')
}

/**
 * Converts an object into table format, ie: an array of objects where each item contains the original
 * property as the value for the field property, and the original value of such porperty as the value
 * for the 'value' property.
 * @param {object} data - The object to be converted into table format.
 * @returns {array} - The array containing the formatted object
 * @example
 *      const data = { a: 1, b: 2 }
 *      const table = ObjectToTable(data) // [{ field: 'a', value: 1 }, { field: 'b', value: 2 }]
 */
export const ObjectToTable = (data) => {
  return Object.keys(data).map((field) => ({ field, value: data[field] }))
}

/**
 * Formats an input number to the navigator locale representation using a fixed number of
 * decimals and extending the toLocaleString options. If the input value is not a number
 * it returns '-'
 * @param {number} number - The input number to be formatted.
 * @param {number} decimals - The number of decimal places to keep.
 * @param {object} options - Options to be passed to the toLocaleString native function.
 * @returns {string} A string containing the formatted number or '-' if the input value is not a number.
 */
export const FormatNumber = (number, decimals = 0, options = {}) => {
  const localNumber = String(number).replace(/,/g, '.')
  if (isNaN(Number(localNumber))) return '-'
  const options_ = {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
    ...options
  }
  // In some cases language es-ES omits the million point indicator so we switch to the de-DE instead
  const lang = navigator.language === 'es-ES' ? 'de-DE' : navigator.language
  if (options.numeric) {
    return Number(
      String(Number(localNumber).toFixed(decimals)).replace(/,/g, '.')
    )
  }
  return Number(localNumber).toLocaleString(lang, options_)
}

/**
 * Truncate long text
 * @param {string} text - The text to be truncated.
 * @param {number} length - The length of characters to be shown.
 * @param {string} clamp - The ellipsis string.
 * @returns {string} A string containing the html truncated text.
 */
export const TruncateText = (text, length, clamp = '...') => {
  const node = document.createElement('div')
  node.innerHTML = text
  const content = node.textContent
  return content.length > length ? content.slice(0, length) + clamp : content
}

/**
 * Generates a password
 * @param {number} length - The length of the pass.
 */
export const RandomPass = (length = 10) => {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  for (let i = 1; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result + Math.floor(Math.random() * 10)
}
