import { useEffect, useState } from 'react'
import axios from 'axios'
import './Admin.css'
import type { User } from '../types/user.types'
import type { MySubscription } from '../types/subscription.types'

export default function UsersList() {
  const [users, setUsers] = useState<User[] | null>(null)
  const [subscriptions, setSubscriptions] = useState<MySubscription[] | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [subscriptionsError, setSubscriptionsError] = useState<string | null>(null)

  
  
  useEffect(() => {
    let mounted = true
    setLoadError(null)
    axios.get<User[]>('https://magazin-9614959e5831.herokuapp.com/users')
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
    
    axios.get<MySubscription[]>(`https://magazin-9614959e5831.herokuapp.com/subscriptions/my-subscriptions/${selectedUserId}`)
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
      await axios.delete(`https://magazin-9614959e5831.herokuapp.com/users/${userId}`)

      // Remove user from local state
      setUsers(prev => prev ? prev.filter(u => u.id !== userId) : prev)
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
  
  console.log(selectedUserId);
  if (!users) return <div style={{ padding: 24 }}>Loading users...</div>

  return (
    <div className="admin-root" style={{ padding: 24 }}>
      <h2>Users</h2>
      {loadError && (
        <div style={{ color: 'orange', marginBottom: 16 }}>
          Warning: {loadError}
        </div>
      )}
      {deleteError && (
        <div style={{ color: 'red', marginBottom: 16 }}>
          Error: {deleteError}
        </div>
      )}
      <table>
        <thead>
          <tr><th>ID</th><th>Full Name</th><th>Phone</th><th>Email</th><th>Gender</th><th>Created</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ backgroundColor: selectedUserId === u.id ? '#e7f3ff' : 'transparent' }}>
              <td>{u.id}</td>
              <td>{u.fullName}</td>
              <td>{u.phone || '—'}</td>
              <td>{u.email || '—'}</td>
              <td>{u.gender}</td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setSelectedUserId(u.id)}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: selectedUserId === u.id ? '#0056b3' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {selectedUserId === u.id ? 'Selected' : 'View Subs'}
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    disabled={deleting === u.id}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: deleting === u.id ? 'not-allowed' : 'pointer',
                      opacity: deleting === u.id ? 0.6 : 1,
                    }}
                  >
                    {deleting === u.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 48 }}>
        <h2>User Subscriptions</h2>
        {!selectedUserId ? (
          <div style={{ color: '#666', padding: 16, backgroundColor: '#f8f9fa', borderRadius: 4 }}>
            Select a user from the table above to view their subscriptions.
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#e7f3ff', borderRadius: 4 }}>
              <strong>Viewing subscriptions for:</strong> {users?.find(u => u.id === selectedUserId)?.fullName || selectedUserId}
            </div>
            {subscriptionsError && (
              <div style={{ color: 'orange', marginBottom: 16 }}>
                Warning: {subscriptionsError}
              </div>
            )}
            {!subscriptions ? (
              <div>Loading subscriptions...</div>
            ) : subscriptions.length === 0 ? (
              <div>No subscriptions found for this user.</div>
            ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>User ID</th>
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
                  <td>{sub.id}</td>
                  <td>{sub.userId}</td>
                  <td>{sub.plan?.name || sub.planId}</td>
                  <td>{new Date(sub.startDate).toLocaleDateString()}</td>
                  <td>{new Date(sub.endDate).toLocaleDateString()}</td>
                  <td>
                    <span style={{ 
                      color: sub.isActive ? 'green' : 'gray',
                      fontWeight: 'bold'
                    }}>
                      {sub.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
            )}
          </>
        )}
      </div>
    </div>
  )
}
