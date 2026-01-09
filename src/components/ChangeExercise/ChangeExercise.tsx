import { capitalizeFirstLetter } from '../../services/util.service'
import { Exercise } from '../../types/exercise/Exercise'
import { Divider, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useEffect, useState } from 'react'
import { showErrorMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { getAlternateExercises } from '../../services/exersice-search/exersice-search'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { ExerciseDetails } from '../ExerciseDetails/ExerciseDetails'

interface ChangeExerciseProps {
  exerciseToChange: Exercise
}

interface SlideDialogOptions {
  open: boolean
  component: React.ReactElement
  title: string
  type: 'full' | 'half'
}

export function ChangeExercise({ exerciseToChange }: ChangeExerciseProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [suggestedExercises, setSuggestedExercises] = useState<Exercise[]>([])
  const [dialogOptions, setDialogOptions] = useState<SlideDialogOptions>({
    open: false,

    component: <></>,
    title: '',
    type: 'full',
  })

  useEffect(() => {
    getExercises()
  }, [exerciseToChange.exerciseId])

  async function getExercises() {
    try {
      const exercises = await getAlternateExercises(exerciseToChange)
      console.log(exercises)
      setSuggestedExercises(exercises)
    } catch (err) {
      showErrorMsg(messages.error.getExercises)
    }
  }

  const onExerciseClick = (exercise: Exercise) => {
    setDialogOptions({
      open: true,
      component: <ExerciseDetails exercise={exercise} />,
      title: capitalizeFirstLetter(exercise.name),
      type: 'full',
    })
  }

  return (
    <>
      <div className="change-exercise-container">
        <Typography variant="h6" className="bold-header">
          Change to:
        </Typography>
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        <CustomList
          items={suggestedExercises}
          renderPrimaryText={(exercise) => capitalizeFirstLetter(exercise.name)}
          renderSecondaryText={(exercise) =>
            capitalizeFirstLetter(exercise.muscleGroups.join(', '))
          }
          renderLeft={(exercise) => (
            <img src={exercise.image} alt={exercise.name} />
          )}
          getKey={(exercise) => exercise.exerciseId}
          className={`exercise-list ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          itemClassName={`exercise-item-grid`}
          onItemClick={(exercise) => onExerciseClick(exercise)}
        />
      </div>
      <SlideDialog
        open={dialogOptions.open}
        onClose={() => setDialogOptions({ ...dialogOptions, open: false })}
        component={dialogOptions.component}
        title={dialogOptions.title}
        type={dialogOptions.type}
      />
    </>
  )
}
