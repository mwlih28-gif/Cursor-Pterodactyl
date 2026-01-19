'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'

export default function TopBar() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    // Fetch notifications count
    const fetchNotifications = async () => {
      try {
        // TODO: Implement notifications API
        // const response = await api.get('/notifications/unread')
        // setNotifications(response.data.count)
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      }
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    window.location.reload()
  }

  return (
    <div className="bg-[#1e293b] border-b border-[#334155] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-400">
        <span>Dashboard</span>
        <span>/</span>
        <span className="text-white">Current Page</span>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <button className="p-2 text-gray-400 hover:text-white hover:bg-[#334155] rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-white hover:bg-[#334155] rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {notifications > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notifications}
            </span>
          )}
        </button>

        {/* Refresh */}
        <button 
          onClick={handleRefresh}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#334155] rounded-lg transition-colors"
          title="Refresh"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Settings */}
        <button className="p-2 text-gray-400 hover:text-white hover:bg-[#334155] rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* User */}
        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-[#334155] transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-[#0ea5e9] rounded-full flex items-center justify-center text-sm font-semibold">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="text-sm">
            <p className="font-medium">{user?.username || 'User'}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
