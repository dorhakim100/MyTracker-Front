import { capitalizeFirstLetter } from '../../services/util.service'
import { Exercise } from '../../types/exercise/Exercise'
import { Divider, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useEffect, useMemo, useState } from 'react'
import { showErrorMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import {
  filterExercises,
  getAlternateExercises,
} from '../../services/exersice-search/exersice-search'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { ExerciseDetails } from '../ExerciseDetails/ExerciseDetails'
import { setIsLoading } from '../../store/actions/system.actions'
import { EquipmentSelect } from '../ExercisesFilter/EquipmentSelect'
import { ExerciseFilter } from '../../types/exerciseFilter/ExerciseFilter'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

import SwitchAccessShortcutAddIcon from '@mui/icons-material/SwitchAccessShortcutAdd'
import { exerciseImage } from '../../assets/config/exercise-image'
// import { chatGPTService } from '../../services/chatGPT/chat.gpt.service'
import { SkeletonList } from '../SkeletonList/SkeletonList'
import { instructionsService } from '../../services/instructions/instructions.service'
import { setSelectedSessionDay } from '../../store/actions/workout.action'
import { setService } from '../../services/set/set.service'
import { workoutService } from '../../services/workout/workout.service'

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

  const sessionDay = useSelector(
    (stateSelector: RootState) => stateSelector.workoutModule.sessionDay
  )

  const isLoading = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isLoading
  )

  const [suggestedExercises, setSuggestedExercises] = useState<Exercise[]>([])
  const [isListLoading, setIsListLoading] = useState(false)
  const [dialogOptions, setDialogOptions] = useState<SlideDialogOptions>({
    open: false,

    component: <></>,
    title: '',
    type: 'full',
  })

  const [exerciseFilter, setExerciseFilter] = useState<ExerciseFilter>({
    equipmentValue: 'All',
    searchValue: '',
    muscleGroupValue: 'All',
  })

  const filteredSuggestedExercises = useMemo(() => {
    return filterExercises(exerciseFilter, suggestedExercises).filter(
      (exercise) => !isInInstructions(exercise)
    )
  }, [
    suggestedExercises,
    exerciseFilter.equipmentValue,
    sessionDay?.instructions.exercises,
  ])

  useEffect(() => {
    getExercises()
  }, [exerciseToChange.exerciseId])

  async function getExercises() {
    try {
      setIsListLoading(true)
      setIsLoading(true)

      const exercises = await getAlternateExercises(exerciseToChange)

      setSuggestedExercises(exercises)
    } catch (err) {
      showErrorMsg(messages.error.getExercises)
    } finally {
      setIsListLoading(false)
      setIsLoading(false)
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

  const onExerciseFilterChange = (exerciseFilter: ExerciseFilter) => {
    setExerciseFilter(exerciseFilter)
  }

  const onChangeExercise = async (newExercise: Exercise) => {
    if (!sessionDay || !sessionDay.instructions._id)
      return showErrorMsg(messages.error.getSessionDay)
    const oldExerciseInstructions = sessionDay.instructions.exercises.find(
      (exercise) => exercise.exerciseId === exerciseToChange.exerciseId
    )
    if (!oldExerciseInstructions)
      return showErrorMsg(messages.error.changeExercise)

    try {
      setIsLoading(true)

      // const chatGPTResponse = await chatGPTService.changeExercise(
      //   oldExerciseInstructions,
      //   newExercise,
      //   sessionDay.instructions._id
      // )
      // console.log('chatGPTResponse', chatGPTResponse)
      const newInstructions = {
        ...sessionDay.instructions,
        exercises: sessionDay.instructions.exercises.map((exercise) => {
          if (exercise.exerciseId === exerciseToChange.exerciseId) {
            return {
              ...newExercise,
              notes: exercise.notes,
              restingTime: exercise.restingTime,
              sets: exercise.sets,
            }
          }
          return exercise
        }),
      }
      const setsToSave = oldExerciseInstructions.sets.map((s, index) => {
        return {
          ...s,
          exerciseId: newExercise.exerciseId,
          sessionId: sessionDay._id,
          userId: sessionDay.workout.forUserId,
          setNumber: s.setNumber || index + 1,
          isDone: s.isDone || false,
        }
      })
      const newWorkout = {
        ...sessionDay.workout,
        exercises: sessionDay.workout.exercises.map((e) => {
          if (e.exerciseId === exerciseToChange.exerciseId) {
            return newExercise
          }
          return e
        }),
      }

      const savedInstructions = await instructionsService.save(newInstructions)

      setSelectedSessionDay({
        ...sessionDay,
        instructions: savedInstructions,
      })

      const promises = [
        setService.saveSets(setsToSave),
        workoutService.save(newWorkout),
      ]

      await Promise.all(promises)
    } catch (err) {
      showErrorMsg(messages.error.changeExercise)
    } finally {
      setIsLoading(false)
    }
  }

  function isInInstructions(exercise: Exercise) {
    return sessionDay?.instructions.exercises.find(
      (e) => e.exerciseId === exercise.exerciseId
    )
  }
  return (
    <>
      <div className="change-exercise-container">
        <div className="filters-container">
          <Typography variant="h6" className="bold-header">
            Equipment:
          </Typography>
          <EquipmentSelect
            exerciseFilter={exerciseFilter}
            onExerciseFilterChange={onExerciseFilterChange}
          />
        </div>
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        <Typography variant="h6" className="bold-header">
          Change to:
        </Typography>
        {isListLoading && isLoading ? (
          <SkeletonList />
        ) : (
          <CustomList
            items={filteredSuggestedExercises}
            renderPrimaryText={(exercise) =>
              capitalizeFirstLetter(exercise.name)
            }
            renderSecondaryText={(exercise) =>
              capitalizeFirstLetter(exercise.muscleGroups.join(', '))
            }
            renderLeft={(exercise) => (
              <img
                src={exercise.image}
                alt={exercise.name}
                onError={(ev) => {
                  ev.currentTarget.src = exerciseImage.ERROR_IMAGE
                }}
              />
            )}
            getKey={(exercise) => exercise.exerciseId}
            className={`exercise-list ${prefs.isDarkMode ? 'dark-mode' : ''}`}
            itemClassName={`exercise-item-grid `}
            onItemClick={(exercise) => onExerciseClick(exercise)}
            renderRight={(exercise) => (
              <CustomButton
                icon={<SwitchAccessShortcutAddIcon />}
                onClick={(ev) => {
                  ev.stopPropagation()
                  onChangeExercise(exercise)
                }}
                isIcon={true}
                tooltipTitle="Change exercise"
              />
            )}
          />
        )}
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
