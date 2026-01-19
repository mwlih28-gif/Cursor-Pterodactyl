'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

interface Plugin {
  id: string
  name: string
  description: string
  version: string
  author: string
  installed: boolean
}

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchPlugins()
  }, [])

  const fetchPlugins = async () => {
    try {
      // TODO: Implement plugin API endpoint
      // const response = await api.get('/plugins')
      // setPlugins(response.data)
      
      // Mock data for now
      setPlugins([
        {
          id: '1',
          name: 'Auto Restart',
          description: 'Automatically restart servers on crash',
          version: '1.0.0',
          author: 'Gaming Panel',
          installed: false,
        },
        {
          id: '2',
          name: 'Backup Scheduler',
          description: 'Schedule automatic backups for servers',
          version: '1.0.0',
          author: 'Gaming Panel',
          installed: true,
        },
        {
          id: '3',
          name: 'Resource Monitor',
          description: 'Monitor server resources and send alerts',
          version: '1.0.0',
          author: 'Gaming Panel',
          installed: false,
        },
      ])
    } catch (error) {
      console.error('Failed to fetch plugins:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInstall = async (pluginId: string) => {
    try {
      // TODO: Implement install endpoint
      // await api.post(`/plugins/${pluginId}/install`)
      setPlugins(plugins.map(p => p.id === pluginId ? { ...p, installed: true } : p))
    } catch (error) {
      console.error('Failed to install plugin:', error)
    }
  }

  const handleUninstall = async (pluginId: string) => {
    try {
      // TODO: Implement uninstall endpoint
      // await api.post(`/plugins/${pluginId}/uninstall`)
      setPlugins(plugins.map(p => p.id === pluginId ? { ...p, installed: false } : p))
    } catch (error) {
      console.error('Failed to uninstall plugin:', error)
    }
  }

  const filteredPlugins = plugins.filter(plugin =>
    plugin.name.toLowerCase().includes(search.toLowerCase()) ||
    plugin.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">Plugins</h1>
        <p className="text-primary-600">Extend your panel functionality with plugins</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search plugins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-3 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <p className="text-primary-600 mt-4">Loading plugins...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlugins.map((plugin) => (
            <div key={plugin.id} className="bg-white rounded-xl shadow-soft p-6 border border-primary-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-1">{plugin.name}</h3>
                  <p className="text-sm text-primary-600">{plugin.description}</p>
                </div>
                {plugin.installed && (
                  <span className="bg-green-50 text-green-700 text-xs font-medium px-2 py-1 rounded">
                    Installed
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm text-primary-500 mb-4">
                <span>v{plugin.version}</span>
                <span>by {plugin.author}</span>
              </div>
              <button
                onClick={() => plugin.installed ? handleUninstall(plugin.id) : handleInstall(plugin.id)}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  plugin.installed
                    ? 'bg-red-50 text-red-700 hover:bg-red-100'
                    : 'bg-accent text-white hover:bg-accent-dark'
                }`}
              >
                {plugin.installed ? 'Uninstall' : 'Install'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
