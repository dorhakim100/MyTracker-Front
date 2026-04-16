import { Capacitor } from '@capacitor/core'
import {
  BarcodeScanner,
  BarcodeFormat,
} from '@capacitor-mlkit/barcode-scanning'
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser'
import {
  BarcodeFormat as ZxingBarcodeFormat,
  DecodeHintType,
  Result,
} from '@zxing/library'

type OnDetected = (code: string) => void
type OnScanError = (message?: string) => void

interface StartBarcodeScannerOptions {
  videoElement?: HTMLVideoElement | null
  onDetected: OnDetected
  onError: OnScanError
}

interface BarcodeScannerSession {
  stop: () => Promise<void>
}

const zxingFormats = [
  ZxingBarcodeFormat.EAN_13,
  ZxingBarcodeFormat.UPC_A,
  ZxingBarcodeFormat.UPC_E,
  ZxingBarcodeFormat.CODE_128,
]

const nativeFormats = [
  BarcodeFormat.Ean13,
  BarcodeFormat.UpcA,
  BarcodeFormat.UpcE,
  BarcodeFormat.Code128,
]

async function startWebScanner({
  videoElement,
  onDetected,
}: StartBarcodeScannerOptions): Promise<BarcodeScannerSession> {
  if (!videoElement) {
    throw new Error('Barcode scanner video element is missing')
  }

  const hints = new Map<DecodeHintType, unknown>()
  hints.set(DecodeHintType.POSSIBLE_FORMATS, zxingFormats)

  const reader = new BrowserMultiFormatReader(hints, {
    delayBetweenScanAttempts: 500,
  })
  const controls = await reader.decodeFromConstraints(
    { video: { facingMode: { ideal: 'environment' } }, audio: false },
    videoElement,
    (result: Result | undefined) => {
      if (!result) return
      onDetected(result.getText())
    }
  )
  let isStopped = false

  return {
    stop: async () => {
      if (isStopped) return
      isStopped = true
      stopWebScanner(videoElement, controls)
    },
  }
}

function stopWebScanner(
  videoElement: HTMLVideoElement | null,
  controls: IScannerControls | null
) {
  controls?.stop()
  const stream = (videoElement?.srcObject as MediaStream) || null
  stream?.getTracks().forEach((track) => track.stop())
  if (videoElement) {
    videoElement.srcObject = null
  }
}

async function ensureNativePermission() {
  const permission = await BarcodeScanner.checkPermissions()
  if (permission.camera === 'granted' || permission.camera === 'limited') return

  const requestedPermission = await BarcodeScanner.requestPermissions()
  if (
    requestedPermission.camera !== 'granted' &&
    requestedPermission.camera !== 'limited'
  ) {
    throw new Error('Camera permission denied')
  }
}

async function startNativeScanner({
  onDetected,
  onError,
}: StartBarcodeScannerOptions): Promise<BarcodeScannerSession> {
  const supported = await BarcodeScanner.isSupported()
  if (!supported.supported) {
    throw new Error('Native barcode scanner is not supported')
  }

  await ensureNativePermission()
  let isStopped = false

  ;(async () => {
    try {
      const { barcodes } = await BarcodeScanner.scan({
        formats: nativeFormats,
        autoZoom: true,
      })
      if (isStopped) return
      const barcode = barcodes[0]
      const value = barcode?.rawValue || barcode?.displayValue
      if (!value) {
        onError('No barcode detected')
        return
      }
      onDetected(value)
    } catch (err: unknown) {
      if (isStopped) return
      const message = err instanceof Error ? err.message : 'Native scan failed'
      onError(message)
    }
  })()

  return {
    stop: async () => {
      if (isStopped) return
      isStopped = true
      try {
        await BarcodeScanner.stopScan()
      } catch {
        // no-op: scan() may already be closed
      }
    },
  }
}

export const barcodeScannerService = {
  async startScan(
    options: StartBarcodeScannerOptions
  ): Promise<BarcodeScannerSession> {
    if (Capacitor.isNativePlatform()) {
      return startNativeScanner(options)
    }

    return startWebScanner(options)
  },
}
