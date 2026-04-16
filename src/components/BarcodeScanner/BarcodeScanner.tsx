import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Capacitor } from '@capacitor/core'
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
  const isNativePlatform = Capacitor.isNativePlatform()

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const scannerSessionRef = useRef<{ stop: () => Promise<void> } | null>(null)

  const isItemDetected = useRef(false)
  const [isScannerLocked, setIsScannerLocked] = useState(false)
  const [isItemFound, setIsItemFound] = useState(false)
  const [isTryAgain, setIsTryAgain] = useState(false)
  const [isCustomLog, setIsCustomLog] = useState(false)
  const [scanAttempt, setScanAttempt] = useState(0)
  const getScanErrorMessage = useCallback(
    (extra?: string) =>
      extra ? `${t('messages.error.scan')} (${extra})` : t('messages.error.scan'),
    [t]
  )

  const stopScanner = useCallback(async () => {
    const activeSession = scannerSessionRef.current
    if (!activeSession) return
    scannerSessionRef.current = null
    await activeSession.stop()
  }, [])

  const onTryAgain = useCallback(() => {
    isItemDetected.current = false
    setIsScannerLocked(false)
    setIsTryAgain(false)
    setScanAttempt((prev) => prev + 1)
  }, [])

  const onDetected = useCallback(
    async (code: string) => {
      try {
        if (isItemDetected.current) return
        isItemDetected.current = true
        setIsScannerLocked(true)
        const res = await searchService.getProductById(code)
        if (!res) {
          showErrorMsg(t('messages.error.noResults'))
          setIsTryAgain(true)
          return
        }
        setItem(res as Item)
        setIsItemFound(true)
        await stopScanner()

        // onClose()
      } catch {
        showErrorMsg(t('messages.error.scan'))
        setIsTryAgain(true)
      }
    },
    [stopScanner, t]
  )

  useEffect(() => {
    if (isScannerLocked || isItemFound || isCustomLog) return

    let isUnmounted = false

    ;(async () => {
      try {
        scannerSessionRef.current = await barcodeScannerService.startScan({
          videoElement: videoRef.current,
          onDetected: (code) => {
            onDetected(code)
          },
          onError: (message) => {
            if(message === 'scan canceled.') {
              onClose()
              return 
            }
            showErrorMsg(getScanErrorMessage(message))
            setIsScannerLocked(true)
            setIsTryAgain(true)
          },
        })
      } catch (err: unknown) {
        if (isUnmounted) return
        const errorMessage =
          err instanceof Error ? err.message : 'unknown scanner startup error'
        showErrorMsg(getScanErrorMessage(errorMessage))
        setIsScannerLocked(true)
        setIsTryAgain(true)
      }
    })()

    return () => {
      isUnmounted = true
      void stopScanner()
    }
  }, [
    isCustomLog,
    isItemFound,
    isScannerLocked,
    onDetected,
    scanAttempt,
    stopScanner,
    getScanErrorMessage,
  ])

  useEffect(() => {
    if (!isCustomLog) return
    void stopScanner()
  }, [isCustomLog, stopScanner])

  const onCustomLog = () => {
    setIsScannerLocked(true)
    setIsCustomLog(true)
  }

  const onCloseScanner = async () => {
    await stopScanner()
    onClose()
  }

  return (
    <>
      {!isScannerLocked && (
        <div className="barcode-scanner-container">
          <div className={`barcode-scanner ${isNativePlatform ? 'native' : ''}`}>
            {isNativePlatform ? (
              <div className="native-preview" />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="preview"
              />
            )}
            <div
              className={`animation-container ${isNativePlatform ? 'native' : ''}`}
            >
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
      {isScannerLocked && !isItemFound && isTryAgain && !isCustomLog && (
        <CustomButton
          text={t('common.tryAgain')}
          onClick={onTryAgain}
          icon={<Refresh />}
          fullWidth
          className="try-again-button"
        />
      )}
      {isScannerLocked && !isTryAgain && !isItemFound && !isCustomLog && (
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
        onClose={onCloseScanner}
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
