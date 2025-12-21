import { useEffect, useState } from 'react'
import axios from 'axios'
import './Admin.css'
import type { SubscriptionPlan, UpdateSubscriptionPlanDto } from '../types/subscription.types'
import ModeToggle from './components/ModeToggle'
import StatusMessages from './components/StatusMessages'
import FeaturesList from './components/FeaturesList'
import PlanInfo from './components/PlanInfo'

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
    setLoadError(null)
    axios.get<SubscriptionPlan>('https://magazin-9614959e5831.herokuapp.com/subscriptions/plan')
      .then(response => {
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
      })
      .catch((error) => {
        if (mounted) {
          // If plan doesn't exist (404), start in create mode
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            setMode('create')
            setPlan(null)
          } else {
            setLoadError(error.response?.data?.message || error.message || 'Failed to load plan')
          }
          setLoading(false)
        }
      })
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
        const response = await axios.post<SubscriptionPlan>('https://magazin-9614959e5831.herokuapp.com/subscriptions/create', formData)
        setPlan(response.data)
        setMode('edit')
      } else {
        await axios.put('https://magazin-9614959e5831.herokuapp.com/subscriptions/plan', formData)
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

  if (loading) return <div style={{ padding: 24 }}>Loading subscription plan...</div>

  if (loadError) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ color: 'red', marginBottom: 16 }}>Error: {loadError}</div>
        <button
          onClick={handleSwitchToCreate}
          style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 'bold',
          }}
        >
          Create New Plan
        </button>
      </div>
    )
  }

  return (
    <div className="admin-root" style={{ padding: 24 }}>
      {mode === 'create' && !plan && (
        <div style={{ color: '#856404', marginBottom: 16, padding: 12, backgroundColor: '#fff3cd', borderRadius: 4 }}>
          No subscription plan found. Create a new one below.
        </div>
      )}
      
      <ModeToggle
        mode={mode}
        hasPlan={!!plan}
        onSwitchToEdit={handleSwitchToEdit}
        onSwitchToCreate={handleSwitchToCreate}
      />
      
      <StatusMessages saveSuccess={saveSuccess} saveError={saveError} />
      
      <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Plan Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            style={{ width: '100%', padding: 8, fontSize: 14, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Price (in cents/smallest currency unit)
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
            required
            min="0"
            style={{ width: '100%', padding: 8, fontSize: 14, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Duration (days)
          </label>
          <input
            type="number"
            value={formData.durationDays}
            onChange={(e) => handleInputChange('durationDays', parseInt(e.target.value) || 0)}
            required
            min="1"
            style={{ width: '100%', padding: 8, fontSize: 14, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            style={{ width: '100%', padding: 8, fontSize: 14, borderRadius: 4, border: '1px solid #ccc' }}
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
          style={{
            padding: '12px 24px',
            backgroundColor: mode === 'create' ? '#28a745' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: 16,
            fontWeight: 'bold',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? (mode === 'create' ? 'Creating...' : 'Saving...') : (mode === 'create' ? 'Create Plan' : 'Save Changes')}
        </button>
      </form>

      {plan && <PlanInfo plan={plan} />}
    </div>
  )
}
