import { useRef, useState, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { CircularProgress, DialogActions, Typography } from '@mui/material'
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import DeleteIcon from '@mui/icons-material/Delete'
import { RootState } from '../../../store/store'
import { User } from '../../../types/user/User'
import {
  Weight,
  WeightMeasureField,
  WeightWrite,
} from '../../../types/weight/Weight'
import { weightService } from '../../../services/weight/weight.service'
import { healthService } from '../../../services/health/health.service'
import { uploadService } from '../../../services/upload.service'
import { bodyFatService } from '../../../services/bodyFat/bodyFat.service'
import {
  BodyFatMeasurements,
  BodyFatResult,
} from '../../../types/bodyFat/BodyFat'
import {
  showErrorMsg,
  showSuccessMsg,
} from '../../../services/event-bus.service'
import {
  optimisticUpdateUser,
  setSelectedDiaryDay,
  setTraineeUser,
} from '../../../store/actions/user.actions'
import { LoggedToday } from '../../../types/loggedToday/LoggedToday'
import { getArrayOfNumbers } from '../../../services/util.service'
import { ClockPicker } from '../../Pickers/ClockPicker'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import { CustomAlertDialog } from '../../../CustomMui/CustomAlertDialog/CustomAlertDialog'
import { SlideDialog } from '../../SlideDialog/SlideDialog'
import { BodyFatDetails } from '../../BodyFatDetails/BodyFatDetails'
import { useWeightDays, weightDaysQueryKey } from '../../../hooks/useWeightDays'
import { weightDetailsNs } from './locals'
import './locals'

const DASH = '-'

const FIELDS: {
  key: WeightMeasureField
  label:
    | 'weight'
    | 'waist'
    | 'bodyFat'
    | 'neck'
    | 'chest'
    | 'arms'
    | 'hips'
    | 'thigh'
    | 'calf'
  unit: 'kg' | 'cm' | 'percent'
  min: number
  max: number
  emptyStart: number
}[] = [
  { key: 'kg', label: 'weight', unit: 'kg', min: 30, max: 150, emptyStart: 60 },
  {
    key: 'waistCm',
    label: 'waist',
    unit: 'cm',
    min: 40,
    max: 160,
    emptyStart: 80,
  },
  {
    key: 'bodyFat',
    label: 'bodyFat',
    unit: 'percent',
    min: 3,
    max: 60,
    emptyStart: 20,
  },
  {
    key: 'neckCm',
    label: 'neck',
    unit: 'cm',
    min: 20,
    max: 60,
    emptyStart: 38,
  },
  {
    key: 'chestCm',
    label: 'chest',
    unit: 'cm',
    min: 60,
    max: 160,
    emptyStart: 100,
  },
  {
    key: 'armsCm',
    label: 'arms',
    unit: 'cm',
    min: 15,
    max: 60,
    emptyStart: 35,
  },
  {
    key: 'hipsCm',
    label: 'hips',
    unit: 'cm',
    min: 60,
    max: 160,
    emptyStart: 95,
  },
  {
    key: 'thighCm',
    label: 'thigh',
    unit: 'cm',
    min: 30,
    max: 100,
    emptyStart: 55,
  },
  {
    key: 'calfCm',
    label: 'calf',
    unit: 'cm',
    min: 20,
    max: 60,
    emptyStart: 38,
  },
]

function dayStart(date: string) {
  return new Date(`${date}T00:00:00.000Z`).getTime()
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function formatDay(date: string) {
  return new Date(`${date}T00:00:00.000Z`).toLocaleDateString('he')
}

function hasSavedContent(weight: Weight | undefined) {
  if (!weight) return false
  if (weight.imageUrl) return true
  return FIELDS.some((field) => typeof weight[field.key] === 'number')
}

function measurementsForEstimate(
  weight: Weight
): BodyFatMeasurements | undefined {
  const measurements: BodyFatMeasurements = {}
  if (typeof weight.waistCm === 'number') measurements.waist = weight.waistCm
  if (typeof weight.neckCm === 'number') measurements.neck = weight.neckCm
  if (typeof weight.chestCm === 'number') measurements.chest = weight.chestCm
  if (typeof weight.armsCm === 'number') measurements.arms = weight.armsCm
  if (typeof weight.hipsCm === 'number') measurements.hips = weight.hipsCm
  if (typeof weight.thighCm === 'number') measurements.thigh = weight.thighCm
  if (typeof weight.calfCm === 'number') measurements.calf = weight.calfCm
  return Object.keys(measurements).length ? measurements : undefined
}

export function WeightDetails({
  user,
  date,
  initialWeight,
  onDeleted,
}: {
  user: User
  date: string
  initialWeight?: Weight
  onDeleted: () => void
}) {
  const { t } = useTranslation()
  const { t: tDetails } = useTranslation(weightDetailsNs)
  const queryClient = useQueryClient()
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const photoInputRef = useRef<HTMLInputElement>(null)
  const isNative = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isNative
  )
  const signedIn = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )
  const traineeUser = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.traineeUser
  )
  const selectedDay = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.selectedDay
  )
  const { days } = useWeightDays(user._id)
  const [record, setRecord] = useState<Weight | undefined>(initialWeight)
  const [editing, setEditing] = useState<WeightMeasureField | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isEstimating, setIsEstimating] = useState(false)
  const [confirm, setConfirm] = useState<
    'day' | 'image' | WeightMeasureField | null
  >(null)
  const shownConfirmRef = useRef<'day' | 'image' | WeightMeasureField>('kg')
  if (confirm) shownConfirmRef.current = confirm
  const shownConfirm = confirm ?? shownConfirmRef.current

  console.log('confirm', confirm)
  const [estimate, setEstimate] = useState<BodyFatResult | null>(null)

  const unitLabel = (unit: 'kg' | 'cm' | 'percent') => {
    if (unit === 'kg') return t('weight.kg')
    if (unit === 'cm') return tDetails('cm')
    return '%'
  }

  const startValue = (field: (typeof FIELDS)[number]) => {
    const current = record?.[field.key]
    if (typeof current === 'number') return current
    if (field.key !== 'kg') return field.emptyStart
    const fromDays = days.find((day) => typeof day.weight.kg === 'number')
    if (typeof fromDays?.weight.kg === 'number') return fromDays.weight.kg
    if (typeof user.lastWeight?.kg === 'number') return user.lastWeight.kg
    return field.emptyStart
  }

  const rememberToday = async (next: Weight | null) => {
    if (date !== todayKey()) return
    const isSelf = signedIn?._id === user._id
    const base = isSelf ? signedIn : traineeUser
    if (!base || base._id !== user._id) return

    let lastWeight = next
    if (!lastWeight) {
      const latest = (await weightService.query({
        userId: user._id,
        limit: 1,
      })) as Weight[]
      lastWeight = latest[0] ?? null
    }

    const updated = { ...base, lastWeight: lastWeight ?? undefined }
    if (isSelf) optimisticUpdateUser(updated)
    else setTraineeUser(updated)
  }

  const saveField = async (field: WeightMeasureField, value: number | null) => {
    if (isSaving) return
    const previous = record
    const optimistic: Weight = {
      ...(record ?? { userId: user._id, createdAt: dayStart(date) }),
    }
    if (value == null) delete optimistic[field]
    else optimistic[field] = value
    const stillHasValue = hasSavedContent(optimistic)
    setRecord(stillHasValue ? optimistic : undefined)
    setIsSaving(true)

    try {
      const payload: WeightWrite = {
        userId: user._id,
        createdAt: record?.createdAt ?? dayStart(date),
        [field]: value,
      }
      if (record?._id) payload._id = record._id

      const saved = (await weightService.save(payload)) as Weight | null
      setRecord(saved ?? undefined)
      if (selectedDay?.date === date) {
        setSelectedDiaryDay({
          ...selectedDay,
          weight: saved ?? undefined,
        } as LoggedToday)
      }
      showSuccessMsg(tDetails('saved'))
      void rememberToday(saved)
      void queryClient.invalidateQueries({
        queryKey: weightDaysQueryKey(user._id),
      })
      if (
        signedIn?._id === user._id &&
        isNative &&
        date === todayKey() &&
        field === 'kg' &&
        value != null
      ) {
        void healthService.saveWeight(value)
      }
    } catch {
      setRecord(previous)
      showErrorMsg(tDetails('saveError'))
    } finally {
      setIsSaving(false)
    }
  }

  const saveImage = async (imageUrl: string | null) => {
    if (isSaving) return
    const previous = record
    const optimistic: Weight = {
      ...(record ?? { userId: user._id, createdAt: dayStart(date) }),
    }
    if (imageUrl) optimistic.imageUrl = imageUrl
    else delete optimistic.imageUrl
    setRecord(hasSavedContent(optimistic) ? optimistic : undefined)
    setIsSaving(true)

    try {
      const payload: WeightWrite = {
        userId: user._id,
        createdAt: record?.createdAt ?? dayStart(date),
        imageUrl,
      }
      if (record?._id) payload._id = record._id
      const saved = (await weightService.save(payload)) as Weight | null
      setRecord(saved ?? undefined)
      if (selectedDay?.date === date) {
        setSelectedDiaryDay({
          ...selectedDay,
          weight: saved ?? undefined,
        } as LoggedToday)
      }
      showSuccessMsg(tDetails('saved'))
      void rememberToday(saved)
      void queryClient.invalidateQueries({
        queryKey: weightDaysQueryKey(user._id),
      })
    } catch {
      setRecord(previous)
      showErrorMsg(tDetails('saveError'))
    } finally {
      setIsSaving(false)
    }
  }

  const onPickPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || isUploading || isSaving) return
    setIsUploading(true)
    try {
      const uploaded = await uploadService.uploadBodyFatImg({
        target: { files: [file] },
      })
      if (!uploaded?.secure_url) {
        showErrorMsg(t('messages.error.uploadImg'))
        return
      }
      await saveImage(uploaded.secure_url)
    } catch {
      showErrorMsg(t('messages.error.uploadImg'))
    } finally {
      setIsUploading(false)
    }
  }

  const onEstimate = async () => {
    if (!record?.imageUrl || isEstimating) return
    if (typeof record.kg !== 'number' || record.kg <= 0) {
      showErrorMsg(t('bodyFat.errorInvalidWeight'))
      return
    }
    setIsEstimating(true)
    const result = await bodyFatService.estimate({
      imageUrl: record.imageUrl,
      weightKg: record.kg,
      userId: user._id,
      measurements: measurementsForEstimate(record),
    })
    setIsEstimating(false)
    setEstimate(result)
  }

  const onApplyEstimate = () => {
    if (!estimate || estimate.kind !== 'success') return
    const midpoint =
      Math.round(((estimate.minPercent + estimate.maxPercent) / 2) * 10) / 10
    setEstimate(null)
    void saveField('bodyFat', midpoint)
  }

  const onDeleteDay = async () => {
    if (!record?._id || isSaving) return
    setConfirm(null)
    setIsSaving(true)
    try {
      await weightService.remove(record._id)
      if (selectedDay?.date === date) {
        setSelectedDiaryDay({
          ...selectedDay,
          weight: undefined,
        } as LoggedToday)
      }
      void rememberToday(null)
      void queryClient.invalidateQueries({
        queryKey: weightDaysQueryKey(user._id),
      })
      onDeleted()
    } catch {
      showErrorMsg(tDetails('saveError'))
      setIsSaving(false)
    }
  }

  const editingField = FIELDS.find((field) => field.key === editing)
  const confirmField = FIELDS.find((field) => field.key === shownConfirm)
  const confirmName =
    shownConfirm === 'image'
      ? tDetails('photo')
      : tDetails(confirmField?.label || 'weight')
  const isBusy = isSaving || isUploading || isEstimating

  return (
    <div className='weight-details-container'>
      <div className='day-header'>
        <Typography
          variant='h6'
          className='day-header-label'
        >
          {t('date.date')}
        </Typography>
        <div className='day-header-side'>
          <Typography
            variant='h6'
            className='day-header-value'
          >
            {formatDay(date)}
          </Typography>
          {record?._id && (
            <CustomButton
              isIcon
              size='small'
              className='red'
              icon={<DeleteIcon fontSize='small' />}
              ariaLabel={t('common.delete')}
              onClick={() => setConfirm('day')}
              disabled={isBusy}
            />
          )}
        </div>
      </div>

      <div className='photo-block'>
        <input
          ref={photoInputRef}
          className='photo-input'
          type='file'
          accept='image/*'
          onChange={onPickPhoto}
          disabled={isBusy}
        />
        {record?.imageUrl ? (
          <div className='photo-saved'>
            <img
              src={record.imageUrl}
              alt={t('bodyFat.photoAlt')}
              className='photo-preview box-shadow white-outline'
            />
            <div className='photo-actions'>
              <CustomButton
                text={tDetails('replacePhoto')}
                className={prefs.favoriteColor}
                onClick={() => photoInputRef.current?.click()}
                disabled={isBusy}
              />
              <CustomButton
                isIcon
                size='small'
                className='red'
                icon={<DeleteIcon fontSize='small' />}
                ariaLabel={tDetails('removePhoto')}
                onClick={() => setConfirm('image')}
                disabled={isBusy}
              />
            </div>
          </div>
        ) : (
          <div className='photo-empty'>
            {isUploading ? (
              <CircularProgress
                size={35}
                className={`${prefs.favoriteColor}`}
              />
            ) : (
              <CustomButton
                text={tDetails('addPhoto')}
                icon={<AddAPhotoIcon />}
                className={prefs.favoriteColor}
                onClick={() => photoInputRef.current?.click()}
                disabled={isBusy}
              />
            )}
            <Typography
              variant='caption'
              className='photo-hint'
            >
              {tDetails('photoHint')}
            </Typography>
          </div>
        )}
      </div>

      {FIELDS.map((field) => {
        const value = record?.[field.key]
        const hasValue = typeof value === 'number'
        return (
          <div
            key={field.key}
            className={`field-row ${
              field.key !== 'kg' ? 'bold-header' : 'kg-field'
            }`}
            onClick={() => {
              if (!isBusy) setEditing(field.key)
            }}
          >
            <Typography
              variant='body1'
              className='field-label'
            >
              {tDetails(field.label)}
            </Typography>
            <Typography
              variant='body1'
              className='field-value'
            >
              {hasValue ? (
                <>
                  {value}
                  <span className='field-unit'>{unitLabel(field.unit)}</span>
                </>
              ) : (
                DASH
              )}
            </Typography>
            <div className='field-actions'>
              {field.key === 'bodyFat' && record?.imageUrl && (
                <CustomButton
                  isIcon
                  size='small'
                  icon={
                    isEstimating ? (
                      <CircularProgress
                        size={18}
                        color='inherit'
                      />
                    ) : (
                      <AutoAwesomeIcon fontSize='small' />
                    )
                  }
                  ariaLabel={tDetails('estimate')}
                  onClick={(event) => {
                    event.stopPropagation()
                    void onEstimate()
                  }}
                  disabled={isBusy}
                />
              )}
              {hasValue && (
                <CustomButton
                  isIcon
                  size='small'
                  className='red'
                  icon={<DeleteIcon fontSize='small' />}
                  ariaLabel={tDetails('clear')}
                  onClick={(event) => {
                    event.stopPropagation()
                    setConfirm(field.key)
                  }}
                  disabled={isBusy}
                />
              )}
            </div>
          </div>
        )
      })}

      <SlideDialog
        open={Boolean(editingField)}
        onClose={() => setEditing(null)}
        type='half'
        title={editingField ? tDetails(editingField.label) : ''}
        component={
          editingField ? (
            <ClockPicker
              value={startValue(editingField)}
              onChange={(_, next) => {
                void saveField(editingField.key, next)
              }}
              onClose={() => setEditing(null)}
              minValue={editingField.min}
              maxValue={editingField.max}
              valuesToDisplay={
                getArrayOfNumbers(
                  editingField.min,
                  editingField.max
                ) as number[]
              }
              isButtonsVisible={false}
            />
          ) : (
            <></>
          )
        }
      />

      <SlideDialog
        open={Boolean(estimate)}
        onClose={() => setEstimate(null)}
        type='full'
        title={t('bodyFat.resultTitle')}
        component={
          estimate && record?.imageUrl && typeof record.kg === 'number' ? (
            <BodyFatDetails
              imageUrl={record.imageUrl}
              weightKg={record.kg}
              result={estimate}
              applyLabel={tDetails('apply')}
              onApply={onApplyEstimate}
            />
          ) : (
            <></>
          )
        }
      />

      <CustomAlertDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        title={
          shownConfirm === 'day'
            ? tDetails('deleteDayTitle')
            : tDetails('clearFieldTitle', { field: confirmName })
        }
      >
        <div className='weight-confirm'>
          <Typography variant='body1'>
            {shownConfirm === 'day'
              ? tDetails('deleteDayConfirm')
              : tDetails('clearFieldConfirm')}
          </Typography>
          <DialogActions>
            <CustomButton
              text={t('common.cancel')}
              fullWidth
              onClick={() => setConfirm(null)}
            />
            <CustomButton
              text={
                shownConfirm === 'day' ? t('common.delete') : t('common.clear')
              }
              fullWidth
              className={`${prefs.favoriteColor} delete-account-button`}
              onClick={() => {
                if (confirm === 'day') {
                  void onDeleteDay()
                  return
                }
                const target = confirm
                setConfirm(null)
                if (target === 'image') void saveImage(null)
                else if (target) void saveField(target, null)
              }}
            />
          </DialogActions>
        </div>
      </CustomAlertDialog>
    </div>
  )
}
