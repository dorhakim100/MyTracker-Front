import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'
import { debounce } from '../../../services/util.service'
import { Workout } from '../../../types/workout/Workout'
import { workoutService } from '../../../services/workout/workout.service'
import { Exercise, ExerciseDetail } from '../../../types/exercise/Exercise'
import {
  showErrorMsg,
  showSuccessMsg,
} from '../../../services/event-bus.service'
import { messages } from '../../../assets/config/messages'
import {
  exerciseSearch,
  getMostPopularExercises,
  filterExercises,
} from '../../../services/exersice-search/exersice-search'
import { setIsLoading } from '../../../store/actions/system.actions'
import {
  loadWorkouts,
  saveWorkout,
} from '../../../store/actions/workout.action'
import { Instructions } from '../../../types/instructions/Instructions'
import { instructionsService } from '../../../services/instructions/instructions.service'
import { WeekNumberStatus } from '../../../types/weekNumberStatus/WeekNumberStatus'

import { NameExercises } from './NameExercises'

import { ExerciseInstructions } from '../../../types/exercise/ExerciseInstructions'
import { ExerciseFilter } from '../../../types/exerciseFilter/ExerciseFilter'
import { ExpectedActual } from '../../../types/expectedActual/ExpectedActual'
// import { useKeyboardHeight } from '../../../hooks/useKeyboardHeight'
import { DEFAULT_RESTING_TIME } from '../../../assets/config/times'

interface EditWorkoutProps {
  selectedWorkout?: Workout | null
  forUserId?: string
  closeDialog: () => void
}

