import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType, Result } from '@zxing/library'
import { searchService } from '../../services/search/search-service'
import { showErrorMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { ItemDetails } from '../ItemDetails/ItemDetails'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { setItem } from '../../store/actions/item.actions'
import { Item } from '../../types/item/Item'

interface BarcodeScannerProps {
  onClose: () => void
}

export function BarcodeScanner({ onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [isItemDetected, setIsItemDetected] = useState(false)
  const [isItemFound, setIsItemFound] = useState(false)

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
  }, [onClose])

  async function onDetected(code: string) {
    try {
      console.log('code', code)
      setIsItemDetected(true)
      const res = await searchService.getProductsByIds([code])
      console.log('res', res)

      //   setIsItemFound(true)
      if (!res.length) {
        showErrorMsg(messages.error.noResults)
        return
      }
      setItem(res[0] as Item)
      setIsItemFound(true)
      console.log('res', res)

      //onClose()
    } catch (err) {
      console.log(err)
      showErrorMsg(messages.error.scan)
    }
  }

  return (
    <>
      <div className='barcode-scanner'>
        <video ref={videoRef} autoPlay playsInline muted className='preview' />
      </div>
      <SlideDialog
        open={isItemFound}
        onClose={onClose}
        component={<ItemDetails />}
        title='Item'
        onSave={() => {}}
        type='full'
      />
    </>
  )
}
