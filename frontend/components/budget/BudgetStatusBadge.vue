<template>
  <span
    class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
    :class="getBadgeClasses()"
  >
    <svg
      v-if="showIcon"
      class="w-3 h-3 mr-1"
      :class="getIconClasses()"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        :d="getIconPath()"
      />
    </svg>
    {{ getStatusText() }}
  </span>
</template>

<script setup lang="ts">
interface Props {
  status: 'active' | 'inactive' | 'completed' | 'exceeded'
  warningLevel?: 'safe' | 'warning' | 'danger' | 'exceeded'
  type?: 'status' | 'warning'
  showIcon?: boolean
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'status',
  showIcon: false,
  size: 'md',
})

// 獲取徽章類別
const getBadgeClasses = () => {
  const baseClasses = props.size === 'sm' ? 'text-xs' : 'text-xs'

  if (props.type === 'warning' && props.warningLevel) {
    switch (props.warningLevel) {
      case 'safe':
        return `${baseClasses} text-green-700 bg-green-50 border border-green-200`
      case 'warning':
        return `${baseClasses} text-yellow-700 bg-yellow-50 border border-yellow-200`
      case 'danger':
        return `${baseClasses} text-orange-700 bg-orange-50 border border-orange-200`
      case 'exceeded':
        return `${baseClasses} text-red-700 bg-red-50 border border-red-200`
    }
  }

  // 狀態徽章
  switch (props.status) {
    case 'active':
      return `${baseClasses} text-green-700 bg-green-50 border border-green-200`
    case 'inactive':
      return `${baseClasses} text-gray-700 bg-gray-50 border border-gray-200`
    case 'completed':
      return `${baseClasses} text-blue-700 bg-blue-50 border border-blue-200`
    case 'exceeded':
      return `${baseClasses} text-red-700 bg-red-50 border border-red-200`
    default:
      return `${baseClasses} text-gray-700 bg-gray-50 border border-gray-200`
  }
}

// 獲取圖示類別
const getIconClasses = () => {
  if (props.type === 'warning' && props.warningLevel) {
    switch (props.warningLevel) {
      case 'safe': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'danger': return 'text-orange-600'
      case 'exceeded': return 'text-red-600'
    }
  }

  switch (props.status) {
    case 'active': return 'text-green-600'
    case 'inactive': return 'text-gray-600'
    case 'completed': return 'text-blue-600'
    case 'exceeded': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

// 獲取圖示路徑
const getIconPath = () => {
  if (props.type === 'warning' && props.warningLevel) {
    switch (props.warningLevel) {
      case 'safe':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
      case 'warning':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
      case 'danger':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
      case 'exceeded':
        return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    }
  }

  switch (props.status) {
    case 'active':
      return 'M5 13l4 4L19 7'
    case 'inactive':
      return 'M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z'
    case 'completed':
      return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    case 'exceeded':
      return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    default:
      return 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  }
}

// 獲取狀態文字
const getStatusText = () => {
  if (props.type === 'warning' && props.warningLevel) {
    switch (props.warningLevel) {
      case 'safe': return '安全'
      case 'warning': return '注意'
      case 'danger': return '警告'
      case 'exceeded': return '超支'
    }
  }

  switch (props.status) {
    case 'active': return '進行中'
    case 'inactive': return '已暫停'
    case 'completed': return '已完成'
    case 'exceeded': return '已超支'
    default: return '未知'
  }
}
</script>
