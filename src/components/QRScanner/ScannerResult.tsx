import React, { useMemo } from 'react'
import ValidationStatus from './ValidationStatus'
import QRDataDisplay from './QRDataDisplay'
import { decodeQRData } from './decodeQRData'
import type { QRData } from './useQRValidation'

interface ScannerResultProps {
  result: string
  sending: boolean
  sendError: string | null
  sendSuccess: string | null
  validationData: QRData | null
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
  validationData,
  onRetry,
  onScanAgain,
  deleting,
  deleteError,
  deleteSuccess,
  onDelete
}) => {

    console.log(result, "QR result in ScannerResult");
    
  // Decode QR data once
  const decodedData = useMemo(() => decodeQRData(result), [result])
  

  return (
    <div className="result">
      <strong>Scanned QR Code</strong>
      <QRDataDisplay decoded={decodedData} />
      
      <div>
        <ValidationStatus
          sending={sending}
          sendError={sendError}
          sendSuccess={sendSuccess}
          validationData={validationData}
          onRetry={onRetry}
        />
      </div>
      
      {/* Delete subscription section */}
      {decodedData.type === 'subscription' && (
        <div className="delete-section">
          {deleting ? (
            <div className="status-message status-loading">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" opacity="0.25" />
                <path d="M12 2 A10 10 0 0 1 22 12" strokeLinecap="round" />
              </svg>
              <span>Deleting subscription...</span>
            </div>
          ) : deleteError ? (
            <div className="status-message status-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Error deleting: {deleteError}</span>
            </div>
          ) : deleteSuccess ? (
            <div className="status-message status-success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{deleteSuccess}</span>
            </div>
          ) : (
            <button 
              onClick={onDelete} 
              className="btn-danger-action"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete Subscription
            </button>
          )}
        </div>
      )}
      
      <button onClick={onScanAgain} className="btn-scan">Scan Another QR Code</button>
    </div>
  )
}

export default ScannerResult
