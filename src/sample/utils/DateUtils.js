import dayjs from 'dayjs'

class DateUtils {
  constructor() {
    this.today = dayjs()
  }

  getToday() {
    return this.today
  }

  getTomorrow() {
    return this.getToday().add(1, 'day')
  }

  getMonth() {
    return this.getToday().month() + 1
  }

  getWeekNumberByFirst(date) {
    if (!date) return
    const $date = dayjs(date)

    const startOfMonth = $date.date(1)
    const weekDay = startOfMonth.day() // 0: Sun ~ 6: Sat
    return Math.ceil((weekDay - 1 + $date.date()) / 7 + 1) - 1
  }

  getWeekNumberByThursday(date) {
    if (!date) return
    const $date = dayjs(date)
    const THURSDAY_NUM = 4

    const startOfMonth = $date.date(1)
    const startOfWeek = startOfMonth.day() // 0: Sun ~ 6: Sat

    let firstThursday = 1 + THURSDAY_NUM - startOfWeek // 첫째주 목요일
    if (firstThursday <= 0) {
      firstThursday = firstThursday + 7 // 한주는 7일
    }
    const untilDateOfFirstWeek = firstThursday - 7 + 3
    const weekNum = Math.ceil(($date.date() - untilDateOfFirstWeek) / 7) - 1

    if (weekNum < 0) {
      const lastDateOfMonth = $date.date(0)
      return this.getWeekNumberByThursday(lastDateOfMonth)
    }

    return weekNum + 1
  }

  convertDateFormat(date, dataFormat = 'YYYY-MM-DD', targetFormat = 'YYYY/MM/DD') {
    return dayjs(date, dataFormat).format(targetFormat)
  }

  convertDateFormatNullCheck(date, dataFormat = 'YYYY-MM-DD') {
    const parsed = dayjs(date, dataFormat, true);
    return parsed.isValid() ? parsed.format('YYYY-MM-DD') : '-';
  }

  convertStandardDate(date) {
    const replaceDate = date?.replace('-', '')
    return replaceDate
      ? this.convertDateFormat(replaceDate, 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm')
      : '-'
  }

  startDateDiffByToday(startDt) {
    const startDate = dayjs(startDt, 'YYYY-MM-DD')
    return this.today.diff(startDate, 'd') > 0 ? this.today.format('YYYY-MM-DD') : startDt
  }

  convertDateType(type) {
    const today = this.getToday()

    let fromDate, toDate

    switch (type) {
      case 'today':
        fromDate = toDate = this.convertDateFormat(today)
        break
      case 'week':
        fromDate = this.convertDateFormat(today.subtract(7, 'days'))
        toDate = this.convertDateFormat(today)
        break
      case '2week':
        fromDate = this.convertDateFormat(today.subtract(14, 'days'))
        toDate = this.convertDateFormat(today)
        break
      case 'month':
        fromDate = this.convertDateFormat(today.startOf('month'))
        toDate = this.convertDateFormat(today)
        break
      case '3month':
        fromDate = this.convertDateFormat(today.subtract(3, 'months').startOf('month'))
        toDate = this.convertDateFormat(today)
        break
      case '6month':
        fromDate = this.convertDateFormat(today.subtract(6, 'months').startOf('month'))
        toDate = this.convertDateFormat(today)
        break
      case 'year':
        fromDate = this.convertDateFormat(today.startOf('year'))
        toDate = this.convertDateFormat(today)
        break
      default:
        fromDate = toDate = null
        break
    }

    return { from: fromDate, to: toDate }
  }
}

export default new DateUtils()
