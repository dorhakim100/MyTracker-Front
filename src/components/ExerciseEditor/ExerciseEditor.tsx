import { useEffect, useState } from 'react'

import { setService } from '../../services/set/set.service'

import { Exercise } from '../../types/exercise/Exercise'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import AddIcon from '@mui/icons-material/Add'
import { RootState } from '../../store/store'
import { useSelector } from 'react-redux'
import { showErrorMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { saveSessionDay } from '../../store/actions/workout.action'

export interface ExerciseEditorProps {
  exercise: Exercise
}

export function ExerciseEditor({ exercise }: ExerciseEditorProps) {
  const sessionDay = useSelector(
    (stateSelector: RootState) => stateSelector.workoutModule.sessionDay
  )

  const [editExercise, setEditExercise] = useState(exercise)

  useEffect(() => {
    // console.log('editExercise', editExercise)
  }, [exercise])

  const onAddSet = async () => {
    if (!sessionDay?.workoutId) return

    const newSet = setService.getEmptySet()
    newSet.exerciseId = exercise.exerciseId
    newSet.workoutId = sessionDay?.workoutId

    try {
      const savedSet = await setService.save(newSet)
      console.log(savedSet)
      await saveSessionDay({
        ...sessionDay,
        sets: [...sessionDay.sets, savedSet],
      })
    } catch (err) {
      console.error(err)
      showErrorMsg(messages.error.addSet)
    }
  }

  if (sessionDay)
    return (
      <div className='exercise-editor-container'>
        {sessionDay.sets &&
          sessionDay.sets.length > 0 &&
          sessionDay.sets.map((set) => {
            return (
              <div key={set._id}>
                <span>{set.reps}</span>
                <span>{set.weight}</span>
              </div>
            )
          })}
        <CustomButton icon={<AddIcon />} onClick={onAddSet} />
      </div>
    )
}
