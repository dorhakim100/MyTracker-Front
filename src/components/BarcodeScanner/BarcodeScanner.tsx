import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { searchService } from '../../services/search/search-service'
import { showErrorMsg } from '../../services/event-bus.service'
import { ItemDetails } from '../ItemDetails/ItemDetails'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { setItem } from '../../store/actions/item.actions'
import { Item } from '../../types/item/Item'
import { RootState } from '../../store/store'
import { barcodeScannerService } from '../../services/barcode-scanner/barcode-scanner.service'

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
  const { t } = useTranslation()
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const videoRef = useRef<HTMLVideoElement | null>(null)

  const isItemDetected = useRef(false)
  const [isItemFound, setIsItemFound] = useState(false)
  const [isTryAgain, setIsTryAgain] = useState(false)
  const [isCustomLog, setIsCustomLog] = useState(false)

  const onDetected = useCallback(
    async (code: string) => {
      try {
        if (isItemDetected.current) return
        isItemDetected.current = true
        const res = await searchService.getProductById(code)
        if (!res) {
          showErrorMsg(t('messages.error.noResults'))
          setIsTryAgain(true)
          return
        }
        setItem(res as Item)
        setIsItemFound(true)

        // onClose()
      } catch {
        showErrorMsg(t('messages.error.scan'))
      }
    },
    [t]
  )

  useEffect(() => {
    let scannerSession: { stop: () => Promise<void> } | null = null
    let isUnmounted = false

    ;(async () => {
      try {
        scannerSession = await barcodeScannerService.startScan({
          videoElement: videoRef.current,
          onDetected: (code) => {
            onDetected(code)
          },
          onError: () => {
            showErrorMsg(t('messages.error.scan'))
          },
        })
      } catch {
        if (isUnmounted) return
        onClose()
      }
    })()

    return () => {
      isUnmounted = true
      scannerSession?.stop()
    }
  }, [onClose, onDetected, t])

  const onCustomLog = () => {
    setIsCustomLog(true)
  }

  return (
    <>
      {!isItemDetected.current && (
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
            text={t('meals.customLog')}
            onClick={onCustomLog}
            icon={<AddIcon />}
            fullWidth
          />
        </div>
      )}
      {isItemDetected.current && !isItemFound && isTryAgain && (
        <CustomButton
          text={t('common.tryAgain')}
          onClick={() => {
            isItemDetected.current = false
            setIsTryAgain(false)
          }}
          icon={<Refresh />}
          fullWidth
        />
      )}
      {isItemDetected.current && !isTryAgain && (
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
        title={isCustomLog ? t('meals.customLog') : t('meals.barcodeScanned')}
        type="full"
      />
    </>
  )
}
