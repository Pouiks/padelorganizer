'use client'

import { useState, useEffect } from 'react'

let toastId = 0
const toasts = []
const listeners = []

export const toast = {
  success: (message) => showToast(message, 'success'),
  error: (message) => showToast(message, 'error'),
  info: (message) => showToast(message, 'info')
}

function showToast(message, type) {
  const id = ++toastId
  const newToast = { id, message, type }
  toasts.push(newToast)
  
  listeners.forEach(listener => listener([...toasts]))
  
  // Auto-remove après 3 secondes
  setTimeout(() => {
    const index = toasts.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.splice(index, 1)
      listeners.forEach(listener => listener([...toasts]))
    }
  }, 3000)
}

export function ToastContainer() {
  const [toastList, setToastList] = useState([])
  
  useEffect(() => {
    listeners.push(setToastList)
    return () => {
      const index = listeners.indexOf(setToastList)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])
  
  const removeToast = (id) => {
    const index = toasts.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.splice(index, 1)
      setToastList([...toasts])
    }
  }
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toastList.map(toast => (
        <div
          key={toast.id}
          className={`
            px-4 py-3 rounded-lg shadow-lg min-w-64 max-w-sm
            transform transition-all duration-300 ease-in-out
            ${toast.type === 'success' ? 'bg-green-500 text-white' : ''}
            ${toast.type === 'error' ? 'bg-red-500 text-white' : ''}
            ${toast.type === 'info' ? 'bg-blue-500 text-white' : ''}
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2">
                {toast.type === 'success' && '✅'}
                {toast.type === 'error' && '❌'}
                {toast.type === 'info' && 'ℹ️'}
              </span>
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-white hover:text-gray-200 font-bold"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