export function EditWorkout({
  selectedWorkout,
  forUserId,
  closeDialog,
}: EditWorkoutProps) {
  const { t } = useTranslation()
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const traineeUser = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.traineeUser
  )

  const [workout, setWorkout] = useState<Workout>(
    selectedWorkout || workoutService.getEmptyWorkout()
  )

  const [instructions, setInstructions] = useState<Instructions>(
    instructionsService.getEmptyInstructions()
  )

  const [weeksStatus, setWeeksStatus] = useState<WeekNumberStatus[]>([])
  const [instructionsFilter, setInstructionsFilter] = useState({
    weekNumber: 1,
    forUserId: traineeUser?._id || user?._id || '',
    workoutId: workout._id || '',
  })

  const [exerciseFilter, setExerciseFilter] = useState<ExerciseFilter>(
    workoutService.getEmptyExerciseFilter()
  )
  const [exerciseResults, setExerciseResults] = useState<Exercise[]>([])

  const filteredExerciseResults = useMemo(() => {
    return filterExercises(exerciseFilter, exerciseResults)
  }, [
    exerciseResults,
    exerciseFilter.muscleGroupValue,
    exerciseFilter.equipmentValue,
  ])

  const handleSearch = useCallback(async () => {
    try {
      if (!exerciseFilter.searchValue) {
        const res = getMostPopularExercises()
        setExerciseResults(res)
        return
      }
      setIsLoading(true)
      const results = await exerciseSearch(exerciseFilter)
      setExerciseResults(results)
    } catch (err) {
      showErrorMsg(messages.error.search)
      setExerciseResults([])
    } finally {
      setIsLoading(false)
    }
  }, [
    exerciseFilter.searchValue,
    exerciseFilter.muscleGroupValue,
    exerciseFilter.equipmentValue,
  ])

  const latestHandleSearchRef = useRef(handleSearch)
  const debouncedRunSearch = useRef(
    debounce(() => latestHandleSearchRef.current(), 300)
  ).current

  const getWorkoutInstructions = useCallback(async () => {
    try {
      if (!workout._id || (!user?._id && !traineeUser?._id)) return

      setIsLoading(true)
      const instructions =
        await instructionsService.getByWorkoutId(instructionsFilter)

      const statuses = await instructionsService.getWeekNumberDone(workout._id)

      setWeeksStatus(statuses)
      setInstructions(instructions)
    } catch (err) {
      showErrorMsg(messages.error.getWorkoutInstructions)
    } finally {
      setIsLoading(false)
    }
  }, [workout._id, instructionsFilter, user?._id, traineeUser?._id])

  useEffect(() => {
    if (!weeksStatus || weeksStatus.length === 0) return

    const latestWeekNumber =
      weeksStatus[weeksStatus.length - 1]?.weekNumber || 1
    let weekToSet = latestWeekNumber
    if (weeksStatus[latestWeekNumber - 1]?.isDone)
      // weekToSet = latestWeekNumber + 1
      weekToSet = latestWeekNumber
    setInstructionsFilter((prev) => ({
      ...prev,
      weekNumber: weekToSet,
    }))
  }, [weeksStatus.length])

  useEffect(() => {
    latestHandleSearchRef.current = handleSearch
  }, [handleSearch])

  useEffect(() => {
    debouncedRunSearch()
  }, [
    exerciseFilter.searchValue,
    exerciseFilter.muscleGroupValue,
    exerciseFilter.equipmentValue,
    debouncedRunSearch,
  ])

  useEffect(() => {
    getWorkoutInstructions()
  }, [getWorkoutInstructions])

  const onNameChange = (name: string) => {
    setWorkout({ ...workout, name })
  }

  const onAddExercise = (exercise: Exercise) => {
    const exerciseIndex = workout.exercises.findIndex(
      (e) => e.exerciseId === exercise.exerciseId
    )

    const newExercises =
      exerciseIndex === -1
        ? [
            ...workout.exercises,
            { ...exercise, details: workoutService.getEmptyExerciseDetail() },
          ]
        : workout.exercises.filter((e) => e.exerciseId !== exercise.exerciseId)

    const notes = instructionsService.getEmptyExpectedActual('notes')

    const sets = Array.from({ length: 3 }, () =>
      instructionsService.getEmptySet()
    )

    const instructionsExercises = newExercises.map((exercise) => {
      const existingExercise = instructions.exercises.find(
        (e) => e.exerciseId === exercise.exerciseId
      )
      if (existingExercise) {
        return existingExercise
      }
      return {
        exerciseId: exercise.exerciseId,
        sets,
        notes: (notes || { expected: '', actual: '' }) as {
          expected: string
          actual: string
        },
        restingTime: DEFAULT_RESTING_TIME,
      }
    })

    setInstructions((prev) => ({
      ...prev,
      exercises: instructionsExercises,
    }))

    setWorkout({ ...workout, exercises: newExercises as Exercise[] })
  }

  const onExerciseFilterChange = (exerciseFilter: ExerciseFilter) => {
    setExerciseFilter(exerciseFilter)
  }

  const onDeleteExercise = (exercise: Exercise) => {
    const newExercises = workout.exercises.filter(
      (e) => e.exerciseId !== exercise.exerciseId
    )
    setWorkout({ ...workout, exercises: newExercises })
    setInstructions((prev) => ({
      ...prev,
      exercises: prev.exercises.filter(
        (e) => e.exerciseId !== exercise.exerciseId
      ),
    }))
    showSuccessMsg(messages.success.deleteExercise)
  }

  const onReorderExercises = (exercises: Exercise[]) => {
    setWorkout({ ...workout, exercises })

    const reOrderedExercisesInstructions = exercises.map((exercise) => ({
      ...(instructions.exercises.find(
        (e) => e.exerciseId === exercise.exerciseId
      ) as ExerciseInstructions),
    }))
    setInstructions((prev) => ({
      ...prev,
      exercises: reOrderedExercisesInstructions,
    }))
  }

  const onEditExerciseNotes = (exerciseId: string, notes: string) => {
    const exerciseToUpdate = workout.exercises.find(
      (e) => e.exerciseId === exerciseId
    )
    if (!exerciseToUpdate) return

    // Update workout exercise notes
    const updatedExercises = [...workout.exercises]
    const exerciseIndex = updatedExercises.findIndex(
      (e) => e.exerciseId === exerciseId
    )
    if (exerciseIndex === -1) return

    updatedExercises[exerciseIndex] = {
      ...updatedExercises[exerciseIndex],
      details: {
        ...updatedExercises[exerciseIndex].details,
        notes: {
          expected: notes,
          actual: '',
        },
      } as ExerciseDetail,
    }
    setWorkout({ ...workout, exercises: updatedExercises })

    // Update instructions
    setInstructions((prev) => {
      const instructionIndex = prev.exercises.findIndex(
        (e) => e.exerciseId === exerciseId
      )
      if (instructionIndex === -1) return prev

      const updatedExercises = [...prev.exercises]
      updatedExercises[instructionIndex] = {
        ...updatedExercises[instructionIndex],
        notes: {
          expected: notes,
          actual: prev.exercises[instructionIndex].notes.actual,
        },
      }

      return {
        ...prev,
        exercises: updatedExercises,
      }
    })
  }

  const onSwitchRpeRir = (exerciseId: string, value: 'rpe' | 'rir') => {
    const exerciseInstructionToUpdate = instructions.exercises.find(
      (e) => e.exerciseId === exerciseId
    )

    const exerciseIndex = instructions.exercises.findIndex(
      (e) => e.exerciseId === exerciseId
    )
    if (!exerciseInstructionToUpdate) return

    let newExerciseInstruction = { ...exerciseInstructionToUpdate }

    if (value === 'rpe') {
      newExerciseInstruction.sets = newExerciseInstruction.sets.map((set) => {
        // Create a new set object without rir, but with rpe
        const { rir, ...setWithoutRir } = set
        return {
          ...setWithoutRir,
          rpe: {
            expected: 8,
            actual: 8,
          } as ExpectedActual<number>,
        }
      })
    }
    if (value === 'rir') {
      newExerciseInstruction.sets = newExerciseInstruction.sets.map((set) => {
        // Create a new set object without rpe, but with rir
        const { rpe, ...setWithoutRpe } = set
        return {
          ...setWithoutRpe,
          rir: {
            expected: 2,
            actual: 2,
          } as ExpectedActual<number>,
        }
      })
    }

    const newExercises = [...instructions.exercises]
    newExercises[exerciseIndex] = newExerciseInstruction

    setInstructions({
      ...instructions,
      exercises: newExercises,
    })
  }

  function modifyInstructionsForSave(instructions: Instructions) {
    const modifiedExercises = instructions.exercises.map((exercise) => {
      const newSets = exercise.sets.map((set) => {
        return {
          ...set,
          isDone: false,
        }
      })
      return {
        ...exercise,
        notes: {
          ...exercise.notes,
          actual: '',
        },
        sets: newSets,
      }
    })

    return {
      ...instructions,
      exercises: modifiedExercises,
    }
  }

  const onFinish = async (isClose: boolean = true) => {
    const workoutToSave = {
      ...workout,
      forUserId:
        forUserId || traineeUser?._id || user?._id || workout.forUserId,
    }

    if (!workoutToSave.name) {
      workoutToSave.name = t('workout.untitledWorkout')
    }

    const instructionsToSave = modifyInstructionsForSave(instructions)

    try {
      setIsLoading(true)
      const savedWorkout = await saveWorkout(
        workoutToSave,
        instructionsToSave.timesPerWeek
      )
      instructionsToSave.workoutId = savedWorkout._id
      await instructionsService.save({
        ...instructionsToSave,
      })
      const statuses = await instructionsService.getWeekNumberDone(
        savedWorkout._id
      )
      await loadWorkouts({ forUserId: traineeUser?._id || user?._id || '' })

      setWeeksStatus(statuses)
      showSuccessMsg(messages.success.saveWorkout)
    } catch (err) {
      showErrorMsg(messages.error.saveWorkout)
    } finally {
      setIsLoading(false)
      if (isClose) {
        closeDialog()
      }
    }
  }

  return (
    <div
      className={`edit-workout-container ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
    >
      <NameExercises
        workout={workout}
        onNameChange={onNameChange}
        exerciseFilter={exerciseFilter}
        exerciseResults={filteredExerciseResults}
        onExerciseFilterChange={onExerciseFilterChange}
        onAddExercise={onAddExercise}
        onDeleteExercise={onDeleteExercise}
        onReorderExercises={onReorderExercises}
        instructions={instructions}
        weeksStatus={weeksStatus}
        instructionsFilter={instructionsFilter}
        onInstructionsFilterChange={setInstructionsFilter}
        setInstructions={setInstructions}
        onEditExerciseNotes={onEditExerciseNotes}
        onSwitchRpeRir={onSwitchRpeRir}
        onSaveWorkout={(isClose?: boolean) => onFinish(isClose)}
      />
    </div>
  )
}
