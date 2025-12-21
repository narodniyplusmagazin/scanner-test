/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react'
import './QRScanner.css'

const QRScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState<string | null>(null)

  useEffect(() => {
    let stopped = false
    let stream: MediaStream | null = null
    let rafId = 0

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          try {
            await videoRef.current.play()
          } catch (playErr: any) {
            // ignore intermittent "play() was interrupted by a new load request" errors
          }
        }

        const supportsBarcode = 'BarcodeDetector' in window

        if (supportsBarcode) {
          try {
            const Detector = (window as any).BarcodeDetector
            const detector = new Detector({ formats: ['qr_code'] })
            const detectLoop = async () => {
              if (stopped) return
              try {
                const detections = await detector.detect(videoRef.current!)
                if (detections && detections.length) {
                  const data = detections[0].rawValue || JSON.stringify(detections[0])
                  handleDetected(data)
                  return
                }
              } catch (e: any) {
                // fallthrough to next frame
              }
              rafId = requestAnimationFrame(detectLoop)
            }
            detectLoop()
            return
          } catch (e:any) {
            // Browser has API but construction failed — fallback to jsQR
          }
        }

        // Fallback using jsQR + canvas
        const { default: jsQRLib }: any = await import('jsqr')
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
              handleDetected(code.data)
              return
            }
          } catch (e) {
            // ignore
          }
          rafId = requestAnimationFrame(scanLoop)
        }
        rafId = requestAnimationFrame(scanLoop)
      } catch (err: any) {
        setError(err?.message || String(err))
      }
    }

    start()

    return () => {
      stopped = true
      if (rafId) cancelAnimationFrame(rafId)
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  const handleDetected = (data: string) => {
    setResult(data)
    // stop camera
    try {
      const stream = (videoRef.current?.srcObject as MediaStream) || null
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
      videoRef.current?.pause()
      videoRef.current!.srcObject = null
    } catch (e) {
      // ignore
    }
    sendResult(data)
  }

  const sendResult = async (data: string) => {
    setSending(true)
    setSendError(null)
    setSendSuccess(null)
    try {
      const res = await fetch('https://magazin-9614959e5831.herokuapp.com/one-c/qr/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'onec_key_example'
        },
        body: JSON.stringify({ code: data })
      })

      console.log(res);
      
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(`${res.status} ${res.statusText}: ${txt}`)
      }
      const body = await res.text()
      setSendSuccess(body || 'ok')
    } catch (err: any) {
      setSendError(err?.message || String(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="qr-scanner">
      <h2>QR Scanner</h2>
      {error && <p className="error">Error: {error}</p>}
      {!result && (
        <div className="viewport">
          <video ref={videoRef} playsInline muted />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className="scan-guide" />
        </div>
      )}
      {result && (
        <div className="result">
          <strong>Result:</strong>
          <pre>{result}</pre>
          <div>
            {sending ? (
              <span>Sending...</span>
            ) : sendError ? (
              <span style={{ color: '#b00020' }}>Error sending: {sendError}</span>
            ) : sendSuccess ? (
              <span style={{ color: 'green' }}>Sent: {sendSuccess}</span>
            ) : (
              <button onClick={() => sendResult(result)}>Send result</button>
            )}
          </div>
          <button onClick={() => window.location.reload()}>Scan again</button>
        </div>
      )}

      {JSON.stringify({ result, error, sending, sendError, sendSuccess })}
    </div>
  )
}

export default QRScanner
