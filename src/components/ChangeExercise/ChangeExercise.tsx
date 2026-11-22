import { capitalizeFirstLetter } from '../../services/util.service'
import { Exercise } from '../../types/exercise/Exercise'
import { ExerciseInstructions } from '../../types/exercise/ExerciseInstructions'
import { Divider, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useEffect, useMemo, useState } from 'react'
import { showErrorMsg } from '../../services/event-bus.service'

import { filterExercises } from '../../services/exersice-search/exersice-search'
import { useAlternateExercises } from '../../hooks/useAlternateExercises'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { ExerciseDetails } from '../ExerciseDetails/ExerciseDetails'
import { setIsLoading } from '../../store/actions/system.actions'
import { EquipmentSelect } from '../ExercisesFilter/EquipmentSelect'
import { ExerciseFilter } from '../../types/exerciseFilter/ExerciseFilter'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import { exerciseImage } from '../../assets/config/exercise-image'
// import { chatGPTService } from '../../services/chatGPT/chat.gpt.service'
import { BottomReachIndicator } from '../BottomReachIndicator/BottomReachIndicator'
import { instructionsService } from '../../services/instructions/instructions.service'
import { setSelectedSessionDay } from '../../store/actions/workout.action'
import { setService } from '../../services/set/set.service'
import { workoutService } from '../../services/workout/workout.service'
import { useTranslation } from 'react-i18next'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import CloseIcon from '@mui/icons-material/Close'
import { matchesExerciseSearch } from '../../services/search/search.utils'
import { NoResults } from '../NoResults/NoResults'
interface ChangeExerciseProps {
  exerciseToChange: Exercise
  instructionExercises?: ExerciseInstructions[]
  onRoutineChange?: (
    oldExercise: Exercise,
    newExercise: Exercise
  ) => Promise<void> | void
}

interface SlideDialogOptions {
  open: boolean
  component: React.ReactElement
  title: string
  type: 'full' | 'half'
}

export function ChangeExercise({
  exerciseToChange,
  instructionExercises,
  onRoutineChange,
}: ChangeExerciseProps) {
  const { t } = useTranslation()
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const sessionDay = useSelector(
    (stateSelector: RootState) => stateSelector.workoutModule.sessionDay
  )

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
  const [listSearch, setListSearch] = useState('')

  const {
    items: suggestedExercises,
    isError,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isPlaceholderData,
    fetchNextPage,
  } = useAlternateExercises({
    exercise: exerciseToChange,
    equipment: exerciseFilter.equipmentValue,
    search: listSearch,
  })

  const currentInstructionExercises =
    instructionExercises ?? sessionDay?.instructions.exercises

  const filteredSuggestedExercises = useMemo(() => {
    return filterExercises(exerciseFilter, suggestedExercises)
      .filter((exercise) => !isInInstructions(exercise))
      .filter((exercise) =>
        matchesExerciseSearch(exercise.name, exerciseFilter.searchValue)
      )
  }, [suggestedExercises, exerciseFilter, currentInstructionExercises])

  const isFilterLoading =
    listSearch !== exerciseFilter.searchValue ||
    isPlaceholderData ||
    (isFetching && !isFetchingNextPage)
  const showLoading = isFilterLoading && filteredSuggestedExercises.length === 0

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setListSearch(exerciseFilter.searchValue)
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [exerciseFilter.searchValue])

  useEffect(() => {
    if (!isError) return
    showErrorMsg(t('messages.error.getExercises'))
  }, [isError, t])

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
    if (onRoutineChange) {
      try {
        setIsLoading(true)
        await onRoutineChange(exerciseToChange, newExercise)
      } catch {
        showErrorMsg(t('messages.error.changeExercise'))
      } finally {
        setIsLoading(false)
      }
      return
    }

    if (!sessionDay || !sessionDay.instructions._id)
      return showErrorMsg(t('messages.error.getSessionDay'))
    const oldExerciseInstructions = sessionDay.instructions.exercises.find(
      (exercise) => exercise.exerciseId === exerciseToChange.exerciseId
    )
    if (!oldExerciseInstructions)
      return showErrorMsg(t('messages.error.changeExercise'))

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
    } catch {
      showErrorMsg(t('messages.error.changeExercise'))
    } finally {
      setIsLoading(false)
    }
  }

  function isInInstructions(exercise: Exercise) {
    return currentInstructionExercises?.find(
      (e) => e.exerciseId === exercise.exerciseId
    )
  }
  return (
    <>
      <div className='change-exercise-container'>
        <CustomInput
          placeholder='Search'
          value={exerciseFilter.searchValue}
          className={`${prefs.favoriteColor}`}
          onChange={(value) => {
            onExerciseFilterChange({
              ...exerciseFilter,
              searchValue: value,
            })
          }}
          endIconFn={() => (
            <CloseIcon
              onClick={() =>
                onExerciseFilterChange({ ...exerciseFilter, searchValue: '' })
              }
            />
          )}
        />
        <div className='filters-container'>
          <Typography
            variant='h6'
            className='bold-header'
          >
            Equipment:
          </Typography>
          <EquipmentSelect
            exerciseFilter={exerciseFilter}
            onExerciseFilterChange={onExerciseFilterChange}
          />
        </div>
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        <Typography
          variant='h6'
          className='bold-header'
        >
          Change to:
        </Typography>
        {showLoading ? (
          <CustomList
            isLoading
            skeletonCount={8}
            items={[]}
            className={`exercise-list ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          />
        ) : filteredSuggestedExercises.length > 0 ? (
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
                icon={<SwapHorizIcon />}
                onClick={(ev) => {
                  ev.stopPropagation()
                  onChangeExercise(exercise)
                }}
                isIcon={true}
                tooltipTitle='Change exercise'
              />
            )}
          />
        ) : hasNextPage ? null : (
          <NoResults />
        )}
        {!showLoading &&
          ((hasNextPage && listSearch === exerciseFilter.searchValue) ||
            isFetchingNextPage) && (
          <div className='alternate-exercises-more'>
            <BottomReachIndicator
              hasMore={Boolean(hasNextPage)}
              isLoading={isFetchingNextPage}
              onReachBottom={async () => {
                await fetchNextPage()
              }}
            />
          </div>
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
