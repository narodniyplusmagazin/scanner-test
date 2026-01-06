import { useState, useEffect } from 'react'
import axios from 'axios'
import type { SubscriptionPlan } from '../../types/subscription.types'
import { API_BASE_URL } from '../../config'

interface CreateSubscriptionFormProps {
  userId: string
  userName: string
  onSuccess: () => void
  onCancel: () => void
}

export default function CreateSubscriptionForm({ 
  userId, 
  userName, 
  onSuccess, 
  onCancel 
}: CreateSubscriptionFormProps) {
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    
    axios.get<SubscriptionPlan>(API_BASE_URL + '/subscriptions/plan')
      .then(response => {
        if (mounted) {
          setPlan(response.data)
          setLoadError(null)
          setLoading(false)
        }
      })
      .catch((error) => {
        if (mounted) {
          setLoadError(error.response?.data?.message || error.message || 'Failed to load subscription plan')
          setLoading(false)
        }
      })
    
    return () => { mounted = false }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setCreateError(null)

    const requestBody = { userId }
    console.log('Creating subscription with data:', requestBody)

    try {
      const response = await axios.post(API_BASE_URL + '/subscriptions/create', requestBody)
      console.log('Subscription created successfully:', response.data)
      onSuccess()
    } catch (error) {
      console.error('Failed to create subscription:', error)
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
        console.error('Error details:', error.response?.data)
        setCreateError(errorMessage)
      } else {
        setCreateError('Failed to create subscription')
      }
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto' }}></div>
        <p style={{ marginTop: '12px', color: 'var(--gray-600)' }}>Loading subscription plan...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div style={{ padding: '24px' }}>
        <div className="alert alert-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{loadError}</span>
        </div>
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div style={{ padding: '24px' }}>
        <div className="alert alert-warning">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>No subscription plan available. Please create a plan first.</span>
        </div>
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>
        Create Subscription for {userName}
      </h3>

      {createError && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{createError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ 
          padding: '16px', 
          background: 'var(--gray-50)', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '16px',
          border: '1px solid var(--gray-200)'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--gray-700)' }}>
            Selected Plan
          </div>
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>Name:</span>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>{plan.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>Price:</span>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>${(plan.price / 100).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>Duration:</span>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>{plan.durationDays} days</span>
            </div>
          </div>
          {plan.features && plan.features.length > 0 && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: 'var(--gray-600)', textTransform: 'uppercase' }}>
                Features
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--gray-700)' }}>
                {plan.features.map((feature, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div style={{ 
          padding: '12px 16px', 
          background: 'var(--blue-50)', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '16px',
          border: '1px solid var(--blue-200)',
          fontSize: '14px',
          color: 'var(--gray-700)'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          The subscription will start immediately and expire after {plan.durationDays} days.
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={creating}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={creating}
            className="btn btn-success"
          >
            {creating ? 'Creating...' : 'Create Subscription'}
          </button>
        </div>
      </form>
    </div>
  )
}
