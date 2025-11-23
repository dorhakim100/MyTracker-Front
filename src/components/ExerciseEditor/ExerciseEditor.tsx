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
import { Divider } from '@mui/material'
import { PickerSelect } from '../Pickers/PickerSelect'

export interface ExerciseEditorProps {
  exercise: Exercise
}

export function ExerciseEditor({ exercise }: ExerciseEditorProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const sessionDay = useSelector(
    (stateSelector: RootState) => stateSelector.workoutModule.sessionDay
  )

  useEffect(() => {
    console.log(exercise)
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
          sessionDay.sets.map((set, index) => {
            return (
              <>
                <div key={set._id} className='set-editor-container'>
                  <div className='reps-container'>
                    <PickerSelect
                      openClock={() => {}}
                      option={{
                        label: 'Reps',
                        key: 'reps',
                        type: 'number',
                      }}
                      value={set.reps}
                    />
                  </div>
                  <div className='weight-container'>
                    <PickerSelect
                      openClock={() => {}}
                      option={{
                        label: 'Weight',
                        key: 'weight',
                        type: 'number',
                      }}
                      value={set.weight}
                    />
                  </div>
                </div>

                {index < sessionDay.sets.length - 1 && (
                  <Divider
                    className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
                  />
                )}
              </>
            )
          })}
        <CustomButton icon={<AddIcon />} onClick={onAddSet} />
      </div>
    )
}
