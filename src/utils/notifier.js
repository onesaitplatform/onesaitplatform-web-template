export const notifierFactory = (i18n) => (path, types, options, duration) =>
  types.reduce((notifications, type) => {
    notifications[type] = {
      title: i18n.t(`${path}.${type}.title`),
      message: i18n.t(`${path}.${type}.message`, options),
      duration: duration || '0'
    }
    return notifications
  }, {})
