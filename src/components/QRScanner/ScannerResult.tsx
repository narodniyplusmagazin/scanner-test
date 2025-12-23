import React, { useMemo } from 'react'
import ValidationStatus from './ValidationStatus'
import QRDataDisplay from './QRDataDisplay'
import { decodeQRData } from './decodeQRData'

interface ScannerResultProps {
  result: string
  sending: boolean
  sendError: string | null
  sendSuccess: string | null
  onRetry: () => void
  onScanAgain: () => void
  deleting: boolean
  deleteError: string | null
  deleteSuccess: string | null
  onDelete: () => void
}

const ScannerResult: React.FC<ScannerResultProps> = ({
  result,
  sending,
  sendError,
  sendSuccess,
  onRetry,
  onScanAgain,
  deleting,
  deleteError,
  deleteSuccess,
  onDelete
}) => {

    console.log(result);
    
  // Decode QR data once
  const decodedData = useMemo(() => decodeQRData(result), [result])

  return (
    <div className="result">
      <strong>Scanned QR Code:</strong>
      <QRDataDisplay decoded={decodedData} />
      
      <div>
        <ValidationStatus
          sending={sending}
          sendError={sendError}
          sendSuccess={sendSuccess}
          onRetry={onRetry}
        />
      </div>
      
      {/* Delete subscription section */}
      {decodedData.type === 'subscription' && (
        <div className="delete-section">
          <hr style={{ margin: '1rem 0' }} />
          {deleting ? (
            <span>Deleting subscription...</span>
          ) : deleteError ? (
            <span style={{ color: '#b00020' }}>
              Error deleting: {deleteError}
            </span>
          ) : deleteSuccess ? (
            <span style={{ color: 'green' }}>
              ✓ {deleteSuccess}
            </span>
          ) : (
            <button 
              onClick={onDelete} 
              className="delete-button"
              style={{ 
                backgroundColor: '#b00020', 
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🗑️ Delete Subscription
            </button>
          )}
        </div>
      )}
      
      <button onClick={onScanAgain}>Scan again</button>
    </div>
  )
}

export default ScannerResult
