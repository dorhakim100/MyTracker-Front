import { ReactNode, useMemo } from 'react'
import { useSelector } from 'react-redux'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'

import { RootState } from '../../store/store'
import { capitalizeFirstLetter } from '../../services/util.service'
import { CustomButton } from '../CustomButton/CustomButton'
import { SlideAnimation } from '../../components/SlideAnimation/SlideAnimation'
import { useTranslation } from 'react-i18next'

interface CustomStepperProps<TStage extends string = string> {
  stages: TStage[]
  activeStage: TStage
  onStageChange: (stage: TStage, diff: number) => void
  renderStage: (stage: TStage) => ReactNode
  className?: string
  title?: string | ((stage: TStage) => string)
  getIsNextDisabled?: (stage: TStage) => boolean
  getIsPreviousDisabled?: (stage: TStage) => boolean
  onFinish?: () => void
  finishText?: string
  previousText?: string
  nextText?: string
  footerClassName?: string
  direction?: number
  stagesTitles?: string[]
}

export function CustomStepper<TStage extends string = string>({
  stages,
  activeStage,
  onStageChange,
  renderStage,
  className,
  title,
  getIsNextDisabled,
  getIsPreviousDisabled,
  onFinish,
  finishText = 'Save',
  previousText = 'Previous',
  nextText = 'Next',
  footerClassName,
  direction = 1,
  stagesTitles,
}: CustomStepperProps<TStage>) {
  const { t } = useTranslation()
  finishText = t('common.save')
  previousText = t('common.previous')
  nextText = t('common.next')

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const activeIndex = useMemo(
    () => stages.findIndex((s) => s === activeStage),
    [stages, activeStage]
  )

  const isAtStart = activeIndex <= 0
  const isAtEnd = activeIndex >= stages.length - 1

  function onChange(diff: number) {
    const targetIndex = activeIndex + diff
    if (targetIndex < 0 || targetIndex >= stages.length) return
    onStageChange(stages[targetIndex], diff)
  }

  const resolvedTitle = useMemo(() => {
    if (!title) return undefined
    return typeof title === 'function' ? title(activeStage) : title
  }, [title, activeStage])

  const isPrevDisabled = useMemo(() => {
    if (typeof getIsPreviousDisabled === 'function')
      return getIsPreviousDisabled(activeStage)
    return isAtStart
  }, [getIsPreviousDisabled, activeStage, isAtStart])

  const isNextDisabled = useMemo(() => {
    if (typeof getIsNextDisabled === 'function')
      return getIsNextDisabled(activeStage)
    return isAtEnd
  }, [getIsNextDisabled, activeStage, isAtEnd])

  return (
    <div
      className={`custom-stepper ${className || ''} ${
        prefs.lang === 'he' ? 'rtl' : ''
      }`}
    >
      {resolvedTitle && (
        <>
          <Typography variant='h5'>{resolvedTitle}</Typography>

          <Divider
            className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          />
        </>
      )}

      <div className='custom-stepper-stage'>
        <SlideAnimation
          motionKey={activeStage}
          direction={direction}
          duration={0.25}
        >
          {renderStage(activeStage)}
        </SlideAnimation>
      </div>

      <div className={`custom-stepper-footer ${footerClassName || ''}`}>
        <Stepper
          activeStep={activeIndex}
          alternativeLabel
          className={`stepper ${prefs.isDarkMode ? 'dark-mode' : ''} ${
            prefs.favoriteColor || ''
          }`}
        >
          {stages.map((stage, index) => (
            <Step key={stage}>
              <StepLabel>
                {stagesTitles?.[index] || capitalizeFirstLetter(stage)}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <div className='buttons-container'>
          <CustomButton
            text={previousText}
            onClick={() => onChange(-1)}
            fullWidth
            disabled={isPrevDisabled}
          />
          {isAtEnd ? (
            <CustomButton
              text={finishText}
              onClick={onFinish}
              fullWidth
              icon={<ArrowRightAltIcon />}
              disabled={!!getIsNextDisabled && getIsNextDisabled(activeStage)}
            />
          ) : (
            <CustomButton
              text={nextText}
              onClick={() => onChange(1)}
              fullWidth
              disabled={isNextDisabled}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomStepper
