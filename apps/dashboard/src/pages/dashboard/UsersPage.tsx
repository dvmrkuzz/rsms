import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus, Shield, UserX, UserCheck } from 'lucide-react'
import api from '../../lib/api'
import type { User, UserRole } from '../../types'
import { useAuthStore } from '../../store/auth.store'

export default function UsersPage() {
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuthStore()
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', role: 'staff' as UserRole, studentId: '',
  })
  const [formError, setFormError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['users', roleFilter],
    queryFn: () =>
      api.get('/users', { params: { limit: 50, ...(roleFilter && { role: roleFilter }) } })
        .then(r => r.data),
  })

  const createUser = useMutation({
    mutationFn: (data: any) => api.post('/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users-count'] })
      setShowCreate(false)
      setForm({ firstName: '', lastName: '', email: '', password: '', role: 'staff', studentId: '' })
      setFormError('')
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message ?? 'Failed to create user')
    },
  })

  const deactivate = useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/deactivate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  const reactivate = useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/reactivate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  const ROLE_COLORS: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-700',
    staff: 'bg-blue-100 text-blue-700',
    student: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage staff, admin, and student accounts</p>
        </div>
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-800"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-3">
        {(['', 'admin', 'staff', 'student'] as const).map(role => (
          <button
            key={role}
            onClick={() => setRoleFilter(role as UserRole | '')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              roleFilter === role
                ? 'bg-blue-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {role === '' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Role</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Student ID</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading...</td></tr>
            ) : data?.data?.map((u: User) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800">
                  {u.firstName} {u.lastName}
                </td>
                <td className="px-5 py-3 text-gray-600">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[u.role]}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs font-mono">
                  {u.studentId ?? '—'}
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {currentUser?.role === 'admin' && u.id !== currentUser.id && (
                    <div className="flex gap-2">
                      {u.isActive ? (
                        <button
                          onClick={() => deactivate.mutate(u.id)}
                          className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs"
                        >
                          <UserX className="w-3 h-3" /> Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => reactivate.mutate(u.id)}
                          className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs"
                        >
                          <UserCheck className="w-3 h-3" /> Reactivate
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-semibold text-gray-800 mb-5">Create New User</h3>
            {formError && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">
                {formError}
              </div>
            )}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                  <input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                  <input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value as UserRole})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="student">Student</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Student ID</label>
                  <input value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowCreate(false); setFormError('') }}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => createUser.mutate(form)}
                disabled={!form.firstName || !form.email || !form.password || createUser.isPending}
                className="flex-1 px-4 py-2.5 bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50">
                {createUser.isPending ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}