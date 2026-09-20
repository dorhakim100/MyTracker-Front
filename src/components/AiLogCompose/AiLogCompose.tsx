import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { CircularProgress, Typography } from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { RootState } from '../../store/store'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { uploadService } from '../../services/upload.service'
import { aiLogService } from '../../services/aiLog/aiLog.service'
import { showErrorMsg } from '../../services/event-bus.service'
import type { AiLogEstimate } from '../../types/aiLog/AiLog'
import { aiLogComposeNs } from './locals'
import { CustomAnimatedText } from '../../CustomMui/CustomAnimatedText/CustomAnimatedText'

interface AiLogComposeProps {
  onEstimated: (estimate: AiLogEstimate) => void
  onOpenSearch: () => void
}

export function AiLogCompose({ onEstimated, onOpenSearch }: AiLogComposeProps) {
  const { t } = useTranslation(aiLogComposeNs)
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isEstimating, setIsEstimating] = useState(false)
  const [cantFigure, setCantFigure] = useState(false)
  const [error, setError] = useState('')

  const isBusy = isUploading || isEstimating
  const canSend = !isBusy && (!!imageUrl || !!text.trim())

  const onPickPhoto = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (!ev.target.files?.length) return
    setCantFigure(false)
    setError('')
    setIsUploading(true)
    try {
      const res = await uploadService.uploadAiPlateImg(ev)
      if (res?.secure_url) {
        setImageUrl(res.secure_url)
      } else {
        showErrorMsg(t('errorGeneric'))
      }
    } catch {
      showErrorMsg(t('errorGeneric'))
    } finally {
      setIsUploading(false)
      ev.target.value = ''
    }
  }

  const onSend = async () => {
    if (!canSend) return
    setCantFigure(false)
    setError('')
    setIsEstimating(true)
    try {
      const estimate = await aiLogService.estimate({
        imageUrl: imageUrl || undefined,
        text: text.trim() || undefined,
      })
      if (estimate.mode === 'cant_figure') {
        setCantFigure(true)
        return
      }
      console.log('estimate', estimate)
      onEstimated({
        ...estimate,
        imageUrl: estimate.imageUrl || imageUrl || undefined,
      })
    } catch {
      setError(t('errorGeneric'))
    } finally {
      setIsEstimating(false)
    }
  }

  return (
    <div className={`ai-log-compose ${prefs.favoriteColor}`}>
      <div className='photo-section'>
        <div className='image-preview box-shadow white-outline'>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={t('photoAlt')}
            />
          ) : (
            <div className='placeholder'>{t('noPhoto')}</div>
          )}
        </div>
        <label className={`upload-button ${isBusy ? 'disabled' : ''}`}>
          <input
            type='file'
            accept='image/*'
            // capture='environment'
            onChange={onPickPhoto}
            disabled={isBusy}
          />
          {isUploading ? (
            <span className='uploading-text'>
              {t('uploading')}
              <CircularProgress
                size={16}
                color='inherit'
              />
            </span>
          ) : (
            t('uploadPhoto')
          )}
        </label>
      </div>

      <CustomInput
        value={text}
        onChange={(value) => {
          setText(value)
          setCantFigure(false)
          setError('')
        }}
        placeholder={t('description')}
        multiline
        minRows={4}
        className={`${prefs.favoriteColor}`}
      />
      <CustomAnimatedText className='hint-container'>
        <Typography
          variant='body2'
          className='hint'
        >
          {t('descriptionHint')}
        </Typography>
      </CustomAnimatedText>

      {cantFigure && (
        <>
          <Typography
            variant='body1'
            className='cant-figure'
          >
            {t('cantFigure')}
          </Typography>
          <CustomButton
            text={t('openSearch')}
            onClick={onOpenSearch}
            className={`search-button ${prefs.favoriteColor}`}
          />
        </>
      )}

      {error && (
        <Typography
          variant='body2'
          className='error-text'
        >
          {error}
        </Typography>
      )}

      <CustomButton
        text={isEstimating ? t('estimating') : t('send')}
        onClick={onSend}
        disabled={!canSend}
        className={`send-button ${prefs.favoriteColor}`}
        icon={
          isEstimating ? (
            <CircularProgress
              size={20}
              color='inherit'
            />
          ) : (
            <AutoAwesomeIcon />
          )
        }
      />
    </div>
  )
}
