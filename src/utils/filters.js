import Vue from 'vue'
import {
  Capitalize,
  FormatNumber,
  FormatPercentage,
  Trim,
  FormatDate,
  ToUpperCase,
  TruncateText
} from '../utils/functions'

export const FormatDateFilter = {
  filters: { formatDate: FormatDate }
}

export const FormatNumberFilter = {
  filters: { formatNumber: FormatNumber }
}

export const FormatPercentageFilter = {
  filters: { formatPercentage: FormatPercentage }
}

export const CapitalizeFilter = {
  filters: { capitalize: Capitalize }
}

export const TrimFilter = {
  filters: { trim: Trim }
}

export const ToUpperCaseFilter = {
  filters: { toUpperCase: ToUpperCase }
}

export const FormatNullValuesFilter = {
  filters: {
    formatNullValues (value) {
      return value || '-'
    }
  }
}

export const TruncateTextFilter = {
  filters: { truncate: TruncateText }
}

Vue.filter('truncate', TruncateText)
