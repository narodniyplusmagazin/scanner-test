import React from 'react'

interface ErrorDisplayProps {
  error: string
}

/**
 * Displays error messages to the user
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <div className="status-message status-error" style={{ marginBottom: '1rem' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>Error: {error}</span>
    </div>
  )
}

export default ErrorDisplay
