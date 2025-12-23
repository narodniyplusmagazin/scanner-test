import { useEffect, useRef } from 'react'

interface UseCameraScannerOptions {
  onDetected: (data: string) => void
  onError: (error: string) => void
}

/**
 * Custom hook to handle camera initialization and QR code detection
 * Uses native BarcodeDetector API if available, falls back to jsQR library
 */
export const useCameraScanner = ({ onDetected, onError }: UseCameraScannerOptions) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    let stopped = false
    let stream: MediaStream | null = null
    let rafId = 0

    const startCamera = async () => {
      try {
        // Request camera access with rear camera preference
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        })
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          try {
            await videoRef.current.play()
          } catch (playErr) {
            console.warn('Video play interrupted:', playErr)
          }
        }

        // Try native BarcodeDetector API first (faster and more efficient)
        const supportsNativeBarcodeAPI = 'BarcodeDetector' in window

        if (supportsNativeBarcodeAPI) {
          await startNativeBarcodeDetection()
        } else {
          await startJsQRDetection()
        }
      } catch (err) {
        onError(err instanceof Error ? err.message : String(err))
      }
    }

    /**
     * Use native BarcodeDetector API for QR code detection
     */
    const startNativeBarcodeDetection = async () => {
      try {
        const Detector = (window as unknown as { BarcodeDetector: new (config: { formats: string[] }) => { detect: (video: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector
        const detector = new Detector({ formats: ['qr_code'] })
        
        const detectLoop = async () => {
          if (stopped) return
          
          try {
            const detections = await detector.detect(videoRef.current!)
            
            if (detections && detections.length > 0) {
              const qrData = detections[0].rawValue || JSON.stringify(detections[0])
              console.log('QR code detected (native API):', qrData)
              onDetected(qrData)
              return
            }
          } catch {
            // Continue to next frame if detection fails
          }
          
          rafId = requestAnimationFrame(detectLoop)
        }
        
        detectLoop()
      } catch (e) {
        console.warn('Native BarcodeDetector failed, falling back to jsQR:', e)
        await startJsQRDetection()
      }
    }

    /**
     * Use jsQR library as fallback for QR code detection
     */
    const startJsQRDetection = async () => {
      const { default: jsQRLib } = await import('jsqr') as { default: (data: Uint8ClampedArray, width: number, height: number) => { data: string } | null }
      
      const scanLoop = () => {
        if (stopped) return
        
        const video = videoRef.current
        const canvas = canvasRef.current
        
        if (!video || !canvas) {
          rafId = requestAnimationFrame(scanLoop)
          return
        }
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          rafId = requestAnimationFrame(scanLoop)
          return
        }
        
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQRLib(imageData.data, imageData.width, imageData.height)
          
          if (code) {
            console.log('QR code detected (jsQR):', code.data)
            onDetected(code.data)
            return
          }
        } catch {
          // Continue scanning if frame processing fails
        }
        
        rafId = requestAnimationFrame(scanLoop)
      }
      
      rafId = requestAnimationFrame(scanLoop)
    }

    startCamera()

    // Cleanup: stop camera and cancel animation frames
    return () => {
      stopped = true
      if (rafId) cancelAnimationFrame(rafId)
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [onDetected, onError])

  /**
   * Stop the camera stream and reset video element
   */
  const stopCamera = () => {
    try {
      const stream = (videoRef.current?.srcObject as MediaStream) || null
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      videoRef.current?.pause()
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    } catch (e) {
      console.warn('Error stopping camera:', e)
    }
  }

  return { videoRef, canvasRef, stopCamera }
}
