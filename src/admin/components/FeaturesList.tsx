interface FeaturesListProps {
  features: string[]
  featureInput: string
  onFeatureInputChange: (value: string) => void
  onAddFeature: () => void
  onRemoveFeature: (index: number) => void
}

export default function FeaturesList({
  features,
  featureInput,
  onFeatureInputChange,
  onAddFeature,
  onRemoveFeature,
}: FeaturesListProps) {
  return (
    <div className="form-group">
      <label className="form-label">Features</label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          className="form-input"
          value={featureInput}
          onChange={(e) => onFeatureInputChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddFeature())}
          placeholder="Add a feature..."
        />
        <button
          type="button"
          onClick={onAddFeature}
          className="btn btn-primary"
          style={{ whiteSpace: 'nowrap' }}
        >
          + Add
        </button>
      </div>
      {features.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {features.map((feature, index) => (
            <li key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              marginBottom: 8,
              padding: '12px',
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--gray-200)'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, color: 'var(--success-color)' }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span style={{ flex: 1, color: 'var(--gray-700)' }}>{feature}</span>
              <button
                type="button"
                onClick={() => onRemoveFeature(index)}
                className="btn btn-sm btn-danger"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
