import React from 'react'
import type { QRData } from './useQRValidation'

interface ValidationStatusProps {
  sending: boolean
  sendError: string | null
  sendSuccess: string | null
  validationData: QRData | null
  onRetry: () => void
}

const ValidationStatus: React.FC<ValidationStatusProps> = ({
  sending,
  sendError,
  sendSuccess,
  validationData,
  onRetry
}) => {
  if (sending) {
    return (
      <div className="status-message status-loading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" opacity="0.25" />
          <path d="M12 2 A10 10 0 0 1 22 12" strokeLinecap="round" />
        </svg>
        <span>Validating QR code...</span>
      </div>
    )
  }

  if (sendError) {
    return (
      <div>
        <div className="status-message status-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{sendError}</span>
        </div>
        <button 
          onClick={onRetry}
          className="btn-secondary"
        >
          Retry Validation
        </button>
      </div>
    )
  }

  if (sendSuccess) {
    return (
      <div>
        <div className="status-message status-success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{sendSuccess}</span>
        </div>
        
        {/* Display detailed validation data */}
        {validationData && (
          <div style={{
            marginTop: '12px',
            padding: '16px',
            background: 'white',
            border: '1px solid #c8e6c9',
            borderRadius: '8px'
          }}>
            <div style={{ 
              fontWeight: '600', 
              color: '#2e7d32',
              marginBottom: '12px',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Validation Details
            </div>
            
            <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
              {validationData.userName && (
                <div style={{ display: 'flex', padding: '8px', background: 'var(--gray-50)', borderRadius: '6px' }}>
                  <strong style={{ minWidth: '140px', color: 'var(--gray-600)' }}>User Name:</strong>
                  <span style={{ color: 'var(--gray-800)' }}>{validationData.userName}</span>
                </div>
              )}
              
              <div style={{ display: 'flex', padding: '8px', background: 'var(--gray-50)', borderRadius: '6px' }}>
                <strong style={{ minWidth: '140px', color: 'var(--gray-600)' }}>Subscription ID:</strong>
                <span style={{ color: 'var(--gray-800)', fontFamily: 'monospace', fontSize: '12px' }}>{validationData.subscriptionId}</span>
              </div>
              
              <div style={{ display: 'flex', padding: '8px', background: 'var(--gray-50)', borderRadius: '6px' }}>
                <strong style={{ minWidth: '140px', color: 'var(--gray-600)' }}>User ID:</strong>
                <span style={{ color: 'var(--gray-800)', fontFamily: 'monospace', fontSize: '12px' }}>{validationData.userId}</span>
              </div>
              
              <div style={{ display: 'flex', padding: '8px', background: 'var(--gray-50)', borderRadius: '6px' }}>
                <strong style={{ minWidth: '140px', color: 'var(--gray-600)' }}>Expires At:</strong>
                <span style={{ color: 'var(--gray-800)' }}>
                  {new Date(validationData.expiresAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              <div style={{ display: 'flex', padding: '8px', background: 'var(--gray-50)', borderRadius: '6px' }}>
                <strong style={{ minWidth: '140px', color: 'var(--gray-600)' }}>Validated At:</strong>
                <span style={{ color: 'var(--gray-800)' }}>
                  {new Date(validationData.validatedAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              {validationData.remainingUses !== null && (
                <div style={{ display: 'flex', padding: '8px', background: 'var(--gray-50)', borderRadius: '6px' }}>
                  <strong style={{ minWidth: '140px', color: 'var(--gray-600)' }}>Remaining Uses:</strong>
                  <span style={{ color: 'var(--gray-800)' }}>{validationData.remainingUses}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}

export default ValidationStatus
