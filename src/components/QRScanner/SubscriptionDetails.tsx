import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../../config'
import type { User } from '../../types/user.types'
import type { MySubscription } from '../../types/subscription.types'

interface SubscriptionDetailsProps {
  subscriptionId: string
  userId: string
}

/**
 * Fetch and display user and subscription details from the API
 */
const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({ subscriptionId, userId }) => {
  const [user, setUser] = useState<User | null>(null)
  const [subscription, setSubscription] = useState<MySubscription | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [loadingSubscription, setLoadingSubscription] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // Fetch user details
    const fetchUser = async () => {
      try {
        setLoadingUser(true)
        setUserError(null)
        const response = await axios.get<User>(`${API_BASE_URL}/users/${userId}`)
        if (mounted) {
          setUser(response.data)
        }
      } catch (error) {
        if (mounted) {
          setUserError(axios.isAxiosError(error) 
            ? error.response?.data?.message || error.message 
            : 'Failed to fetch user')
        }
      } finally {
        if (mounted) {
          setLoadingUser(false)
        }
      }
    }

    // Fetch subscription details
    const fetchSubscription = async () => {
      try {
        setLoadingSubscription(true)
        setSubscriptionError(null)
        const response = await axios.get<MySubscription>(`${API_BASE_URL}/subscriptions/${subscriptionId}`)
        if (mounted) {
          setSubscription(response.data)
        }
      } catch (error) {
        if (mounted) {
          setSubscriptionError(axios.isAxiosError(error) 
            ? error.response?.data?.message || error.message 
            : 'Failed to fetch subscription')
        }
      } finally {
        if (mounted) {
          setLoadingSubscription(false)
        }
      }
    }

    if (userId) fetchUser()
    if (subscriptionId) fetchSubscription()

    return () => {
      mounted = false
    }
  }, [subscriptionId, userId])

  const isLoading = loadingUser || loadingSubscription
  const hasErrors = userError || subscriptionError

  if (isLoading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <div className="status-message status-loading">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" opacity="0.25" />
            <path d="M12 2 A10 10 0 0 1 22 12" strokeLinecap="round" />
          </svg>
          <span>Loading details...</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginTop: '16px' }}>
      {/* User Details */}
      {userError ? (
        <div className="status-message status-error" style={{ marginBottom: '12px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>User Error: {userError}</span>
        </div>
      ) : user ? (
        <details open style={{ 
          background: 'white', 
          border: '1px solid var(--gray-200)',
          borderRadius: '8px', 
          padding: '12px',
          marginBottom: '12px'
        }}>
          <summary style={{ 
            cursor: 'pointer', 
            fontWeight: '600',
            fontSize: '16px',
            color: 'var(--gray-800)',
            marginBottom: '12px',
            listStyle: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            User Information
          </summary>
          <div style={{ 
            display: 'grid', 
            gap: '8px',
            fontSize: '14px'
          }}>
            <div style={{ 
              display: 'flex', 
              padding: '8px',
              background: 'var(--gray-50)',
              borderRadius: '6px'
            }}>
              <strong style={{ minWidth: '100px', color: 'var(--gray-600)' }}>Name:</strong>
              <span style={{ color: 'var(--gray-800)' }}>{user.fullName}</span>
            </div>
            {user.email && (
              <div style={{ 
                display: 'flex', 
                padding: '8px',
                background: 'var(--gray-50)',
                borderRadius: '6px'
              }}>
                <strong style={{ minWidth: '100px', color: 'var(--gray-600)' }}>Email:</strong>
                <span style={{ color: 'var(--gray-800)' }}>{user.email}</span>
              </div>
            )}
            {user.phone && (
              <div style={{ 
                display: 'flex', 
                padding: '8px',
                background: 'var(--gray-50)',
                borderRadius: '6px'
              }}>
                <strong style={{ minWidth: '100px', color: 'var(--gray-600)' }}>Phone:</strong>
                <span style={{ color: 'var(--gray-800)' }}>{user.phone}</span>
              </div>
            )}
            <div style={{ 
              display: 'flex', 
              padding: '8px',
              background: 'var(--gray-50)',
              borderRadius: '6px'
            }}>
              <strong style={{ minWidth: '100px', color: 'var(--gray-600)' }}>Gender:</strong>
              <span style={{ color: 'var(--gray-800)' }}>{user.gender}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              padding: '8px',
              background: 'var(--gray-50)',
              borderRadius: '6px'
            }}>
              <strong style={{ minWidth: '100px', color: 'var(--gray-600)' }}>User ID:</strong>
              <span style={{ 
                color: 'var(--gray-800)', 
                fontFamily: 'monospace',
                fontSize: '12px'
              }}>{user.id}</span>
            </div>
          </div>
        </details>
      ) : null}

      {/* Subscription Details */}
      {subscriptionError ? (
        <div className="status-message status-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>Subscription Error: {subscriptionError}</span>
        </div>
      ) : subscription ? (
        <details open style={{ 
          background: 'white', 
          border: '1px solid var(--gray-200)',
          borderRadius: '8px', 
          padding: '12px'
        }}>
          <summary style={{ 
            cursor: 'pointer', 
            fontWeight: '600',
            fontSize: '16px',
            color: 'var(--gray-800)',
            marginBottom: '12px',
            listStyle: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Subscription Information
          </summary>
          <div style={{ 
            display: 'grid', 
            gap: '8px',
            fontSize: '14px'
          }}>
            {subscription.plan && (
              <div style={{ 
                display: 'flex', 
                padding: '8px',
                background: 'var(--gray-50)',
                borderRadius: '6px'
              }}>
                <strong style={{ minWidth: '100px', color: 'var(--gray-600)' }}>Plan:</strong>
                <span style={{ color: 'var(--gray-800)', fontWeight: '600' }}>{subscription.plan.name}</span>
              </div>
            )}
            <div style={{ 
              display: 'flex', 
              padding: '8px',
              background: 'var(--gray-50)',
              borderRadius: '6px'
            }}>
              <strong style={{ minWidth: '100px', color: 'var(--gray-600)' }}>Status:</strong>
              <span className={`badge ${subscription.isActive ? 'badge-success' : 'badge-inactive'}`}>
                {subscription.isActive ? '● Active' : '○ Inactive'}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              padding: '8px',
              background: 'var(--gray-50)',
              borderRadius: '6px'
            }}>
              <strong style={{ minWidth: '100px', color: 'var(--gray-600)' }}>Start Date:</strong>
              <span style={{ color: 'var(--gray-800)' }}>
                {new Date(subscription.startDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              padding: '8px',
              background: 'var(--gray-50)',
              borderRadius: '6px'
            }}>
              <strong style={{ minWidth: '100px', color: 'var(--gray-600)' }}>End Date:</strong>
              <span style={{ color: 'var(--gray-800)' }}>
                {new Date(subscription.endDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            {subscription.plan && subscription.plan.description && (
              <div style={{ 
                padding: '8px',
                background: 'var(--gray-50)',
                borderRadius: '6px'
              }}>
                <strong style={{ color: 'var(--gray-600)', display: 'block', marginBottom: '4px' }}>Description:</strong>
                <span style={{ color: 'var(--gray-800)' }}>{subscription.plan.description}</span>
              </div>
            )}
            {subscription.plan && subscription.plan.features && subscription.plan.features.length > 0 && (
              <div style={{ 
                padding: '8px',
                background: 'var(--gray-50)',
                borderRadius: '6px'
              }}>
                <strong style={{ color: 'var(--gray-600)', display: 'block', marginBottom: '8px' }}>Features:</strong>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {subscription.plan.features.map((feature, index) => (
                    <li key={index} style={{ color: 'var(--gray-800)', marginBottom: '4px' }}>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div style={{ 
              display: 'flex', 
              padding: '8px',
              background: 'var(--gray-50)',
              borderRadius: '6px'
            }}>
              <strong style={{ minWidth: '100px', color: 'var(--gray-600)' }}>Subscription ID:</strong>
              <span style={{ 
                color: 'var(--gray-800)', 
                fontFamily: 'monospace',
                fontSize: '12px'
              }}>{subscription.id}</span>
            </div>
          </div>
        </details>
      ) : null}

      {!hasErrors && !user && !subscription && (
        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--gray-500)' }}>
          No additional details available
        </div>
      )}
    </div>
  )
}

export default SubscriptionDetails
