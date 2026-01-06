import React from 'react'
import type { DecodedQRData } from './decodeQRData'
import SubscriptionDetails from './SubscriptionDetails'

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
      case 'encrypted': return '🔒'
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
        {decoded.decrypted && (
          <span style={{ 
            marginLeft: '8px', 
            fontSize: '12px', 
            padding: '2px 8px', 
            background: '#e8f5e9', 
            color: '#2e7d32', 
            borderRadius: '4px',
            fontWeight: '600'
          }}>
            🔓 DECRYPTED
          </span>
        )}
        {decoded.encryptionError && (
          <span style={{ 
            marginLeft: '8px', 
            fontSize: '12px', 
            padding: '2px 8px', 
            background: '#ffebee', 
            color: '#c62828', 
            borderRadius: '4px',
            fontWeight: '600'
          }}>
            ⚠️ ENCRYPTION ERROR
          </span>
        )}
      </div>

      {/* Display main value */}
      {decoded.displayValue && (
        <div className="qr-display-value">
          <pre>{decoded.displayValue}</pre>
        </div>
      )}

      {/* Display encryption error if present */}
      {decoded.encryptionError && (
        <div style={{ 
          padding: '12px', 
          background: '#ffebee', 
          border: '1px solid #ef5350',
          borderRadius: '8px', 
          marginBottom: '12px',
          color: '#c62828'
        }}>
          <strong>⚠️ Decryption Failed:</strong>
          <div style={{ marginTop: '4px', fontSize: '14px' }}>{decoded.encryptionError}</div>
          <div style={{ marginTop: '8px', fontSize: '13px', color: '#d32f2f' }}>
            The QR code appears to be encrypted. Please verify the encryption key is correct.
          </div>
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

      {/* Fetch and display subscription details if this is a subscription QR */}
      {decoded.type === 'subscription' && decoded.parsed?.subscriptionId && decoded.parsed?.userId && (
        <SubscriptionDetails 
          subscriptionId={String(decoded.parsed.subscriptionId)}
          userId={String(decoded.parsed.userId)}
        />
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
