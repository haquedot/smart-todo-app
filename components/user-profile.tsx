"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Cloud, CloudOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth'
import { useTodoStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'

export function UserProfile() {
    const { user, signInWithGoogle, signOut } = useAuth()
    const { syncWithSupabase, syncStatus, setAuthenticated } = useTodoStore()
    const { toast } = useToast()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleSignIn = async () => {
        try {
            await signInWithGoogle()
        } catch (error) {
            toast({
                title: "Sign-in failed",
                description: "Failed to sign in with Google. Please try again.",
                variant: "destructive",
            })
        }
    }

    const handleSignOut = async () => {
        try {
            setIsLoggingOut(true)
            await signOut()
            setAuthenticated(false)
            toast({
                title: "Signed out",
                description: "You have been successfully signed out.",
            })
        } catch (error) {
            toast({
                title: "Sign-out failed",
                description: "Failed to sign out. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoggingOut(false)
        }
    }

    const handleSync = async () => {
        if (!user) return

        try {
            await syncWithSupabase(user.id)
            toast({
                title: "Sync completed",
                description: "Your tasks have been synced with the cloud.",
            })
        } catch (error) {
            toast({
                title: "Sync failed",
                description: "Failed to sync your tasks. Please try again.",
                variant: "destructive",
            })
        }
    }

    const getSyncIcon = () => {
        switch (syncStatus) {
            case 'syncing':
                return <Loader2 className="w-4 h-4 animate-spin" />
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500" />
            default:
                return user ? <Cloud className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />
        }
    }

    if (!user) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2"
            >
                <Button
                    onClick={handleSignIn}
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-300/50 dark:border-blue-700/50 hover:from-blue-100/70 hover:to-purple-100/70 dark:hover:from-blue-900/50 dark:hover:to-purple-900/50"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="hidden sm:inline">Sign In</span>
                </Button>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
        >
            <Button
                onClick={handleSync}
                variant="outline"
                size="sm"
                disabled={syncStatus === 'syncing'}
                className="gap-2 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-300/50 dark:border-green-700/50 hover:from-green-100/70 hover:to-emerald-100/70 dark:hover:from-green-900/50 dark:hover:to-emerald-900/50"
            >
                {getSyncIcon()}
                <span className="hidden sm:inline">
                    {syncStatus === 'syncing' ? 'Syncing...' : 'Sync'}
                </span>
            </Button>

            <Avatar className="w-8 h-8">
                <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                    {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </AvatarFallback>
            </Avatar>

            <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                disabled={isLoggingOut}
                className="gap-2 bg-gradient-to-r from-red-50/50 to-pink-50/50 dark:from-red-900/30 dark:to-pink-900/30 border-red-300/50 dark:border-red-700/50 hover:from-red-100/70 hover:to-pink-100/70 dark:hover:from-red-900/50 dark:hover:to-pink-900/50 text-red-600 dark:text-red-400"
            >
                {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <LogOut className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Sign Out</span>
            </Button>
        </motion.div>
    )
}
