import dayjs from 'dayjs'

export default {
  install: (App) => {
    App.config.globalProperties.$dayjs = dayjs
  }
}
