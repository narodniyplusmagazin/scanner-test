import { useEffect, useState } from 'react'
import axios from 'axios'
import './Admin.css'
import type { User } from '../types/user.types'
import type { MySubscription } from '../types/subscription.types'
import { API_BASE_URL } from '../config'
import Layout from '../components/Layout/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import EmptyState from '../components/common/EmptyState'

export default function UsersList() {
  const [users, setUsers] = useState<User[] | null>(null)
  const [subscriptions, setSubscriptions] = useState<MySubscription[] | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [subscriptionsError, setSubscriptionsError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  
  
  useEffect(() => {
    let mounted = true
    setLoadError(null)
    axios.get<User[]>(API_BASE_URL+'/users')
      .then(response => { if (mounted) setUsers(response.data) })
      .catch((error) => { 
        if (mounted) {
          setLoadError(error.response?.data?.message || error.message || 'Failed to load users')
          setUsers([])
        }
      })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!selectedUserId) {
      setSubscriptions(null)
      return
    }
    
    let mounted = true
    setSubscriptionsError(null)
    setSubscriptions(null)
    
    axios.get<MySubscription[]>(API_BASE_URL+`/subscriptions/my-subscriptions/${selectedUserId}`)
      .then(response => { if (mounted) setSubscriptions(response.data) })
      .catch((error) => {
        if (mounted) {
          setSubscriptionsError(error.response?.data?.message || error.message || 'Failed to load subscriptions')
          setSubscriptions([])
        }
      })
    return () => { mounted = false }
  }, [selectedUserId])

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    setDeleting(userId)
    setDeleteError(null)

    try {
      await axios.delete(API_BASE_URL+`/users/${userId}`)

      // Remove user from local state
      setUsers(prev => prev ? prev.filter(u => u.id !== userId) : prev)
      
      // Clear selection if deleted user was selected
      if (selectedUserId === userId) {
        setSelectedUserId(null)
        setSelectedUser(null)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setDeleteError(error.response?.data?.message || error.message)
      } else {
        setDeleteError('Failed to delete user')
      }
    } finally {
      setDeleting(null)
    }
  }

  const handleSelectUser = (user: User) => {
    setSelectedUserId(user.id)
    setSelectedUser(user)
  }

  const filteredUsers = users?.filter(user => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      user.fullName.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query)
    )
  }) || []
  
  console.log(selectedUserId);
  
  if (!users) return (
    <Layout title="Users">
      <LoadingSpinner message="Loading users..." />
    </Layout>
  )

  if (loadError) return (
    <Layout title="Users">
      <ErrorMessage 
        message={loadError}
        onRetry={() => window.location.reload()}
      />
    </Layout>
  )

  return (
    <Layout title="Users">
      <div className="admin-container">
        {deleteError && (
          <div className="alert alert-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{deleteError}</span>
            <button className="alert-close" onClick={() => setDeleteError(null)}>×</button>
          </div>
        )}

        {users.length === 0 ? (
          <EmptyState
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
            title="No users yet"
            description="Create your first user to get started."
          />
        ) : (
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <h3 className="card-title">All Users ({users.length})</h3>
                <div className="search-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  {searchQuery && (
                    <button className="search-clear" onClick={() => setSearchQuery('')}>×</button>
                  )}
                </div>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Gender</th>
                    <th>Created</th>
                    <th className="actions-column">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '48px' }}>
                        <EmptyState
                          title="No users found"
                          description={searchQuery ? `No users match "${searchQuery}"` : "No users in the system"}
                        />
                      </td>
                    </tr>
                  ) : (
                  filteredUsers.map(u => (
                    <tr 
                      key={u.id}
                      className={selectedUserId === u.id ? 'row-selected' : ''}
                    >
                      <td>
                        <div className="user-name">
                          <div className="user-avatar">
                            {u.fullName.charAt(0).toUpperCase()}
                          </div>
                          <span>{u.fullName}</span>
                        </div>
                      </td>
                      <td>{u.phone || '—'}</td>
                      <td>{u.email || '—'}</td>
                      <td>
                        <span className="badge badge-neutral">{u.gender}</span>
                      </td>
                     
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleSelectUser(u)}
                            className={`btn btn-sm ${selectedUserId === u.id ? 'btn-primary-active' : 'btn-primary'}`}
                          >
                            {selectedUserId === u.id ? '✓ Selected' : 'View Details'}
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            disabled={deleting === u.id}
                            className="btn btn-sm btn-danger"
                          >
                            {deleting === u.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="subscriptions-section">
          <h2 className="section-title">User Details</h2>
          {!selectedUserId || !selectedUser ? (
            <EmptyState
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
              title="No user selected"
              description="Select a user from the table above to view their details and subscriptions."
            />
          ) : (
            <>
              <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="user-avatar" style={{ width: '48px', height: '48px', fontSize: '20px' }}>
                      {selectedUser.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 className="card-title" style={{ marginBottom: '4px' }}>{selectedUser.fullName}</h3>
                      <div style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
                        ID: <code style={{ background: 'var(--gray-100)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{selectedUser.id}</code>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 'var(--spacing-lg)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)' }}>
                    <div className="detail-item">
                      <div className="detail-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        Phone
                      </div>
                      <div className="detail-value">{selectedUser.phone || '—'}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        Email
                      </div>
                      <div className="detail-value">{selectedUser.email || '—'}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        Gender
                      </div>
                      <div className="detail-value">
                        <span className="badge badge-neutral">{selectedUser.gender}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Created
                      </div>
                      <div className="detail-value">{new Date(selectedUser.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Last Updated
                      </div>
                      <div className="detail-value">{new Date(selectedUser.updatedAt).toLocaleString()}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                        Total Subscriptions
                      </div>
                      <div className="detail-value">
                        <span className="badge badge-info" style={{ fontSize: '14px' }}>
                          {selectedUser?._count?.subscriptions || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Subscription History</h3>
                </div>

                {subscriptionsError && (
                  <div className="alert alert-warning">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>{subscriptionsError}</span>
                  </div>
                )}

                {!subscriptions ? (
                  <div style={{ padding: '48px 24px' }}>
                    <LoadingSpinner size="small" message="Loading subscriptions..." />
                  </div>
                ) : subscriptions.length === 0 ? (
                  <div style={{ padding: '32px 24px' }}>
                    <EmptyState
                      title="No subscriptions"
                      description="This user doesn't have any subscriptions yet."
                    />
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Plan</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Status</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptions.map(sub => (
                          <tr key={sub.id}>
                            <td>
                              <strong>{sub.plan?.name || sub.planId}</strong>
                            </td>
                            <td>{new Date(sub.startDate).toLocaleDateString()}</td>
                            <td>{new Date(sub.endDate).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge ${sub.isActive ? 'badge-success' : 'badge-inactive'}`}>
                                {sub.isActive ? '● Active' : '○ Inactive'}
                              </span>
                            </td>
                            <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
