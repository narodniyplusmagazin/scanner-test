interface ModeToggleProps {
  mode: 'edit' | 'create'
  hasPlan: boolean
  onSwitchToEdit: () => void
  onSwitchToCreate: () => void
}

export default function ModeToggle({ mode, hasPlan, onSwitchToEdit, onSwitchToCreate }: ModeToggleProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <h2>{mode === 'create' ? 'Create New Subscription Plan' : 'Edit Subscription Plan'}</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onSwitchToEdit}
          disabled={mode === 'edit' || !hasPlan}
          style={{
            padding: '8px 16px',
            backgroundColor: mode === 'edit' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: mode === 'edit' || !hasPlan ? 'not-allowed' : 'pointer',
            opacity: mode === 'edit' || !hasPlan ? 0.6 : 1,
          }}
        >
          Edit Mode
        </button>
        <button
          onClick={onSwitchToCreate}
          disabled={mode === 'create'}
          style={{
            padding: '8px 16px',
            backgroundColor: mode === 'create' ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: mode === 'create' ? 'not-allowed' : 'pointer',
            opacity: mode === 'create' ? 0.6 : 1,
          }}
        >
          Create New
        </button>
      </div>
    </div>
  )
}
