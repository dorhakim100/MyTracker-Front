import { useState } from 'react'
import { Goal } from '../../types/goal/Goal'
import CustomStepper from '../../CustomMui/CustomStepper/CustomStepper'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import Lottie from 'lottie-react'
import goalAnimation from '../../../public/goal-animation.json'
import { capitalizeFirstLetter } from '../../services/util.service'

interface EditGoalProps {
  selectedGoal?: Goal | null
  saveGoal: (goal: Goal) => void
}

const stages = ['title', 'target', 'macros']

export function EditGoal({ selectedGoal, saveGoal }: EditGoalProps) {
  const [editGoal, setEditGoal] = useState<Goal>({
    _id: selectedGoal?._id || '',
    isMain: selectedGoal?.isMain || false,
    dailyCalories: selectedGoal?.dailyCalories || 0,
    title: selectedGoal?.title || '',
    updatedAt: selectedGoal?.updatedAt || new Date(),
    macros: {
      calories: selectedGoal?.macros?.calories || 0,
      protein: selectedGoal?.macros?.protein || 0,
      carbs: selectedGoal?.macros?.carbs || 0,
      fat: selectedGoal?.macros?.fat || 0,
    },
  })

  const [activeStage, setActiveStage] = useState<string>(stages[0])
  const [direction, setDirection] = useState(1)

  const onStageChange = (targetStage: string, diff: number) => {
    setActiveStage(targetStage)
    setDirection(diff)
  }

  const renderStage = () => {
    switch (activeStage) {
      case 'title':
        return _renderTitleStage()
      case 'target':
        return <span>Target</span>
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

  const getStageTitle = (stage: string) => {
    switch (stage) {
      case 'title':
        return 'Goal Title'
      case 'target':
        return 'Target Calories'
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
    <div className='edit-goal-container'>
      <CustomStepper
        stages={stages}
        activeStage={activeStage}
        onStageChange={onStageChange}
        renderStage={renderStage}
        title={getStageTitle}
        direction={direction}
        getIsNextDisabled={getIsNextDisabled}
      />
    </div>
  )
}
