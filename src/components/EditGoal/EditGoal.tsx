import { useMemo, useState, useRef, useEffect } from 'react'

import { useSelector } from 'react-redux'
import { Goal } from '../../types/goal/Goal'
import CustomStepper from '../../CustomMui/CustomStepper/CustomStepper'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import Lottie from 'lottie-react'
import goalAnimation from '../../../public/goal-animation.json'
import { capitalizeFirstLetter } from '../../services/util.service'
import { goalService } from '../../services/goal/goal.service'

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import BalanceIcon from '@mui/icons-material/Balance'

import { RootState } from '../../store/store'
import { bmrService } from '../../services/bmr/bmr.service'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

import lossAnimation from '../../../public/loss-weight.json'
import maintainAnimation from '../../../public/maintain-weight.json'
import gainAnimation from '../../../public/gain-weight.json'
import { SlideAnimation } from '../SlideAnimation/SlideAnimation'

import { CaloriesEdit } from '../CaloriesProgress/CaloriesEdit'
import { EditMacros } from '../MacrosProgress/EditMacros'
import { MacrosDistributionEdit } from '../MacrosDistribution/MacrosDistributionEdit'
import { SlideDialog } from '../SlideDialog/SlideDialog'

import { MacrosDonut } from '../MacrosDonut/MacrosDonut'
import { Macros } from '../Macros/Macros'
import {
  calculateCarbCalories,
  calculateCarbsFromCalories,
  calculateFatCalories,
  calculateProteinCalories,
} from '../../services/macros/macros.service'

import EditIcon from '@mui/icons-material/Edit'
import { Checkbox, Divider, Typography } from '@mui/material'

import dateAnimation from '../../../public/date-animation.json'
import { CustomDatePicker } from '../../CustomMui/CustomDatePicker/CustomDatePicker'
import { getDateFromISO } from '../../services/util.service'
import { israelLocaleStringObject } from '../../assets/config/times'

import { WeightEdit } from '../WeightCard/WeightEdit'

import { Macros as MacrosType } from '../../types/macros/Macros'
interface EditGoalProps {
  selectedGoal?: Goal | null
  saveGoal: (goal: Goal) => void
}

const stages = ['title', 'target', 'macros', 'weight', 'dates']

const DEFAULT_CALORIES = 2400

const CALORIES_DIFF = 500

