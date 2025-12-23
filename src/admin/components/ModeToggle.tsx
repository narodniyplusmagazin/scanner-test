interface ModeToggleProps {
  mode: 'edit' | 'create'
  hasPlan: boolean
  onSwitchToEdit: () => void
  onSwitchToCreate: () => void
}

export default function ModeToggle({ mode, hasPlan, onSwitchToEdit, onSwitchToCreate }: ModeToggleProps) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        type="button"
        onClick={onSwitchToEdit}
        disabled={mode === 'edit' || !hasPlan}
        className={`btn btn-sm ${mode === 'edit' ? 'btn-primary-active' : 'btn-primary'}`}
      >
        Edit Mode
      </button>
      <button
        type="button"
        onClick={onSwitchToCreate}
        disabled={mode === 'create'}
        className={`btn btn-sm ${mode === 'create' ? 'btn-success' : 'btn-primary'}`}
      >
        Create New
      </button>
    </div>
  )
}
