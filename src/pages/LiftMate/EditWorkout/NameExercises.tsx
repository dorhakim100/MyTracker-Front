import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'
import { CustomInput } from '../../../CustomMui/CustomInput/CustomInput'
import { Workout } from '../../../types/workout/Workout'

interface NameExercisesProps {
  workout: Workout
  onNameChange: (name: string) => void
}

export function NameExercises({ workout, onNameChange }: NameExercisesProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  return (
    <div className="edit-workout-stage name-exercises-stage">
      <CustomInput
        value={workout.name}
        onChange={onNameChange}
        placeholder="Enter workout name"
        isRemoveIcon={true}
        className={`${prefs.favoriteColor}`}
      />
    </div>
  )
}