export function EditGoal({ selectedGoal, saveGoal }: EditGoalProps) {
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [editGoal, setEditGoal] = useState<Goal | Partial<Goal>>(
    selectedGoal ||
      ({
        ...goalService.getEmptyGoal(),
        dailyCalories: bmrService.getBmrByUser(user) || DEFAULT_CALORIES,
        targetWeight: user?.lastWeight?.kg || 80,
      } as Goal)
  )

  const [activeStage, setActiveStage] = useState<string>(stages[0])
  const [direction, setDirection] = useState(1)
  const [selectedTarget, setSelectedTarget] = useState<string>(
    editGoal.target || 'maintain'
  )

  const [editGoalOpen, setEditGoalOpen] = useState(false)
  const [editModalType, setEditModalType] = useState<
    'calories' | 'macros' | 'distribution'
  >('calories')

  const prevTarget = useRef<string>(selectedTarget)

  const goalRef = useRef<Goal | Partial<Goal>>(editGoal)

  const maintainUserBmr = useMemo(() => {
    if (selectedGoal) return selectedGoal.dailyCalories
    return bmrService.getBmrByUser(user) || DEFAULT_CALORIES
  }, [user, selectedGoal])

  const targetAnimation = useMemo(() => {
    switch (selectedTarget) {
      case 'lose':
        return lossAnimation
      case 'gain':
        return gainAnimation
      default:
        return maintainAnimation
    }
  }, [selectedTarget])

  const targetAnimationDirection = useMemo(() => {
    let direction = 0
    switch (selectedTarget) {
      case 'lose':
        direction = -1
        break
      case 'gain':
        direction = 1
        break
      case 'maintain':
        direction = prevTarget.current === 'lose' ? 1 : -1
        break
      default:
        direction = 1
    }
    prevTarget.current = selectedTarget
    return direction
  }, [selectedTarget])

  const targets = [
    {
      label: 'Lose',
      icon: <ArrowDownwardIcon />,
      suggestedCalories: maintainUserBmr - CALORIES_DIFF,
      key: 'lose',
      onClick: () => _onTargetClick('lose'),
    },
    {
      label: 'Maintain',
      icon: <BalanceIcon />,
      suggestedCalories: maintainUserBmr,
      key: 'maintain',
      onClick: () => _onTargetClick('maintain'),
    },
    {
      label: 'Gain',
      icon: <ArrowUpwardIcon />,
      suggestedCalories: maintainUserBmr + CALORIES_DIFF,
      key: 'gain',
      onClick: () => _onTargetClick('gain'),
    },
  ]
  const editButtons = [
    {
      label: 'Calories',
      onClick: () => onCaloriesOpenClick(),
      icon: <EditIcon />,
      key: 'calories-edit-goal',
    },
    {
      label: 'Grams',
      onClick: () => onMacrosOpenClick(),
      icon: <EditIcon />,
      key: 'macros-edit-goal',
    },
    {
      label: 'Percentages',
      onClick: () => onDistributionOpenClick(),
      icon: <EditIcon />,
      key: 'distribution-edit-goal',
    },
  ]

  useEffect(() => {
    if (!editGoal.macros) return
    const totalCalories = getTotalCalories(editGoal.macros)
    setEditGoal({
      ...editGoal,
      dailyCalories: totalCalories,
    })
  }, [editGoal.macros])

  useEffect(() => {
    const proteinCalories = calculateProteinCalories(
      editGoal.macros?.protein || 0
    )
    const carbsCalories = calculateCarbCalories(editGoal.macros?.carbs || 0)
    const fatCalories = calculateFatCalories(editGoal.macros?.fat || 0)

    const calculatedCalories = proteinCalories + carbsCalories + fatCalories

    const diff = maintainUserBmr - calculatedCalories

    let carbsDiff = 0
    carbsDiff = calculateCarbsFromCalories(diff)

    setEditGoal({
      ...editGoal,
      dailyCalories: maintainUserBmr,
      macros: {
        ...editGoal.macros,
        carbs: (editGoal.macros?.carbs || 0) + carbsDiff,
        protein: editGoal.macros?.protein || 0,
        fat: editGoal.macros?.fat || 0,
      },
    })
  }, [maintainUserBmr])

  function _onTargetClick(target: 'lose' | 'maintain' | 'gain') {
    const macros = editGoal.macros
    if (!macros) return
    setSelectedTarget(target)
    let carbsDiff = 0

    carbsDiff = calculateCarbsFromCalories(CALORIES_DIFF)

    if (target === 'lose' && prevTarget.current === 'maintain') {
      carbsDiff *= -1
    }

    if (target === 'maintain' && prevTarget.current === 'gain') {
      carbsDiff *= -1
    }

    if (target === 'gain' && prevTarget.current === 'lose') {
      carbsDiff *= 2
    } else if (target === 'lose' && prevTarget.current === 'gain') {
      carbsDiff *= -2
    }

    const totalCalories = getTotalCalories(macros)

    setEditGoal({
      ...editGoal,
      // dailyCalories:
      //   targets.find((t) => t.key === target)?.suggestedCalories || 0,
      dailyCalories: totalCalories,
      macros: {
        ...editGoal.macros,
        carbs: (macros?.carbs || 0) + carbsDiff,
        protein: macros?.protein || 0,
        fat: macros?.fat || 0,
      },
      target: target,
    })
  }

  function getTotalCalories(macros: Partial<MacrosType>) {
    const proteinCalories = calculateProteinCalories(macros?.protein || 0)
    const carbsCalories = calculateCarbCalories(macros.carbs || 0)
    const fatCalories = calculateFatCalories(macros.fat || 0)
    return proteinCalories + carbsCalories + fatCalories
  }

  const onStageChange = (targetStage: string, diff: number) => {
    setActiveStage(targetStage)
    setDirection(diff)
  }

  const renderStage = () => {
    switch (activeStage) {
      case 'title':
        return _renderTitleStage()
      case 'target':
        return _renderTargetStage()
      case 'weight':
        return _renderWeightStage()
      case 'macros':
        return _renderMacrosStage()
      case 'dates':
        return _renderDatesStage()
    }
  }

  function onCaloriesOpenClick() {
    setEditGoalOpen(true)
    setEditModalType('calories')
  }

  function closePickerModal() {
    setEditGoalOpen(false)
  }

  function savePickerModal() {
    setEditGoal({ ...goalRef.current })
    closePickerModal()
  }

  function getModalTypeComponent() {
    switch (editModalType) {
      case 'calories':
        return (
          <CaloriesEdit
            goalToEdit={editGoal}
            goalRef={goalRef}
            onCancel={closePickerModal}
            onSave={savePickerModal}
          />
        )
      case 'macros':
        return (
          <EditMacros
            goalToEdit={editGoal}
            goalRef={goalRef}
            onCancel={closePickerModal}
            onSave={savePickerModal}
          />
        )
      case 'distribution':
        return (
          <MacrosDistributionEdit
            goalToEdit={editGoal}
            goalRef={goalRef}
            onCancel={closePickerModal}
            onSave={savePickerModal}
          />
        )
      default:
        return (
          <CaloriesEdit
            goalToEdit={editGoal}
            goalRef={goalRef}
            onCancel={closePickerModal}
            onSave={savePickerModal}
          />
        )
    }
  }

  function getModalOnSave() {
    switch (editModalType) {
      case 'calories':
        return () => {
          setEditGoal({ ...goalRef.current })
        }
      case 'macros':
        return () => {
          setEditGoal({ ...goalRef.current })
        }
      case 'distribution':
        return () => {
          setEditGoal({ ...goalRef.current })
        }

      default:
        return () => {}
    }
  }

  const onCloseEditGoal = () => {
    setEditGoalOpen(false)
  }

  function onMacrosOpenClick() {
    setEditGoalOpen(true)
    setEditModalType('macros')
  }

  function onDistributionOpenClick() {
    setEditGoalOpen(true)
    setEditModalType('distribution')
  }

  const getStageTitle = (stage: string) => {
    switch (stage) {
      case 'title':
        return 'Goal Title'
      case 'target':
        return 'Target'
      case 'macros':
        return 'Macros Distribution'
      case 'weight':
        return 'Target Weight (kg)'
      case 'dates':
        return 'Goal Dates'
      default:
        return capitalizeFirstLetter(stage)
    }
  }

  const getIsNextDisabled = (stage: string) => {
    // if (stage === 'title') return !editGoal.title
    if (stage === 'title') return false
    if (stage === 'target') return !editGoal.dailyCalories
    if (stage === 'macros') return !editGoal.macros
    return false
  }
  // Stages rendering
  function _renderTitleStage() {
    return (
      <div className="stage-container">
        <CustomInput
          value={editGoal.title || ''}
          onChange={(value) => setEditGoal({ ...editGoal, title: value })}
          placeholder="Enter goal title..."
          className={`${prefs.favoriteColor}`}
        />
        <div className="animation-container">
          <Lottie animationData={goalAnimation} loop={false} />
        </div>
      </div>
    )
  }

  function _renderTargetStage() {
    return (
      <div className="stage-container">
        <div className="targets-container">
          {targets.map((target) => {
            return (
              <CustomButton
                text={target.label}
                key={target.key}
                onClick={target.onClick}
                icon={target.icon}
                className={`target-button ${
                  editGoal.dailyCalories === target.suggestedCalories
                    ? 'selected'
                    : ''
                }`}
                disabled={editGoal.target === target.key}
              />
            )
          })}
        </div>
        <div className="animation-container">
          <SlideAnimation
            motionKey={selectedTarget}
            direction={targetAnimationDirection}
            duration={0.25}
          >
            <Lottie animationData={targetAnimation} loop={true} />
          </SlideAnimation>
        </div>
      </div>
    )
  }

  function _renderWeightStage() {
    return (
      <div className="stage-container">
        <div className="weight-edit-container">
          <WeightEdit
            value={editGoal.targetWeight || 0}
            onChange={(value) =>
              setEditGoal({ ...editGoal, targetWeight: value })
            }
            isHideSaveButton={true}
          />
        </div>
      </div>
    )
  }

  function _renderMacrosStage() {
    return (
      <>
        <div className="stage-container macros-stage-container">
          <MacrosDonut
            protein={editGoal.macros?.protein || 0}
            carbs={editGoal.macros?.carbs || 0}
            fats={editGoal.macros?.fat || 0}
          />
          <Macros
            protein={editGoal.macros?.protein || 0}
            carbs={editGoal.macros?.carbs || 0}
            fats={editGoal.macros?.fat || 0}
          />
          <div className="edit-header-container">
            <Typography variant="h5">Edit Macros</Typography>
            <Divider
              className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
            />
          </div>
          <div className="buttons-container">
            {editButtons.map((button) => (
              <CustomButton
                text={button.label}
                onClick={button.onClick}
                icon={button.icon}
                key={button.key}
                fullWidth={true}
              />
            ))}
          </div>
        </div>
        <SlideDialog
          open={editGoalOpen}
          onClose={onCloseEditGoal}
          component={getModalTypeComponent()}
          title="Edit Calories"
          onSave={getModalOnSave()}
        />
      </>
    )
  }

  function _renderDatesStage() {
    const newDateStart = new Date(editGoal.startDate as number)
    const newDateEnd = new Date(editGoal.endDate as number)

    const startDateToShow = newDateStart.toLocaleString(
      'he',
      israelLocaleStringObject
    )
    let endDateToShow
    const startDate = getDateFromISO(newDateStart.toISOString())

    let endDate

    if (editGoal.endDate !== undefined) {
      endDateToShow = newDateEnd.toLocaleString('he', israelLocaleStringObject)
      endDate = getDateFromISO(newDateEnd.toISOString())
    }

    return (
      <div className="stage-container">
        <div className="edit-header-container">
          <div className="date-picker-container">
            <label htmlFor="start-date" className="start-date-label">
              Start Date:
            </label>

            <Typography variant="h6">{startDateToShow}</Typography>
            <CustomDatePicker
              value={startDate}
              onChange={(date) =>
                setEditGoal({
                  ...editGoal,
                  startDate: new Date(date).getTime(),
                })
              }
              className={`${prefs.favoriteColor}`}
            />
          </div>
          <div
            className={`date-picker-container ${
              editGoal.endDate !== undefined ? '' : 'disabled'
            } ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          >
            <Checkbox
              className={`${prefs.favoriteColor}`}
              checked={editGoal.endDate !== undefined}
              onChange={(event) =>
                setEditGoal({
                  ...editGoal,
                  endDate: event.target.checked
                    ? goalService.getDefault30DaysGoal()
                    : undefined,
                })
              }
              id="end-date"
            />
            <label htmlFor="end-date" className="end-date-label">
              End Date:
            </label>
            {/* <Typography variant='h6'  >
              End Date:
            </Typography> */}

            <Typography variant="h6">{endDateToShow}</Typography>
            {editGoal.endDate !== undefined && (
              <CustomDatePicker
                value={endDate}
                onChange={(date) =>
                  setEditGoal({
                    ...editGoal,
                    endDate: new Date(date).getTime(),
                  })
                }
                className={`${prefs.favoriteColor}`}
              />
            )}
          </div>
        </div>
        <div className="animation-container date">
          <Lottie animationData={dateAnimation} loop={true} />
        </div>
      </div>
    )
  }
  return (
    <div className="page-container edit-goal-container">
      <CustomStepper
        stages={stages}
        activeStage={activeStage}
        onStageChange={onStageChange}
        renderStage={renderStage}
        title={getStageTitle}
        direction={direction}
        getIsNextDisabled={getIsNextDisabled}
        onFinish={() => saveGoal(editGoal as Goal)}
      />
    </div>
  )
}
