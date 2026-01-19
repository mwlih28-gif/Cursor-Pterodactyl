'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

interface User {
  id: number
  email: string
  username: string
  role: string
  created_at: string
  last_login?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // TODO: Implement users API endpoint
      // const response = await api.get('/admin/users')
      // setUsers(response.data)
      
      // Mock data for now
      setUsers([
        {
          id: 1,
          email: 'admin@example.com',
          username: 'admin',
          role: 'admin',
          created_at: '2024-01-01',
          last_login: '2024-01-15',
        },
      ])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-900 mb-2">Users</h1>
          <p className="text-primary-600">Manage panel users and permissions</p>
        </div>
        <button className="bg-accent hover:bg-accent-dark text-white font-medium px-6 py-2 rounded-lg transition-colors">
          + Add User
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-3 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <p className="text-primary-600 mt-4">Loading users...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-soft border border-primary-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary-50 border-b border-primary-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary-900">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary-900">Created</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary-900">Last Login</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-primary-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-primary-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-primary-900">{user.username}</div>
                      <div className="text-sm text-primary-600">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-primary-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-primary-600">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-accent hover:text-accent-dark font-medium text-sm">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
