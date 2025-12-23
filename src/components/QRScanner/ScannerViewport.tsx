import React from 'react'

interface ScannerViewportProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

const ScannerViewport: React.FC<ScannerViewportProps> = ({ videoRef, canvasRef }) => {
  return (
    <div className="viewport">
      <video ref={videoRef} playsInline muted />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="scan-guide" />
    </div>
  )
}

export default ScannerViewport
