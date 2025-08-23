export const useDateFormat = () => {
  const formatDate = (date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date

      if (Number.isNaN(dateObj.getTime())) {
        console.warn('Invalid date provided to formatDate:', date)
        return '無效日期'
      }

      switch (format) {
        case 'short':
          return dateObj.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })

        case 'long':
          return dateObj.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })

        case 'relative':
          return getRelativeDate(dateObj)

        default:
          return dateObj.toLocaleDateString('zh-TW')
      }
    }
    catch (error) {
      console.error('Date formatting error:', error)
      return '格式錯誤'
    }
  }

  const formatDateTime = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date

      if (Number.isNaN(dateObj.getTime())) {
        return '無效日期時間'
      }

      return dateObj.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    }
    catch (error) {
      console.error('DateTime formatting error:', error)
      return '格式錯誤'
    }
  }

  const getRelativeDate = (date: Date): string => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))

    if (diffInDays > 7) {
      return formatDate(date, 'short')
    }
    else if (diffInDays > 0) {
      return `${diffInDays} 天前`
    }
    else if (diffInHours > 0) {
      return `${diffInHours} 小時前`
    }
    else if (diffInMinutes > 0) {
      return `${diffInMinutes} 分鐘前`
    }
    else {
      return '剛剛'
    }
  }

  const isToday = (date: Date | string): boolean => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const today = new Date()

    return dateObj.getDate() === today.getDate()
      && dateObj.getMonth() === today.getMonth()
      && dateObj.getFullYear() === today.getFullYear()
  }

  const isSameMonth = (date1: Date | string, date2: Date | string): boolean => {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2

    return d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()
  }

  const getDaysFromNow = (date: Date | string): number => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffInMs = dateObj.getTime() - now.getTime()
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
  }

  const formatDateRange = (startDate: Date | string, endDate: Date | string): string => {
    const start = formatDate(startDate, 'short')
    const end = formatDate(endDate, 'short')
    return `${start} - ${end}`
  }

  return {
    formatDate,
    formatDateTime,
    getRelativeDate,
    isToday,
    isSameMonth,
    getDaysFromNow,
    formatDateRange,
  }
}
