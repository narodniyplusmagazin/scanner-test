import React from 'react'

interface ErrorDisplayProps {
  error: string
}

/**
 * Displays error messages to the user
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return <p className="error">Error: {error}</p>
}

export default ErrorDisplay
