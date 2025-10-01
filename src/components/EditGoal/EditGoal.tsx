import React, { useState } from 'react'
import { Goal } from '../../types/goal/Goal'
import CustomStepper from '../../CustomMui/CustomStepper/CustomStepper'

interface EditGoalProps {
  selectedGoal?: Goal | null
  saveGoal: (goal: Goal) => void
}

const stages = ['title', 'target', 'macros']

export function EditGoal({ selectedGoal, saveGoal }: EditGoalProps) {
  const [activeStage, setActiveStage] = useState<string>(stages[0])

  const onStageChange = (targetStage: string, diff: number) => {
    setActiveStage(targetStage)
  }

  const renderStage = () => {
    switch (activeStage) {
      case 'title':
        return <span>Title</span>
      case 'target':
        return <span>Target</span>
      case 'macros':
        return <span>Macros</span>
    }
  }

  return (
    <div className='edit-goal-container'>
      <CustomStepper
        stages={stages}
        activeStage={activeStage}
        onStageChange={onStageChange}
        renderStage={renderStage}
      />
    </div>
  )
}
