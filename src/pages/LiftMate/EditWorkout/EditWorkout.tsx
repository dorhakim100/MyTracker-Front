import { useState } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../../store/store'
import { CustomStepper } from '../../../CustomMui/CustomStepper/CustomStepper'
import { capitalizeFirstLetter } from '../../../services/util.service'

interface EditWorkoutProps {
  selectedWorkout?: any | null
  saveWorkout?: (workout: any) => void
}

const stages = ['name', 'exercises', 'details']
type WorkoutStage = (typeof stages)[number]

export function EditWorkout({
  selectedWorkout,
  saveWorkout,
}: EditWorkoutProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [activeStage, setActiveStage] = useState<WorkoutStage>(stages[0])
  const [direction, setDirection] = useState(1)

  function onStageChange(stage: WorkoutStage, diff: number) {
    setDirection(diff)
    setActiveStage(stage)
  }

  function getStageTitle(stage: WorkoutStage): string {
    switch (stage) {
      case 'name':
        return 'Workout Name'
      case 'exercises':
        return 'Exercises'
      case 'details':
        return 'Workout Details'
      default:
        return capitalizeFirstLetter(stage)
    }
  }

  function getIsNextDisabled(stage: WorkoutStage): boolean {
    // TODO: Add validation logic
    switch (stage) {
      case 'name':
        return false // TODO: Check if name is filled
      case 'exercises':
        return false // TODO: Check if exercises are added
      case 'details':
        return false
      default:
        return false
    }
  }

  function renderStage(stage: WorkoutStage) {
    switch (stage) {
      case 'name':
        return renderNameStage()
      case 'exercises':
        return renderExercisesStage()
      case 'details':
        return renderDetailsStage()
      default:
        return <div>Stage not implemented</div>
    }
  }

  function renderNameStage() {
    return (
      <div className="edit-workout-stage name-stage">
        <p>Name stage - TODO: Add name input</p>
      </div>
    )
  }

  function renderExercisesStage() {
    return (
      <div className="edit-workout-stage exercises-stage">
        <p>Exercises stage - TODO: Add exercises selection</p>
      </div>
    )
  }

  function renderDetailsStage() {
    return (
      <div className="edit-workout-stage details-stage">
        <p>Details stage - TODO: Add workout details</p>
      </div>
    )
  }

  function onFinish() {
    // TODO: Implement save logic
    if (saveWorkout) {
      // saveWorkout(workoutData)
    }
  }

  return (
    <div
      className={`page-container edit-workout-container ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
    >
      <CustomStepper
        stages={stages}
        activeStage={activeStage}
        onStageChange={onStageChange}
        renderStage={renderStage}
        title={getStageTitle}
        direction={direction}
        getIsNextDisabled={getIsNextDisabled}
        onFinish={onFinish}
        finishText="Save Workout"
      />
    </div>
  )
}
