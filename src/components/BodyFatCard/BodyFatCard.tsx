import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CircularProgress, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { uploadService } from '../../services/upload.service'
import { bodyFatService } from '../../services/bodyFat/bodyFat.service'
import { showErrorMsg } from '../../services/event-bus.service'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { WeightEdit } from '../WeightCard/WeightEdit'
import type { BodyFatResult } from '../../types/bodyFat/BodyFat'
import PercentIcon from '@mui/icons-material/Percent';

const DEFAULT_WEIGHT = 70

export function BodyFatCard() {
  const { t } = useTranslation()
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )
  const user = useSelector(
    (storeState: RootState) => storeState.userModule.user
  )
  const traineeUser = useSelector(
    (storeState: RootState) => storeState.userModule.traineeUser
  )

  const displayUser = traineeUser || user

  const [weightKg, setWeightKg] = useState(DEFAULT_WEIGHT)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isEstimating, setIsEstimating] = useState(false)
  const [weightDialogOpen, setWeightDialogOpen] = useState(false)
  const [result, setResult] = useState<BodyFatResult | null>(null)

  useEffect(() => {
    const logged = displayUser?.lastWeight?.kg
    if (logged) setWeightKg(logged)
  }, [displayUser?.lastWeight?.kg])

  const isBusy = isUploading || isEstimating

  const onPickPhoto = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (!ev.target.files?.length) return

    setResult(null)
    setIsUploading(true)

    try {
      const res = await uploadService.uploadBodyFatImg(ev)
      console.log('res', res)
      if (res?.secure_url) {
        setImageUrl(res.secure_url)
      } else {
        showErrorMsg(t('messages.error.uploadImg'))
      }
    } catch {
      showErrorMsg(t('messages.error.uploadImg'))
    } finally {
      setIsUploading(false)
      ev.target.value = ''
    }
  }

  const onEstimate = async () => {
    if (!imageUrl) {
      showErrorMsg(t('bodyFat.errorNoPhoto'))
      return
    }
    if (!weightKg || weightKg <= 0) {
      showErrorMsg(t('bodyFat.errorInvalidWeight'))
      return
    }

    setResult(null)
    setIsEstimating(true)

    try {
      const estimateResult = await bodyFatService.estimate({
        imageUrl,
        weightKg,
      })
      setResult(estimateResult)
    } catch {
      setResult({
        kind: 'error',
        message: t('bodyFat.errorGeneric'),
      })
    } finally {
      setIsEstimating(false)
    }
  }

  const onSaveWeight = (value: number) => {
    setWeightKg(value)
    setWeightDialogOpen(false)
  }

  const renderResult = () => {
    if (!result) return null

    if (result.kind === 'success') {
      return (
        <div className='body-fat-result success'>
          <Typography variant='h6' className='result-title'>
            {t('bodyFat.resultTitle')}
          </Typography>
          <Typography variant='h5' className='result-range'>
            {t('bodyFat.resultRange', {
              min: result.bodyFatMin,
              max: result.bodyFatMax,
            })}
          </Typography>
          <Typography variant='body2' className='result-note'>
            {result.note}
          </Typography>
        </div>
      )
    }

    if (result.kind === 'unusable_photo') {
      return (
        <div className='body-fat-result error'>
          <Typography variant='body1' className='result-error-title'>
            {t('bodyFat.unusablePhotoTitle')}
          </Typography>
          <Typography variant='body2'>{result.message}</Typography>
        </div>
      )
    }

    return (
      <div className='body-fat-result error'>
        <Typography variant='body2'>{result.message}</Typography>
      </div>
    )
  }

  return (
    <>
      <Card
        variant='outlined'
        className={`card body-fat-card ${prefs.isDarkMode ? 'dark-mode' : ''} ${
          prefs.favoriteColor
        }`}
      >



<div className="controls-contianer">

        <div className='photo-section'>
          <div className='image-preview box-shadow white-outline'>
            {imageUrl ? (
              <img src={imageUrl} alt={t('bodyFat.photoAlt')} />
            ) : (
              <div className='placeholder'>{t('bodyFat.noPhoto')}</div>
            )}
          </div>
          <label
            className={`upload-button ${prefs.isDarkMode ? 'dark-mode' : ''} ${
              isBusy ? 'disabled' : ''
              }`}
              >
            <input
              type='file'
              accept='image/*'
              capture='environment'
              onChange={onPickPhoto}
              disabled={isBusy}
              />
            {isUploading ?
            <span className='uploading-text'>
              { t('user.uploading')}
              <CircularProgress size={16} color='inherit' />
            </span>
            : t('bodyFat.uploadPhoto')}
          </label>
        </div>

        <div className='weight-row'>
          <Typography variant='h6' className='weight-value'>
            {weightKg}
            <span className='weight-unit'>{t('weight.kg')}</span>
          </Typography>
          <CustomButton
            text={t('bodyFat.editWeight')}
            onClick={() => setWeightDialogOpen(true)}
            className={`${prefs.favoriteColor} edit-weight-btn`}
            disabled={isBusy}
            />
        </div>
            </div>
        <Typography variant='body2' className='photo-guidance'>
          {t('bodyFat.photoGuidance')}
        </Typography>

        <CustomButton
          text={
            isEstimating ? t('bodyFat.estimating') : t('bodyFat.getEstimate')
          }
          onClick={onEstimate}
          className={`${prefs.favoriteColor} estimate-btn`}
          disabled={isBusy || !imageUrl}
          icon={
          isEstimating ? <CircularProgress size={20} color='inherit' /> :
          <PercentIcon />
          }
        />

        {renderResult()}

        <Typography variant='caption' className='disclaimer'>
          {t('bodyFat.disclaimer')}
        </Typography>
      </Card>

      <SlideDialog
        open={weightDialogOpen}
        onClose={() => setWeightDialogOpen(false)}
        component={
          <WeightEdit value={weightKg} onChange={onSaveWeight} />
        }
        title={t('bodyFat.editWeight')}
      />
    </>
  )
}
