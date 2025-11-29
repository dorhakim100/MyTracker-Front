import { useEffect, useState } from 'react'

import { setService } from '../../services/set/set.service'

import { Exercise } from '../../types/exercise/Exercise'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import AddIcon from '@mui/icons-material/Add'
import { RootState } from '../../store/store'
import { useSelector } from 'react-redux'
import { showErrorMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import {
  saveSessionDay,
  setSelectedSessionDay,
} from '../../store/actions/workout.action'
import { Divider } from '@mui/material'
import { PickerSelect } from '../Pickers/PickerSelect'
import Badge from '@mui/material/Badge'
import { ClockPicker } from '../Pickers/ClockPicker'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { WorkoutSet } from '../../types/set/Set'
import { setIsLoading } from '../../store/actions/system.actions'
import { SessionDay } from '../../types/workout/SessionDay'
import { ExerciseInstructions } from '../../types/exercise/ExerciseInstructions'

export interface ExerciseEditorProps {
  exercise: ExerciseInstructions
}

interface PickerOption {
  isOpen: boolean
  type: string | null
}

export function ExerciseEditor({ exercise }: ExerciseEditorProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const sessionDay = useSelector(
    (stateSelector: RootState) => stateSelector.workoutModule.sessionDay
  )

  const [picerOptions, setPicerOptions] = useState<PickerOption>({
    isOpen: false,
    type: null,
  })

  const [editSet, setEditSet] = useState<WorkoutSet | null>(null)

  useEffect(() => {
    const updateSet = async () => {
      if (editSet) {
        try {
          setIsLoading(true)
          const savedset = await setService.save(editSet)
          const sessionToUpdate = {
            ...sessionDay!,
            sets: sessionDay?.instructions.exercises.map((set) =>
              set._id === savedset._id ? savedset : set
            ) || [savedset],
          } as SessionDay
          setSelectedSessionDay(sessionToUpdate)
        } catch (err) {
          console.error(err)
          showErrorMsg(messages.error.updateSet)
        } finally {
          setIsLoading(false)
        }
      }
    }
    updateSet()
  }, [editSet?.reps, editSet?.weight])

  const onAddSet = async () => {
    if (!sessionDay?.workoutId) return

    const newSet = setService.getEmptySet()
    newSet.exerciseId = exercise.exerciseId
    newSet.workoutId = sessionDay?.workoutId

    const existingSet = sessionDay?.instructions.exercises.find(
      (set) => set.exerciseId === exercise.exerciseId
    )

    if (existingSet) {
      newSet.reps.actual = existingSet.sets[0].reps.actual
      newSet.weight.actual = existingSet.sets[0].weight.actual
    }

    try {
      const savedSet = await setService.save(newSet)

      await saveSessionDay({
        ...sessionDay,
        sets: [...sessionDay.sets, savedSet],
      })
    } catch (err) {
      console.error(err)
      showErrorMsg(messages.error.addSet)
    }
  }

  const onPickerChange = async (_: any, value: number) => {
    if (picerOptions.type === 'rpe' && sessionDay?.workout) {
      const exerciseToUpdate = sessionDay?.instructions.exercises.find(
        (exercise) => exercise.exerciseId === exercise.exerciseId
      )
      if (exerciseToUpdate) {
        exerciseToUpdate.rpe.actual = value
      }

      if (exerciseToUpdate?.rpe.actual === value) return
      const sessionToUpdate = {
        ...sessionDay,
        instructions: {
          ...sessionDay?.instructions,
          exercises: [...sessionDay?.instructions.exercises],
        },
      }

      await saveSessionDay(sessionToUpdate)
      return
    }

    if (
      (picerOptions.type === 'weight' || picerOptions.type === 'reps') &&
      editSet
    ) {
      if (editSet[picerOptions.type as keyof WorkoutSet] === value) return
      setEditSet({
        ...editSet,
        [picerOptions.type as keyof WorkoutSet]: value,
      })
    }
  }

  const getPickerValue = (set: WorkoutSet | null): number => {
    const key = picerOptions.type
    if (!set && key === 'rpe')
      return (
        sessionDay?.workout.exercises.find(
          (exercise) => exercise.exerciseId === exercise.exerciseId
        )?.details?.rpe.actual || 0
      )

    if (!set) return 0
    return (set[key as keyof WorkoutSet] as number) || 0
  }

  const getIsAfterValue = (type: string | null): boolean => {
    if (!type) return false
    if (type === 'rpe') return true
    if (type === 'weight') return true
    return false
  }

  const getButtonsValues = (type: string | null): number[] => {
    if (!type) return [1, 50, 100]
    if (type === 'rpe') return [5, 7, 9]
    if (type === 'weight') return [15, 45, 75, 100]
    if (type === 'reps') return [5, 10, 15, 20]
    return []
  }

  const getPickerValues = (type: string | null, key: 'min' | 'max'): number => {
    if (!type) return 0
    if (type === 'rpe') return key === 'min' ? 1 : 9
    if (type === 'weight') return key === 'min' ? 2 : 320
    if (type === 'reps') return key === 'min' ? 1 : 25
    return 0
  }
  const getRpeValue = (): number => {
    if (!sessionDay?.instructions) return 0
    return (
      sessionDay?.instructions.exercises.find(
        (exerciseToFind) => exerciseToFind.exerciseId === exercise.exerciseId
      )?.rpe.actual || 0
    )
  }
  if (sessionDay)
    return (
      <>
        <div className='exercise-editor-container'>
          {exercise.sets &&
            exercise.sets.length > 0 &&
            exercise.sets.map((set, index) => {
              return (
                <>
                  <div
                    key={`${exercise.exerciseId}-${index}`}
                    className='set-editor-container'
                  >
                    <Badge
                      badgeContent={index + 1}
                      color='primary'
                      className={`${prefs.favoriteColor}`}
                    ></Badge>
                    <div className='reps-container'>
                      <PickerSelect
                        openClock={() => {
                          setPicerOptions({
                            type: 'reps',
                            isOpen: true,
                          })
                          setEditSet(set)
                        }}
                        option={{
                          label: 'Reps',
                          key: 'reps',
                          type: 'number',
                        }}
                        value={set.reps.actual}
                      />
                    </div>
                    <div className='weight-container'>
                      <PickerSelect
                        openClock={() => {
                          setPicerOptions({
                            type: 'weight',
                            isOpen: true,
                          })
                          setEditSet(set)
                        }}
                        option={{
                          label: 'Weight',
                          key: 'weight',
                          type: 'number',
                        }}
                        value={set.weight.actual}
                      />
                    </div>
                  </div>

                  <Divider
                    className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
                  />
                </>
              )
            })}
          <div className='controls-container'>
            <PickerSelect
              openClock={() => {
                setPicerOptions({
                  type: 'rpe',
                  isOpen: true,
                })
                setEditSet(null)
              }}
              option={{
                label: 'RPE',
                key: 'rpe',
                type: 'number',
              }}
              value={getRpeValue()}
            />
            <CustomButton
              icon={<AddIcon />}
              text='Add Set'
              onClick={onAddSet}
              fullWidth
            />
          </div>
        </div>
        <SlideDialog
          open={picerOptions.isOpen}
          onClose={() => {
            setPicerOptions({
              type: null,
              isOpen: false,
            })
          }}
          component={
            <ClockPicker
              value={getPickerValue(editSet)}
              onChange={onPickerChange}
              isAfterValue={getIsAfterValue(picerOptions.type)}
              buttonsValues={getButtonsValues(picerOptions.type)}
              minValue={getPickerValues(picerOptions.type, 'min')}
              maxValue={getPickerValues(picerOptions.type, 'max')}
            />
          }
        />
      </>
    )
}
