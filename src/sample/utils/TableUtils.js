import { previousQueryUrl } from '@/router'
import { map } from 'lodash-es'

class TableUtils {
  renderRow(rows, header) {
    if (!rows || !rows.length) return []

    const fields = map(header, 'name')
    const renderRows = [...rows]
    renderRows.forEach((row) => {
      this.replaceEmptyData(fields, row)
    })
    return renderRows
  }

  replaceEmptyData(fields, row) {
    fields.forEach((filed) => {
      if (!row[filed]) {
        row[filed] = row[filed] === 0 ? 0 : '-'
      }
    })
  }

  querySetting({
                 filter,
                 inputFilter = '',
                 regDate = null,
                 sendDate = null,
                 postDate = null,
                 tab = null,
                 page = 1,
                 size = 15
               }) {
    const query = {
      ...Object.fromEntries(Object.entries(filter).map(([key, obj]) => [key, obj.value])),
      regFrom: regDate?.from,
      regTo: regDate?.to,
      sendFrom: sendDate?.from,
      sendTo: sendDate?.to,
      postFrom: postDate?.from,
      postTo: postDate?.to,
      tab,
      inputFilter,
      page,
      size
    }
    Object.keys(query).forEach((key) => query[key] ?? delete query[key])

    // 상세 > 목록 처리 부분
    const newQueryString = new URLSearchParams(query).toString()
    previousQueryUrl.value = `${window.location.pathname}?${newQueryString}`

    return query
  }
}

export default new TableUtils()
