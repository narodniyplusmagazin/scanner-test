import { useEffect, useState } from 'react'
import axios from 'axios'
import './Admin.css'
import type { SubscriptionPlan, UpdateSubscriptionPlanDto } from '../types/subscription.types'
import ModeToggle from './components/ModeToggle'
import StatusMessages from './components/StatusMessages'
import FeaturesList from './components/FeaturesList'
import PlanInfo from './components/PlanInfo'
import { API_BASE_URL } from '../config'
import Layout from '../components/Layout/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

export default function SubscriptionPlanEdit() {
  const [mode, setMode] = useState<'edit' | 'create'>('edit')
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [formData, setFormData] = useState<UpdateSubscriptionPlanDto>({
    name: '',
    price: 0,
    durationDays: 0,
    description: '',
    features: [],
  })
  const [featureInput, setFeatureInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    let mounted = true
    
    const loadPlan = async () => {
      setLoadError(null)
      
      try {
        const response = await axios.get<SubscriptionPlan>(API_BASE_URL+'/subscriptions/plan')
        console.log(response, "<<<<")
        
        if (mounted) {
          setPlan(response.data)
          setFormData({
            id: response.data.id,
            name: response.data.name,
            price: response.data.price,
            durationDays: response.data.durationDays,
            description: response.data.description || '',
            features: response.data.features || [],
          })
          setMode('edit')
          setLoading(false)
        }
      } catch (error) {
        if (mounted) {
          // If plan doesn't exist (404), start in create mode
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            setMode('create')
            setPlan(null)
          } else {
            const errorMessage = axios.isAxiosError(error)
              ? error.response?.data?.message || error.message || 'Failed to load plan'
              : 'Failed to load plan'
            setLoadError(errorMessage)
          }
          setLoading(false)
        }
      }
    }
    
    loadPlan()
    
    return () => { mounted = false }
  }, [])

  const handleInputChange = (field: keyof UpdateSubscriptionPlanDto, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), featureInput.trim()],
      }))
      setFeatureInput('')
    }
  }

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || [],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      if (mode === 'create') {
        const response = await axios.post<SubscriptionPlan>(API_BASE_URL+'/subscriptions/create', formData)
        setPlan(response.data)
        setMode('edit')
      } else {
        await axios.put(API_BASE_URL+'/subscriptions/plan', formData)
      }
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSaveError(error.response?.data?.message || error.message)
      } else {
        setSaveError(`Failed to ${mode} plan`)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleSwitchToCreate = () => {
    setMode('create')
    setFormData({
      name: '',
      price: 0,
      durationDays: 0,
      description: '',
      features: [],
    })
    setPlan(null)
    setSaveError(null)
    setSaveSuccess(false)
  }

  const handleSwitchToEdit = () => {
    if (plan) {
      setMode('edit')
      setFormData({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        durationDays: plan.durationDays,
        description: plan.description || '',
        features: plan.features || [],
      })
      setSaveError(null)
      setSaveSuccess(false)
    }
  }

  if (loading) return (
    <Layout title="Subscription Plan">
      <LoadingSpinner message="Loading subscription plan..." />
    </Layout>
  )

  if (loadError) {
    return (
      <Layout title="Subscription Plan">
        <div className="card">
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <ErrorMessage 
              message={loadError}
            />
            <button
              onClick={handleSwitchToCreate}
              className="btn btn-success"
              style={{ marginTop: '24px' }}
            >
              Create New Plan
            </button>
          </div>
        </div>
      </Layout>
    )
  };

  console.log(plan);
  

  return (
    <Layout title="Subscription Plan">
      <div className="admin-container">
        {mode === 'create' && !plan && (
          <div className="alert alert-warning">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>No subscription plan found. Create a new one below.</span>
          </div>
        )}
        
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">{mode === 'create' ? 'Create New Subscription Plan' : 'Edit Subscription Plan'}</h3>
            <ModeToggle
              mode={mode}
              hasPlan={!!plan}
              onSwitchToEdit={handleSwitchToEdit}
              onSwitchToCreate={handleSwitchToCreate}
            />
          </div>
          
          <div style={{ padding: '24px' }}>
            <StatusMessages saveSuccess={saveSuccess} saveError={saveError} />
            
            <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
              <div className="form-group">
                <label className="form-label">Plan Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder="Enter plan name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price (in cents/smallest currency unit)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                  required
                  min="0"
                  placeholder="e.g., 999 for $9.99"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Duration (days)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.durationDays}
                  onChange={(e) => handleInputChange('durationDays', parseInt(e.target.value) || 0)}
                  required
                  min="1"
                  placeholder="e.g., 30 for monthly"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  placeholder="Enter plan description"
                />
              </div>

        <FeaturesList
          features={formData.features || []}
          featureInput={featureInput}
          onFeatureInputChange={setFeatureInput}
          onAddFeature={handleAddFeature}
          onRemoveFeature={handleRemoveFeature}
        />

              <button
                type="submit"
                disabled={saving}
                className={`btn ${mode === 'create' ? 'btn-success' : 'btn-primary'}`}
              >
                {saving ? (mode === 'create' ? 'Creating...' : 'Saving...') : (mode === 'create' ? 'Create Plan' : 'Save Changes')}
              </button>
            </form>
          </div>
        </div>

        {plan && <PlanInfo plan={plan} />}
      </div>
    </Layout>
  )
}
