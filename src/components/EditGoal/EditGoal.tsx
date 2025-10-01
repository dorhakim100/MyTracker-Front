import { useMemo, useState, useRef } from 'react'
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

interface EditGoalProps {
  selectedGoal?: Goal | null
  saveGoal: (goal: Goal) => void
}

const stages = ['title', 'target', 'macros']

const DEFAULT_CALORIES = 2400

const CALORIES_DIFF = 500

export function EditGoal({ selectedGoal, saveGoal }: EditGoalProps) {
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const [editGoal, setEditGoal] = useState<Goal>(
    selectedGoal || {
      ...goalService.getEmptyGoal(),
      dailyCalories: bmrService.getBmrByUser(user) || DEFAULT_CALORIES,
    }
  )
  const [activeStage, setActiveStage] = useState<string>(stages[0])
  const [direction, setDirection] = useState(1)
  const [selectedTarget, setSelectedTarget] = useState<string>('maintain')

  const prevAnimation = useRef<string>(selectedTarget)

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
        direction = prevAnimation.current === 'lose' ? 1 : -1
        break
      default:
        direction = 1
    }
    prevAnimation.current = selectedTarget
    return direction
  }, [selectedTarget])

  const targets = [
    {
      label: 'Lose',
      icon: <ArrowDownwardIcon />,
      suggestedCalories:
        (bmrService.getBmrByUser(user) || DEFAULT_CALORIES) - CALORIES_DIFF,
      key: 'lose',
    },
    {
      label: 'Maintain',
      icon: <BalanceIcon />,
      suggestedCalories: bmrService.getBmrByUser(user) || DEFAULT_CALORIES,
      key: 'maintain',
    },
    {
      label: 'Gain',
      icon: <ArrowUpwardIcon />,
      suggestedCalories:
        (bmrService.getBmrByUser(user) || DEFAULT_CALORIES) + CALORIES_DIFF,
      key: 'gain',
    },
  ]

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
      case 'macros':
        return <span>Macros</span>
    }
  }

  function _renderTitleStage() {
    return (
      <div className='stage-container'>
        <CustomInput
          value={editGoal.title}
          onChange={(value) => setEditGoal({ ...editGoal, title: value })}
          placeholder='Enter goal title...'
        />
        <div className='animation-container'>
          <Lottie animationData={goalAnimation} loop={false} />
        </div>
      </div>
    )
  }

  function _renderTargetStage() {
    return (
      <div className='stage-container'>
        <div className='targets-container'>
          {targets.map((target) => {
            return (
              <CustomButton
                text={target.label}
                key={target.key}
                onClick={() => {
                  setSelectedTarget(target.key)
                  setEditGoal({
                    ...editGoal,
                    dailyCalories: target.suggestedCalories,
                  })
                }}
                icon={target.icon}
                className={`target-button ${
                  editGoal.dailyCalories === target.suggestedCalories
                    ? 'selected'
                    : ''
                }`}
                disabled={editGoal.dailyCalories === target.suggestedCalories}
              />
            )
          })}
        </div>
        <div className='animation-container'>
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

  const getStageTitle = (stage: string) => {
    switch (stage) {
      case 'title':
        return 'Goal Title'
      case 'target':
        return 'Target Weight'
      case 'macros':
        return 'Macros Distribution'
      default:
        return capitalizeFirstLetter(stage)
    }
  }

  const getIsNextDisabled = (stage: string) => {
    if (stage === 'title') return !editGoal.title
    if (stage === 'target') return !editGoal.dailyCalories
    if (stage === 'macros') return !editGoal.macros
    return false
  }

  return (
    <div className='page-container edit-goal-container'>
      <CustomStepper
        stages={stages}
        activeStage={activeStage}
        onStageChange={onStageChange}
        renderStage={renderStage}
        title={getStageTitle}
        direction={direction}
        getIsNextDisabled={getIsNextDisabled}
        onFinish={() => saveGoal(editGoal)}
      />
    </div>
  )
}
