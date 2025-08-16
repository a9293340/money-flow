/**
 * Chart.js 客戶端插件配置
 * 只在瀏覽器端載入 Chart.js
 */

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from 'chart.js'

export default defineNuxtPlugin(() => {
  // 註冊所有需要的 Chart.js 組件
  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
  )
})
