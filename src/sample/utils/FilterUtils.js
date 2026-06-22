class FilterUtils {
  filterOptionsConverter(options) {
    return options.map((option) => ({
      label: option.dtlCdNm,
      value: option.dtlCd
    }))
  }

  filterConverter(filterList, filterModel) {
    Object.keys(filterList).forEach((key) => {
      if (Object.keys(filterModel).includes(key)) {
        filterModel[key] = this.filterOptionsConverter(filterList[key])
      }
    })
    return filterModel
  }

  parseFilterArray(filterArray) {
    return Object.entries(filterArray).reduce((acc, [key, option]) => {
      // 배열이 아닌 단일 객체인 경우
      if (
        option &&
        typeof option === 'object' &&
        !Array.isArray(option) &&
        'dtlCdNm' in option &&
        'dtlCd' in option
      ) {
        acc[key] = { label: option.dtlCdNm, value: option.dtlCd }
      }
      // 배열인 경우
      else if (Array.isArray(option)) {
        acc[key] = option.map((item) => {
          // 배열의 각 항목이 객체라면 변환
          if (item && typeof item === 'object' && 'dtlCdNm' in item && 'dtlCd' in item) {
            return { label: item.dtlCdNm, value: item.dtlCd }
          }
          // 객체가 아니라면 원본을 그대로 사용
          return item
        })
      }
      // 배열도 아니고 객체도 아닌 경우 그대로 값을 복사
      else {
        acc[key] = option
      }
      return acc
    }, {})
  }

  findSelectOptions(options) {
    return Object.fromEntries(Object.entries(options)
      .filter(([_, item]) => item.value).map(([key, item]) => [key, item.value]))
  }
}

export default new FilterUtils()
