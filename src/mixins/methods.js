import dayjs from 'dayjs'
import {
  Capitalize,
  FormatNumber,
  Trim,
  FormatDate,
  FormatPercentage,
  ObjectToTable,
  DateByTimezone,
  TruncateText,
  RandomPass
} from '../utils/functions'

export const FormatNumberMethod = {
  methods: { formatNumber: FormatNumber }
}

export const FormatPercentageMethod = {
  methods: { formatPercentage: FormatPercentage }
}

export const FormatDateMethod = {
  methods: { formatDate: FormatDate }
}

export const CapitalizeMethod = {
  methods: { capitalize: Capitalize }
}

export const TrimMethod = {
  methods: { trim: Trim }
}

export const ObjectToTableMethod = {
  methods: { objectToTable: ObjectToTable }
}

export const TruncateTextMethod = {
  methods: { truncate: TruncateText }
}

export const RandomPassMethod = {
  methods: { randomPass: RandomPass }
}

function search (regExp, element, key) {
  const type = typeof element
  switch (type) {
    case 'string':
      return element.match(regExp)
    case 'number':
      return String(element).match(regExp)
    case 'boolean':
      return element && String(key).match(regExp)
    case 'object':
      for (var _key in element) {
        if (!Object.prototype.hasOwnProperty.call(element, _key)) continue
        const match = search(regExp, element[_key], _key)
        if (match) return true
      }
  }
  return false
}

export const SearchMethod = {
  methods: {
    search (content, query) {
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regExp = new RegExp(escapedQuery, 'gi')
      return content.filter((element) => search(regExp, element))
    }
  }
}

export const ServiceSortingMethod = {
  methods: {
    serviceSorting (queries) {
      return queries.reduce(
        (query, { field, order }, i) =>
          query +
          `sort=${field},${order}${i !== queries.length - 1 ? '&' : ''}`,
        ''
      )
    }
  }
}

export const TimeToHoursMethod = {
  methods: {
    timeToHours (time) {
      return (
        time &&
        time
          .split(':')
          .reduce((acc, val, index) => acc + Number(val) / 60 ** index, 0)
      )
    }
  }
}

export const HoursToTimeMethod = {
  methods: {
    hoursToTime (hours) {
      return dayjs(`${Math.trunc(hours)}:${(hours * 60) % 60}`, 'HH:mm')
    }
  }
}

export const DownloadFileMethod = {
  methods: {
    downloadFile ({ file, name, ext, contentType }) {
      const downloadLink = window.document.createElement('a')
      downloadLink.href = window.URL.createObjectURL(
        new Blob([file], { type: contentType })
      )
      downloadLink.download = ext ? `${name}.${ext}` : name
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }
}

export const DateByTimezoneMethod = {
  methods: { dateByTimezone: DateByTimezone }
}
