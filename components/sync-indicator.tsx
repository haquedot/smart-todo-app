"use client"

import { motion } from 'framer-motion'
import { Cloud, CloudOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useTodoStore } from '@/lib/store'

export function SyncIndicator() {
  const { user } = useAuth()
  const { syncStatus, isAuthenticated } = useTodoStore()

  if (!user || !isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"
      >
        <CloudOff className="w-3 h-3" />
        <span>Offline</span>
      </motion.div>
    )
  }

  const getStatusConfig = () => {
    switch (syncStatus) {
      case 'syncing':
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          text: 'Syncing...',
          color: 'text-blue-500'
        }
      case 'success':
        return {
          icon: <CheckCircle className="w-3 h-3" />,
          text: 'Synced',
          color: 'text-green-500'
        }
      case 'error':
        return {
          icon: <AlertCircle className="w-3 h-3" />,
          text: 'Sync failed',
          color: 'text-red-500'
        }
      default:
        return {
          icon: <Cloud className="w-3 h-3" />,
          text: 'Online',
          color: 'text-emerald-500'
        }
    }
  }

  const { icon, text, color } = getStatusConfig()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-1 text-xs ${color}`}
    >
      {icon}
      <span>{text}</span>
    </motion.div>
  )
}
