import React from 'react'
import type { DecodedQRData } from './decodeQRData'

interface QRDataDisplayProps {
  decoded: DecodedQRData
}

/**
 * Display decoded QR data in a structured, readable format
 */
const QRDataDisplay: React.FC<QRDataDisplayProps> = ({ decoded }) => {
  const getTypeIcon = () => {
    switch (decoded.type) {
      case 'subscription': return '🎫'
      case 'url': return '🔗'
      case 'email': return '📧'
      case 'phone': return '📞'
      case 'sms': return '💬'
      case 'wifi': return '📶'
      case 'json': return '📄'
      case 'text': return '📝'
      default: return '📋'
    }
  }

  const getTypeLabel = () => {
    return decoded.type.toUpperCase()
  }

  return (
    <div className="qr-data-display">
      <div className="qr-type">
        <span className="qr-type-icon">{getTypeIcon()}</span>
        <span className="qr-type-label">{getTypeLabel()}</span>
      </div>

      {/* Display main value */}
      {decoded.displayValue && (
        <div className="qr-display-value">
          <pre>{decoded.displayValue}</pre>
        </div>
      )}

      {/* Display parsed data if available */}
      {decoded.parsed && Object.keys(decoded.parsed).length > 0 && (
        <details className="qr-details">
          <summary>Details</summary>
          <div className="qr-parsed-data">
            {Object.entries(decoded.parsed).map(([key, value]) => (
              <div key={key} className="qr-field">
                <strong>{key}:</strong>
                <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Show raw data */}
      <details className="qr-raw-data">
        <summary>Raw Data</summary>
        <pre>{decoded.raw}</pre>
      </details>
    </div>
  )
}

export default QRDataDisplay
