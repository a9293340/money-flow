export const useCurrency = () => {
  const formatCurrency = (amount: number | undefined | null, currency: string = 'TWD'): string => {
    try {
      // Handle undefined, null, or non-numeric values
      if (amount === undefined || amount === null || Number.isNaN(Number(amount))) {
        return '載入中...'
      }

      const numericAmount = Number(amount)

      // Currency formatting options
      const formatOptions: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }

      // Special handling for different currencies
      switch (currency.toUpperCase()) {
        case 'TWD':
          return new Intl.NumberFormat('zh-TW', formatOptions).format(numericAmount)
        case 'USD':
          return new Intl.NumberFormat('en-US', formatOptions).format(numericAmount)
        case 'EUR':
          return new Intl.NumberFormat('en-EU', formatOptions).format(numericAmount)
        case 'JPY':
          return new Intl.NumberFormat('ja-JP', {
            ...formatOptions,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(numericAmount)
        case 'CNY':
          return new Intl.NumberFormat('zh-CN', formatOptions).format(numericAmount)
        default:
          return new Intl.NumberFormat('en-US', formatOptions).format(numericAmount)
      }
    }
    catch (error) {
      // Fallback for unsupported currencies
      console.warn(`Currency formatting failed for ${currency}:`, error)
      return `${currency} ${Number(amount).toLocaleString()}`
    }
  }

  const getCurrencySymbol = (currency: string = 'TWD'): string => {
    const symbols: Record<string, string> = {
      TWD: 'NT$',
      USD: '$',
      EUR: '€',
      JPY: '¥',
      CNY: '¥',
    }
    return symbols[currency.toUpperCase()] || currency.toUpperCase()
  }

  const parseCurrencyInput = (value: string): number => {
    // Remove currency symbols and spaces, keep only numbers and decimal point
    const cleanValue = value.replace(/[^0-9.-]/g, '')
    const parsed = Number.parseFloat(cleanValue)
    return Number.isNaN(parsed) ? 0 : parsed
  }

  return {
    formatCurrency,
    getCurrencySymbol,
    parseCurrencyInput,
  }
}
