'use client'

import { useState } from 'react'
import { formatCurrency } from '@/utils/calculations'
import { format } from 'date-fns'
import { useLanguage } from '@/contexts/LanguageContext'

interface User {
  id: string
  email: string
  shopName: string
  shopUrl: string | null
  firstName: string | null
  lastName: string | null
  role: string
  isActive: boolean
  planTier: string
  stripeOnboardingComplete: boolean
  createdAt: string
  acceptedBids: number
  revenue: number
}

interface UsersListProps {
  users: User[]
}

export function UsersList({ users: initialUsers }: UsersListProps) {
  const { t } = useLanguage()
  const [users, setUsers] = useState(initialUsers)
  const [processingUserId, setProcessingUserId] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const handleUpdateUser = async (userId: string, updates: any) => {
    if (processingUserId) return

    setProcessingUserId(userId)

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const result = await response.json()

      if (result.success) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId ? { ...user, ...updates } : user
          )
        )
        setEditingUser(null)
        alert('User updated successfully!')
      } else {
        alert(`Failed to update user: ${result.error}`)
      }
    } catch (error) {
      console.error('User update error:', error)
      alert('An error occurred while updating the user. Please try again.')
    } finally {
      setProcessingUserId(null)
    }
  }

  const handleImpersonate = async (userId: string) => {
    if (processingUserId) return

    const user = users.find(u => u.id === userId)
    if (!user) return

    if (!confirm(`Are you sure you want to impersonate ${user.shopName}?`)) return

    setProcessingUserId(userId)

    try {
      const response = await fetch(`/api/admin/users/${userId}/impersonate`, {
        method: 'POST'
      })

      const result = await response.json()

      if (result.success) {
        // Redirect will be handled by the API (it sets a cookie and redirects)
        window.location.href = '/dashboard'
      } else {
        alert(`Failed to impersonate user: ${result.error}`)
        setProcessingUserId(null)
      }
    } catch (error) {
      console.error('Impersonation error:', error)
      alert('An error occurred while impersonating the user. Please try again.')
      setProcessingUserId(null)
    }
  }

  const getPlanBadge = (tier: string) => {
    const styles = {
      free: 'bg-gray-100 text-gray-800',
      pro: 'bg-blue-100 text-blue-800',
      business: 'bg-red-100 text-red-800'
    }

    const labels = {
      free: 'Free',
      pro: 'Paid',
      business: 'Expired'
    }

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[tier as keyof typeof styles] || styles.free}`}>
        {labels[tier as keyof typeof labels] || tier}
      </span>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    )
  }

  const getRoleBadge = (role: string) => {
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${
        role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {role === 'admin' ? 'Admin' : 'User'}
      </span>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Shop Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.filter(user => user.role !== 'admin').map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{user.shopName}</div>
                    {user.stripeOnboardingComplete && (
                      <div className="text-xs text-green-600 mt-1">✓ Stripe Connected</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4">
                    {getPlanBadge(user.planTier)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(user.isActive)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(user.revenue)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {format(new Date(user.createdAt), 'PP')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      {/* Edit Icon (Pen) */}
                      <button
                        onClick={() => setEditingUser(user)}
                        disabled={processingUserId === user.id}
                        className="text-gray-600 hover:text-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit user"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      {/* Impersonate Icon (Eye) */}
                      <button
                        onClick={() => handleImpersonate(user.id)}
                        disabled={processingUserId === user.id || !user.isActive}
                        className="text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Impersonate user"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.filter(user => user.role !== 'admin').length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No users found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={(updates) => handleUpdateUser(editingUser.id, updates)}
          isProcessing={processingUserId === editingUser.id}
        />
      )}
    </>
  )
}

// Edit User Modal Component
function EditUserModal({
  user,
  onClose,
  onSave,
  isProcessing
}: {
  user: User
  onClose: () => void
  onSave: (updates: any) => void
  isProcessing: boolean
}) {
  const [formData, setFormData] = useState({
    email: user.email,
    shopUrl: user.shopUrl || '',
    role: user.role,
    planTier: user.planTier,
    isActive: user.isActive
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
            <p className="text-sm text-gray-600 mt-1">Update user information and subscription status</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Info Section */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Shop Name:</span>
              <span className="text-sm font-semibold text-gray-900">{user.shopName}</span>
            </div>
            {user.firstName && user.lastName && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Name:</span>
                <span className="text-sm text-gray-900">{user.firstName} {user.lastName}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Joined:</span>
              <span className="text-sm text-gray-900">{format(new Date(user.createdAt), 'PPP')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Accepted Bids:</span>
              <span className="text-sm text-gray-900">{user.acceptedBids}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Total Revenue:</span>
              <span className="text-sm font-semibold text-gray-900">{formatCurrency(user.revenue)}</span>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Shop URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shop URL
            </label>
            <input
              type="url"
              value={formData.shopUrl}
              onChange={(e) => setFormData({ ...formData, shopUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="https://example.com"
              required
            />
          </div>

          {/* Role and Subscription Status in Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="shop_owner">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Subscription Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subscription Status
              </label>
              <select
                value={formData.planTier}
                onChange={(e) => setFormData({ ...formData, planTier: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="free">Free</option>
                <option value="pro">Paid</option>
                <option value="business">Expired</option>
              </select>
            </div>
          </div>

          {/* Account Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Status
            </label>
            <select
              value={formData.isActive ? 'active' : 'inactive'}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Deactivate</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
