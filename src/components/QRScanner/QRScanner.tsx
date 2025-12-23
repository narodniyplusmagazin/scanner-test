import React, { useState } from 'react'
import './QRScanner.css'
import { useCameraScanner } from './useCameraScanner'
import { useQRValidation } from './useQRValidation'
import ScannerViewport from './ScannerViewport'
import ScannerResult from './ScannerResult'
import ErrorDisplay from './ErrorDisplay'
import Layout from '../Layout/Layout'


const QRScanner: React.FC = () => {
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { 
    sending, 
    sendError, 
    sendSuccess, 
    validateQRCode,
    deleting,
    deleteError,
    deleteSuccess,
    deleteSubscription
  } = useQRValidation()

  const handleDetected = (data: string) => {
    console.log('QR Code detected:', data)
    setResult(data)
    stopCamera()
    validateQRCode(data)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const { videoRef, canvasRef, stopCamera } = useCameraScanner({
    onDetected: handleDetected,
    onError: handleError
  })

  const handleRetry = () => {
    if (result) {
      validateQRCode(result)
    }
  }

  const handleDelete = () => {
    if (result) {
      deleteSubscription(result)
    }
  }

  const handleScanAgain = () => {
    window.location.reload()
  }

  return (
    <Layout title="QR Scanner">
      <div className="qr-scanner-container">
        {!result && !error && (
          <div className="scanner-instructions">
            <div className="instruction-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <h3>Scan a QR Code</h3>
            <p>Position the QR code within the frame. The scanner will automatically detect and validate it.</p>
          </div>
        )}
        
        {error && <ErrorDisplay error={error} />}
        
        {!result && <ScannerViewport videoRef={videoRef} canvasRef={canvasRef} />}
        
        {result && (
          <ScannerResult
            result={result}
            sending={sending}
            sendError={sendError}
            sendSuccess={sendSuccess}
            onRetry={handleRetry}
            onScanAgain={handleScanAgain}
            deleting={deleting}
            deleteError={deleteError}
            deleteSuccess={deleteSuccess}
            onDelete={handleDelete}
          />
        )}
      </div>
    </Layout>
  )
}

export default QRScanner
