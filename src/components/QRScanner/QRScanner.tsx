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
    validationData,
    validateQRCode,
    confirming,
    confirmError,
    confirmSuccess,
    confirmQRUsage,
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

  const handleConfirmUsage = () => {
    if (result) {

      console.log(result,"result");
      
      confirmQRUsage(result)
    }
  }

  const handleScanAgain = () => {
    window.location.reload()
  }

  return (
    <Layout title="QR Сканер">
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
            <h3>Сканировать QR-код</h3>
            <p>Наведите QR-код в рамку. Сканер автоматически распознает и проверит его.</p>
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
            validationData={validationData?.data || null}
            onRetry={handleRetry}
            onScanAgain={handleScanAgain}
            confirming={confirming}
            confirmError={confirmError}
            confirmSuccess={confirmSuccess}
            onConfirmUsage={handleConfirmUsage}
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
