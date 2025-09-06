import { useEffect, useRef } from 'react'
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType, Result } from '@zxing/library'

interface BarcodeScannerProps {
  onDetected: (code: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const hints = new Map<DecodeHintType, unknown>()
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
    ])

    const reader = new BrowserMultiFormatReader(hints, {
      delayBetweenScanAttempts: 500,
    })
    let controls: IScannerControls | null = null

    ;(async () => {
      try {
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } }, audio: false },
          videoRef.current as HTMLVideoElement,
          (result: Result | undefined) => {
            if (result) onDetected(result.getText())
          }
        )
      } catch {
        onClose()
      }
    })()

    return () => {
      if (controls) controls.stop()
      const videoEl = videoRef.current as HTMLVideoElement | null
      const stream = (videoEl?.srcObject as MediaStream) || null
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [onDetected, onClose])

  return (
    <div className='barcode-scanner'>
      <video ref={videoRef} autoPlay playsInline muted className='preview' />
    </div>
  )
}
