import { Capacitor } from '@capacitor/core'
import { PluginListenerHandle } from '@capacitor/core'
import {
  BarcodeScanner,
  BarcodeFormat,
  LensFacing,
} from '@capacitor-mlkit/barcode-scanning'
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser'
import {
  BarcodeFormat as ZxingBarcodeFormat,
  DecodeHintType,
  Result,
} from '@zxing/library'

type OnDetected = (code: string) => void
type OnScanError = () => void

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

  return {
    stop: async () => {
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

  const listeners: PluginListenerHandle[] = []

  listeners.push(
    await BarcodeScanner.addListener('barcodesScanned', ({ barcodes }) => {
      const barcode = barcodes[0]
      const value = barcode?.rawValue || barcode?.displayValue
      if (!value) return
      onDetected(value)
    })
  )

  listeners.push(
    await BarcodeScanner.addListener('scanError', () => {
      onError()
    })
  )

  await BarcodeScanner.startScan({
    formats: nativeFormats,
    lensFacing: LensFacing.Back,
  })

  return {
    stop: async () => {
      await BarcodeScanner.stopScan()
      await Promise.all(listeners.map((listener) => listener.remove()))
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
