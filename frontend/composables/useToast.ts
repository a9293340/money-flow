interface ToastOptions {
  title: string
  description?: string
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'gray'
  timeout?: number
}

interface Toast {
  id: string
  title: string
  description?: string
  color: string
  timeout: number
  createdAt: number
}

const toasts = ref<Toast[]>([])

export const useToast = () => {
  const add = (options: ToastOptions) => {
    const toast: Toast = {
      id: Date.now().toString(),
      title: options.title,
      description: options.description,
      color: options.color || 'gray',
      timeout: options.timeout || 5000,
      createdAt: Date.now(),
    }

    toasts.value.push(toast)

    // Auto remove after timeout
    setTimeout(() => {
      remove(toast.id)
    }, toast.timeout)

    return toast.id
  }

  const remove = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clear = () => {
    toasts.value = []
  }

  return {
    toasts: readonly(toasts),
    add,
    remove,
    clear,
  }
}
