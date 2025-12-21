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
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
        Features
      </label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input
          type="text"
          value={featureInput}
          onChange={(e) => onFeatureInputChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddFeature())}
          placeholder="Add a feature"
          style={{ flex: 1, padding: 8, fontSize: 14, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <button
          type="button"
          onClick={onAddFeature}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Add
        </button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {features.map((feature, index) => (
          <li key={index} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ flex: 1 }}>• {feature}</span>
            <button
              type="button"
              onClick={() => onRemoveFeature(index)}
              style={{
                padding: '4px 8px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
