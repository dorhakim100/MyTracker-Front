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

interface NameExercisesProps {
  workout: Workout
  onNameChange: (name: string) => void
}

export function NameExercises({ workout, onNameChange }: NameExercisesProps) {
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
        component={<ExercisesStage />}
        title="Add Exercises"
        type="full"
      />
    </>
  )
}
