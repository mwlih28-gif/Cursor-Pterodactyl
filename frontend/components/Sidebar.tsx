'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

interface SidebarProps {
  onLogout: () => void
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuthStore()

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: '🏠' },
    { href: '/dashboard/servers', label: 'Servers', icon: '🖥️' },
    { href: '/dashboard/files', label: 'Files', icon: '📁' },
    { href: '/dashboard/backups', label: 'Backups', icon: '💾' },
    { href: '/dashboard/metrics', label: 'Metrics', icon: '📈' },
    { href: '/dashboard/plugins', label: 'Plugins', icon: '🔌' },
    { href: '/dashboard/users', label: 'Users', icon: '👥' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  ]

  const adminItems = user?.role_id === 1 ? [
    { href: '/dashboard/admin/nodes', label: 'Nodes', icon: '🌐' },
    { href: '/dashboard/admin/databases', label: 'Databases', icon: '🗄️' },
    { href: '/dashboard/admin/locations', label: 'Locations', icon: '📍' },
    { href: '/dashboard/admin/api', label: 'Application API', icon: '🔗' },
  ] : []

  return (
    <aside className="w-64 bg-[#1e293b] text-white flex flex-col h-screen sticky top-0 border-r border-[#334155]">
      {/* Logo */}
      <div className="p-6 border-b border-[#334155]">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">🦖</div>
          <div>
            <h1 className="text-xl font-bold">Gaming Panel</h1>
            <p className="text-xs text-gray-400 mt-1">Control Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto scrollbar-hide space-y-6">
        {/* Basic Navigation */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
            Navigation
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-[#0ea5e9] text-white'
                        : 'text-gray-300 hover:bg-[#334155] hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Admin Section */}
        {adminItems.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
              Administration
            </p>
            <ul className="space-y-1">
              {adminItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? 'bg-[#0ea5e9] text-white'
                          : 'text-gray-300 hover:bg-[#334155] hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#334155]">
        <div className="mb-3 px-4">
          <p className="text-sm font-medium text-white">{user?.username || 'User'}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-[#334155] hover:text-white transition-colors"
        >
          <span className="text-lg">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
