import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType, Result } from '@zxing/library'
import { searchService } from '../../services/search/search-service'
import { showErrorMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { ItemDetails } from '../ItemDetails/ItemDetails'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { setItem } from '../../store/actions/item.actions'
import { Item } from '../../types/item/Item'
import { RootState } from '../../store/store'

import Lottie from 'lottie-react'
import searchingAnimation from '../../../public/searching.json'
import searchingAnimationDark from '../../../public/searching-dark.json'
import scanAnimation from '../../../public/scanning.gif'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import AddIcon from '@mui/icons-material/Add'
import { MealItem } from '../../types/mealItem/MealItem'
import { Refresh } from '@mui/icons-material'

interface BarcodeScannerProps {
  onClose: () => void
  onAddToMealClick?: (item: MealItem) => void
}

export function BarcodeScanner({
  onClose,
  onAddToMealClick,
}: BarcodeScannerProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [isItemDetected, setIsItemDetected] = useState(false)
  const [isItemFound, setIsItemFound] = useState(false)
  const [isTryAgain, setIsTryAgain] = useState(false)
  const [isCustomLog, setIsCustomLog] = useState(false)

  useEffect(() => {
    if (isItemDetected) return
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
      if (videoEl) {
        videoEl.srcObject = null
      }
    }
  }, [onClose])

  async function onDetected(code: string) {
    try {
      setIsItemDetected(true)
      const res = await searchService.getProductById(code)
      if (!res) {
        showErrorMsg(messages.error.noResults)
        setIsTryAgain(true)
        return
      }
      setItem(res as Item)
      setIsItemFound(true)

      //onClose()
    } catch (err) {
      showErrorMsg(messages.error.scan)
    }
  }

  const onCustomLog = () => {
    setIsCustomLog(true)
  }

  return (
    <>
      {!isItemDetected && (
        <div className="barcode-scanner-container">
          <div className="barcode-scanner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="preview"
            />
            <div className="animation-container">
              <img src={scanAnimation} alt="scanner" />
            </div>
          </div>
          <CustomButton
            text="Custom Log"
            onClick={onCustomLog}
            icon={<AddIcon />}
            fullWidth
          />
        </div>
      )}
      {isItemDetected && !isItemFound && isTryAgain && (
        <CustomButton
          text="Try Again"
          onClick={() => {
            setIsItemDetected(false)
            setIsTryAgain(false)
          }}
          icon={<Refresh />}
          fullWidth
        />
      )}
      {isItemDetected && !isTryAgain && (
        <div className="searching-animation-container">
          <Lottie
            animationData={
              prefs.isDarkMode ? searchingAnimationDark : searchingAnimation
            }
            loop={true}
            width={100}
            height={100}
          />
        </div>
      )}
      <SlideDialog
        open={isCustomLog || isItemFound}
        onClose={onClose}
        component={
          <ItemDetails
            isCustomLog={isCustomLog}
            onAddToMealClick={onAddToMealClick}
          />
        }
        title={isCustomLog ? 'Custom Log' : 'Barcode Scanned'}
        type="full"
      />
    </>
  )
}
