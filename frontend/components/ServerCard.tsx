'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Server {
  id: number
  uuid: string
  name: string
  status: string
  docker_image: string
  node?: {
    name: string
    ip: string
  }
  allocation?: {
    ip: string
    port: number
  }
}

interface ServerCardProps {
  server: Server
}

export default function ServerCard({ server }: ServerCardProps) {
  const [metrics, setMetrics] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    networkIn: 0,
    networkOut: 0,
  })

  useEffect(() => {
    // TODO: Fetch real-time metrics from API
    // This is mock data for now
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100,
        networkIn: Math.random() * 1000,
        networkOut: Math.random() * 1000,
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [server.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'offline':
        return 'bg-gray-500'
      case 'starting':
        return 'bg-yellow-500'
      case 'stopping':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <Link href={`/dashboard/servers/${server.id}`}>
      <div className="bg-[#0f172a] hover:bg-[#1e293b] border border-[#334155] rounded-lg p-4 transition-all cursor-pointer group">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(server.status)} flex-shrink-0`} />
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-[#0ea5e9] transition-colors">
                {server.name}
              </h3>
              {server.allocation && (
                <p className="text-sm text-gray-400">
                  {server.allocation.ip}:{server.allocation.port}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              server.status === 'online' 
                ? 'bg-green-500/20 text-green-400' 
                : server.status === 'offline'
                ? 'bg-gray-500/20 text-gray-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {getStatusText(server.status)}
            </span>
            <span className="text-gray-400 group-hover:text-[#0ea5e9] transition-colors">→</span>
          </div>
        </div>

        {/* Resource Metrics */}
        {server.status === 'online' && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#334155]">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <div>
                <p className="text-xs text-gray-400">CPU</p>
                <p className="text-sm font-semibold text-white">{metrics.cpu.toFixed(1)}%</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              <div>
                <p className="text-xs text-gray-400">RAM</p>
                <p className="text-sm font-semibold text-white">{metrics.memory.toFixed(1)}%</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              <div>
                <p className="text-xs text-gray-400">Disk</p>
                <p className="text-sm font-semibold text-white">{metrics.disk.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
