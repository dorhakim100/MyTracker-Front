import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'
import { CustomInput } from '../../../CustomMui/CustomInput/CustomInput'
import { Workout } from '../../../types/workout/Workout'
import { Divider, Typography } from '@mui/material'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import { Dumbbell } from '../../../components/Icons/Dumbbell'
import AddIcon from '@mui/icons-material/Add'
import { SlideDialog } from '../../../components/SlideDialog/SlideDialog'
import { ExercisesStage } from './ExercisesStage'
import { Exercise } from '../../../types/exercise/Exercise'
import { ExerciseFilter } from '../../../types/exerciseFilter/ExerciseFilter'

interface NameExercisesProps {
  workout: Workout
  onNameChange: (name: string) => void
  exerciseFilter: ExerciseFilter
  exerciseResults: Exercise[]
  onExerciseFilterChange: (exerciseFilter: ExerciseFilter) => void
  onAddExercise: (exercise: Exercise) => void
  onDeleteExercise: (exercise: Exercise) => void
  onReorderExercises: (exercises: Exercise[]) => void
  renderErrorImage: (exercise: Exercise) => void
}

export function NameExercises({
  workout,
  onNameChange,
  exerciseFilter,
  exerciseResults,
  onExerciseFilterChange,
  onAddExercise,
  onDeleteExercise,
  onReorderExercises,
  renderErrorImage,
}: NameExercisesProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [addExerciseDialogOpen, setAddExerciseDialogOpen] = useState(false)

  return (
    <>
      <div className="edit-workout-stage name-exercises-stage">
        <CustomInput
          value={workout.name}
          onChange={onNameChange}
          placeholder="Enter workout name"
          isRemoveIcon={true}
          className={`${prefs.favoriteColor}`}
        />
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        {workout.exercises.length === 0 && (
          <div className="no-exercises-container">
            <Dumbbell />
            <Typography variant="body2">
              Get started by adding an exercise to your routine
            </Typography>
          </div>
        )}
        <CustomButton
          text="Add Exercise"
          onClick={() => setAddExerciseDialogOpen(true)}
          icon={<AddIcon />}
        />
      </div>
      <SlideDialog
        open={addExerciseDialogOpen}
        onClose={() => setAddExerciseDialogOpen(false)}
        component={
          <ExercisesStage
            workout={workout}
            exerciseFilter={exerciseFilter}
            exerciseResults={exerciseResults}
            onExerciseFilterChange={onExerciseFilterChange}
            onAddExercise={onAddExercise}
            onDeleteExercise={onDeleteExercise}
            onReorderExercises={onReorderExercises}
            renderErrorImage={renderErrorImage}
          />
        }
        title="Add Exercises"
        type="full"
      />
    </>
  )
}
