'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import api from '@/lib/api'
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

export default function ServerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const serverId = params.id as string
  const [server, setServer] = useState<Server | null>(null)
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    uptime: 0,
    networkIn: 0,
    networkOut: 0,
  })
  
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminal = useRef<Terminal | null>(null)
  const fitAddon = useRef<FitAddon | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const [activeTab, setActiveTab] = useState('console')

  const tabs = [
    { id: 'console', label: 'Console', icon: '💻' },
    { id: 'files', label: 'Files', icon: '📁' },
    { id: 'databases', label: 'Databases', icon: '🗄️' },
    { id: 'schedules', label: 'Schedules', icon: '⏰' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'backups', label: 'Backups', icon: '💾' },
    { id: 'network', label: 'Network', icon: '🌐' },
    { id: 'startup', label: 'Startup', icon: '⚡' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'activity', label: 'Activity', icon: '📊' },
  ]

  useEffect(() => {
    fetchServer()
    fetchMetrics()

    // Initialize terminal
    if (terminalRef.current && !terminal.current) {
      terminal.current = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Consolas, Monaco, monospace',
        theme: {
          background: '#0f172a',
          foreground: '#ffffff',
          cursor: '#0ea5e9',
        },
      })
      fitAddon.current = new FitAddon()
      terminal.current.loadAddon(fitAddon.current)
      terminal.current.open(terminalRef.current)
      fitAddon.current.fit()

      // Connect WebSocket
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL?.replace('http', 'ws') || 'ws://localhost:3000'}/ws`
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        ws.send(JSON.stringify({ server_id: server?.uuid }))
        terminal.current?.write('Connected to server console\r\n')
        terminal.current?.write('Type a command...\r\n\r\n')
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'console') {
          terminal.current?.write(data.message)
        }
      }

      wsRef.current = ws
    }

    // Fetch metrics every 5 seconds
    const metricsInterval = setInterval(fetchMetrics, 5000)

    return () => {
      clearInterval(metricsInterval)
      wsRef.current?.close()
      terminal.current?.dispose()
    }
  }, [serverId])

  const fetchServer = async () => {
    try {
      const response = await api.get(`/servers/${serverId}`)
      setServer(response.data)
    } catch (error) {
      console.error('Failed to fetch server:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMetrics = async () => {
    try {
      // TODO: Implement real metrics API
      // const response = await api.get(`/servers/${serverId}/metrics`)
      // setMetrics(response.data)
      
      // Mock data for now
      setMetrics({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100,
        uptime: Date.now() / 1000,
        networkIn: Math.random() * 1000,
        networkOut: Math.random() * 1000,
      })
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    }
  }

  const handleStart = async () => {
    try {
      await api.post(`/servers/${serverId}/start`)
      fetchServer()
    } catch (error) {
      console.error('Failed to start server:', error)
    }
  }

  const handleStop = async () => {
    try {
      await api.post(`/servers/${serverId}/stop`)
      fetchServer()
    } catch (error) {
      console.error('Failed to stop server:', error)
    }
  }

  const handleRestart = async () => {
    try {
      await api.post(`/servers/${serverId}/restart`)
      fetchServer()
    } catch (error) {
      console.error('Failed to restart server:', error)
    }
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0ea5e9]"></div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!server) {
    return (
      <div className="p-6">
        <p className="text-white">Server not found</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/dashboard/servers')}
            className="text-gray-400 hover:text-white mb-2 flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to Servers</span>
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">{server.name}</h1>
          {server.allocation && (
            <p className="text-gray-400">
              {server.allocation.ip}:{server.allocation.port}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {server.status === 'offline' ? (
            <button
              onClick={handleStart}
              className="bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-2 rounded-lg transition-colors"
            >
              Start
            </button>
          ) : (
            <>
              <button
                onClick={handleRestart}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-6 py-2 rounded-lg transition-colors"
              >
                Restart
              </button>
              <button
                onClick={handleStop}
                className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2 rounded-lg transition-colors"
              >
                Stop
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex space-x-1 bg-[#1e293b] p-1 rounded-lg border border-[#334155]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-[#0ea5e9] text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#334155]'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'console' && (
            <div className="bg-[#0f172a] rounded-lg border border-[#334155] p-4">
              <div
                ref={terminalRef}
                className="w-full h-96"
                style={{ padding: '10px' }}
              />
            </div>
          )}
          {activeTab !== 'console' && (
            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
              <p className="text-gray-400">This tab is coming soon...</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Control */}
          <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Control</h3>
            <div className="space-y-3">
              {server.status === 'offline' ? (
                <button
                  onClick={handleStart}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Start
                </button>
              ) : (
                <>
                  <button
                    onClick={handleRestart}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 rounded-lg transition-colors"
                  >
                    Restart
                  </button>
                  <button
                    onClick={handleStop}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition-colors"
                  >
                    Stop
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Server Info */}
          <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Server Information</h3>
            <div className="space-y-3 text-sm">
              {server.allocation && (
                <div>
                  <p className="text-gray-400">Address</p>
                  <p className="text-white font-medium">
                    {server.allocation.ip}:{server.allocation.port}
                  </p>
                </div>
              )}
              {server.status === 'online' && (
                <div>
                  <p className="text-gray-400">Uptime</p>
                  <p className="text-white font-medium">{formatUptime(metrics.uptime)}</p>
                </div>
              )}
              <div>
                <p className="text-gray-400">Status</p>
                <p className={`font-medium ${
                  server.status === 'online' ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Resource Usage */}
          {server.status === 'online' && (
            <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Resource Usage</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">CPU Load</span>
                    <span className="text-sm font-semibold text-white">{metrics.cpu.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[#0f172a] rounded-full h-2">
                    <div
                      className="bg-[#0ea5e9] h-2 rounded-full transition-all"
                      style={{ width: `${metrics.cpu}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Memory</span>
                    <span className="text-sm font-semibold text-white">{metrics.memory.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[#0f172a] rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${metrics.memory}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Disk</span>
                    <span className="text-sm font-semibold text-white">{metrics.disk.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[#0f172a] rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all"
                      style={{ width: `${metrics.disk}%` }}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-[#334155]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Network (Inbound)</span>
                    <span className="text-sm font-semibold text-white">
                      {(metrics.networkIn / 1024).toFixed(2)} KiB
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Network (Outbound)</span>
                    <span className="text-sm font-semibold text-white">
                      {(metrics.networkOut / 1024).toFixed(2)} KiB
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resource Charts */}
          {server.status === 'online' && (
            <div className="space-y-4">
              <ResourceChart title="CPU Load" type="cpu" />
              <ResourceChart title="Memory Usage" type="memory" />
              <ResourceChart title="Network" type="network" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
