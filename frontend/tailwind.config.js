/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // 品牌色彩系統
      colors: {
        // 主色調 - 深藍色系（信任、專業、金融）
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af', // 主色
          900: '#1e3a8a',
          950: '#172554',
        },
        // 功能色彩
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669', // 收入/成功色
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626', // 支出/危險色
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706', // 警告色
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
      },
      // 字體配置
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      // 間距系統
      spacing: {
        18: '4.5rem', // 72px
        88: '22rem', // 352px
        100: '25rem', // 400px
        112: '28rem', // 448px
        128: '32rem', // 512px
      },
      // 圓角系統
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      // 陰影系統
      boxShadow: {
        card: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        elevated: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        soft: '0 2px 15px -3px rgb(0 0 0 / 0.07), 0 10px 20px -2px rgb(0 0 0 / 0.04)',
      },
      // 動畫
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'bounce-gentle': 'bounce-gentle 2s infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
      },
      // 背景漸層
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        'gradient-success': 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        'gradient-soft': 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      },
    },
  },
  plugins: [
    // 添加自定義工具類
    function ({ addUtilities }) {
      const newUtilities = {
        // 按鈕基礎樣式
        '.btn-base': {
          '@apply inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed': {},
        },
        '.btn-primary': {
          '@apply btn-base bg-primary-800 hover:bg-primary-700 text-white focus:ring-primary-500 h-12 px-6': {},
        },
        '.btn-secondary': {
          '@apply btn-base bg-white hover:bg-gray-50 text-primary-800 border-2 border-primary-800 focus:ring-primary-500 h-12 px-6': {},
        },
        '.btn-danger': {
          '@apply btn-base bg-danger-600 hover:bg-danger-700 text-white focus:ring-danger-500 h-12 px-6': {},
        },
        // 卡片樣式
        '.card': {
          '@apply bg-white rounded-xl shadow-card border border-gray-200/50': {},
        },
        '.card-elevated': {
          '@apply bg-white rounded-xl shadow-elevated border border-gray-200/50': {},
        },
        // 輸入框樣式
        '.input-base': {
          '@apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200': {},
        },
        '.input-error': {
          '@apply border-danger-300 text-danger-900 placeholder-danger-300 focus:ring-danger-500': {},
        },
        // 文字樣式
        '.text-brand': {
          '@apply bg-gradient-brand bg-clip-text text-transparent': {},
        },
        // 觸控優化（移動端）
        '.touch-target': {
          '@apply min-h-[44px] min-w-[44px]': {}, // 符合 iOS/Android 觸控標準
        },
      }

      addUtilities(newUtilities)
    },
  ],
}
