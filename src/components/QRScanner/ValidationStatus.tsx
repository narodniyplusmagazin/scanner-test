import React from 'react'

interface ValidationStatusProps {
  sending: boolean
  sendError: string | null
  sendSuccess: string | null
  onRetry: () => void
}

const ValidationStatus: React.FC<ValidationStatusProps> = ({
  sending,
  sendError,
  sendSuccess,
  onRetry
}) => {
  if (sending) {
    return <span>Validating QR code...</span>
  }

  if (sendError) {
    return (
      <div>
        <span style={{ color: '#b00020', display: 'block', marginBottom: '0.5rem' }}>
          {sendError}
        </span>
        <button 
          onClick={onRetry}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            backgroundColor: 'white'
          }}
        >
          Retry Validation
        </button>
      </div>
    )
  }

  if (sendSuccess) {
    return (
      <span style={{ color: 'green', fontWeight: '500' }}>
        {sendSuccess}
      </span>
    )
  }

  return null
}

export default ValidationStatus
