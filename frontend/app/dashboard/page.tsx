'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import ServerCard from '@/components/ServerCard'
import StatsCard from '@/components/StatsCard'
import ResourceChart from '@/components/ResourceChart'

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

interface Stats {
  totalServers: number
  onlineServers: number
  totalNodes: number
  onlineNodes: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [servers, setServers] = useState<Server[]>([])
  const [stats, setStats] = useState<Stats>({
    totalServers: 0,
    onlineServers: 0,
    totalNodes: 0,
    onlineNodes: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showAllServers, setShowAllServers] = useState(true)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [serversRes, statsRes] = await Promise.all([
        api.get('/servers'),
        api.get('/admin/metrics'),
      ])
      setServers(serversRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const displayServers = showAllServers ? servers : servers.slice(0, 6)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Your Servers</h1>
            <p className="text-gray-400">All servers available on the system.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-[#1e293b] px-4 py-2 rounded-lg border border-[#334155]">
              <span className="text-sm text-gray-300">Showing Your Servers</span>
              <button
                onClick={() => setShowAllServers(!showAllServers)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  showAllServers ? 'bg-[#0ea5e9]' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    showAllServers ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <button
              onClick={() => router.push('/dashboard/servers/new')}
              className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium px-6 py-2 rounded-lg transition-colors"
            >
              Create New
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Servers"
          value={stats.totalServers}
          icon="🖥️"
          color="accent"
        />
        <StatsCard
          title="Online Servers"
          value={stats.onlineServers}
          icon="✅"
          color="success"
        />
        <StatsCard
          title="Total Nodes"
          value={stats.totalNodes}
          icon="🌐"
          color="accent"
        />
        <StatsCard
          title="Online Nodes"
          value={stats.onlineNodes}
          icon="✅"
          color="success"
        />
      </div>

      {/* Servers List */}
      <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Server List</h2>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search servers..."
                className="pl-10 pr-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0ea5e9]"></div>
            <p className="text-gray-400 mt-4">Loading servers...</p>
          </div>
        ) : displayServers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🖥️</div>
            <h3 className="text-xl font-semibold text-white mb-2">No servers found</h3>
            <p className="text-gray-400 mb-6">Create your first game server to get started</p>
            <button
              onClick={() => router.push('/dashboard/servers/new')}
              className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Create Server
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayServers.map((server) => (
              <ServerCard key={server.id} server={server} />
            ))}
          </div>
        )}
      </div>

      {/* Resource Usage Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ResourceChart title="CPU Load" type="cpu" />
        <ResourceChart title="Memory Usage" type="memory" />
        <ResourceChart title="Network" type="network" />
      </div>
    </div>
  )
}
