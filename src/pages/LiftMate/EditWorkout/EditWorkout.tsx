import { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'
import { capitalizeFirstLetter, debounce } from '../../../services/util.service'
import { CustomStepper } from '../../../CustomMui/CustomStepper/CustomStepper'
import { Workout } from '../../../types/workout/Workout'
import { workoutService } from '../../../services/workout/workout.service'
import { Exercise, ExerciseDetail } from '../../../types/exercise/Exercise'
import {
  showErrorMsg,
  showSuccessMsg,
} from '../../../services/event-bus.service'
import { messages } from '../../../assets/config/messages'
import { exerciseSearch } from '../../../services/exersice-search/exersice-search'
import { setIsLoading } from '../../../store/actions/system.actions'
import { saveWorkout } from '../../../store/actions/workout.action'
import { Instructions } from '../../../types/instructions/Instructions'
import { instructionsService } from '../../../services/instructions/instructions.service'
import { WeekNumberStatus } from '../../../types/weekNumberStatus/WeekNumberStatus'
import { MuscleGroup } from '../../../types/muscleGroup/MuscleGroup'
import { NameStage } from './NameStage'
import { ExercisesStage } from './ExercisesStage'
import { DetailsStage } from './DetailsStage'
import { imageService } from '../../../services/image/image.service'
import { ExerciseInstructions } from '../../../types/exercise/ExerciseInstructions'
// import { useKeyboardHeight } from '../../../hooks/useKeyboardHeight'

interface EditWorkoutProps {
  selectedWorkout?: Workout | null
  // saveWorkout?: (workout: Workout) => void
  forUserId?: string
  closeDialog: () => void
}

type MuscleGroupArea = 'all' | 'upper' | 'lower'
type PickerModalType =
  | 'expectedSets'
  | 'actualSets'
  | 'rpe'
  | 'sets'
  | 'weight'
  | 'reps'
  | 'rir'

interface MuscleGroupFilter {
  txt: string
  area: MuscleGroupArea
}

type WorkoutStage = 'name' | 'exercises' | 'details'
const stages: WorkoutStage[] = ['name', 'exercises', 'details']

export function EditWorkout({
  selectedWorkout,
  // saveWorkout,
  forUserId,
  closeDialog,
}: EditWorkoutProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const traineeUser = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.traineeUser
  )

  // const keyboardHeight = useKeyboardHeight()

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

  const [muscleGroupFilter, setMuscleGroupFilter] = useState<MuscleGroupFilter>(
    {
      txt: '',
      area: 'all',
    }
  )

  const [exerciseFilter, setExerciseFilter] = useState({ txt: '' })
  const [exerciseResults, setExerciseResults] = useState<Exercise[]>([])
  const [activeStage, setActiveStage] = useState<WorkoutStage>(stages[0])
  const [direction, setDirection] = useState(1)

  const handleSearch = useCallback(async () => {
    try {
      if (!exerciseFilter.txt) {
        setExerciseResults([])
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      const results = await exerciseSearch(exerciseFilter.txt)
      setExerciseResults(results)
    } catch (err) {
      showErrorMsg(messages.error.search)
      setExerciseResults([])
    } finally {
      setIsLoading(false)
    }
  }, [exerciseFilter.txt])

  const latestHandleSearchRef = useRef(handleSearch)
  const debouncedRunSearch = useRef(
    debounce(() => latestHandleSearchRef.current(), 300)
  ).current

  const getWorkoutInstructions = useCallback(async () => {
    try {
      if (!workout._id || (!user?._id && !traineeUser?._id)) return

      setIsLoading(true)
      const instructions = await instructionsService.getByWorkoutId(
        instructionsFilter
      )
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
    latestHandleSearchRef.current = handleSearch
  }, [handleSearch])

  useEffect(() => {
    debouncedRunSearch()
  }, [exerciseFilter.txt, debouncedRunSearch])

  useEffect(() => {
    getWorkoutInstructions()
  }, [getWorkoutInstructions])

  const onStageChange = (stage: WorkoutStage, diff: number) => {
    setDirection(diff)
    setActiveStage(stage)
  }

  const onNameChange = (name: string) => {
    setWorkout({ ...workout, name })
  }

  const onToggleMuscleGroup = (muscleGroup: MuscleGroup) => {
    const newMuscleGroups = [...workout.muscleGroups]
    if (newMuscleGroups.includes(muscleGroup.name)) {
      newMuscleGroups.splice(newMuscleGroups.indexOf(muscleGroup.name), 1)
    } else {
      newMuscleGroups.push(muscleGroup.name)
    }
    setWorkout({ ...workout, muscleGroups: newMuscleGroups })
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

    const rpe = instructionsService.getEmptyExpectedActual('rpe')
    const notes = instructionsService.getEmptyExpectedActual('notes')

    const instructionsExercises = newExercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      sets: [
        instructionsService.getEmptySet(),
        instructionsService.getEmptySet(),
        instructionsService.getEmptySet(),
      ],
      rpe: (rpe || { expected: 8, actual: 8 }) as {
        expected: number
        actual: number
      },
      notes: (notes || { expected: '', actual: '' }) as {
        expected: string
        actual: string
      },
    }))

    setInstructions((prev) => ({
      ...prev,
      exercises: instructionsExercises,
    }))

    setWorkout({ ...workout, exercises: newExercises as Exercise[] })
  }

  const onExerciseFilterChangeTxt = (txt: string) => {
    setExerciseFilter((prev) => ({ ...prev, txt }))
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
  }

  const onReorderExercises = (exercises: Exercise[]) => {
    setWorkout({ ...workout, exercises })
  }

  const onEditExerciseDetails = (
    exerciseId: string,
    type: PickerModalType,
    value: number | string
  ) => {
    if (type === 'sets') {
      value = Math.floor(value as number)
      setInstructions((prev) => {
        const exerciseIndex = prev.exercises.findIndex(
          (e) => e.exerciseId === exerciseId
        )
        if (exerciseIndex === -1) return prev

        const newSetsLength = value as number
        const newSets = Array.from({ length: newSetsLength }, () =>
          instructionsService.getEmptySet()
        )

        const updatedExercises = [...prev.exercises]
        updatedExercises[exerciseIndex] = {
          ...updatedExercises[exerciseIndex],
          sets: newSets,
        }

        return {
          ...prev,
          exercises: updatedExercises,
        }
      })
      return
    }

    const exerciseToUpdate = workout.exercises.find(
      (e) => e.exerciseId === exerciseId
    )
    if (!exerciseToUpdate) return

    // Update workout exercise details
    const updatedExercises = [...workout.exercises]
    const exerciseIndex = updatedExercises.findIndex(
      (e) => e.exerciseId === exerciseId
    )
    if (exerciseIndex === -1) return

    updatedExercises[exerciseIndex] = {
      ...updatedExercises[exerciseIndex],
      details: {
        ...updatedExercises[exerciseIndex].details,
        [type]: {
          expected: value,
          actual: value,
        },
      } as ExerciseDetail,
    }

    console.log('updatedExercises', updatedExercises)
    setWorkout({ ...workout, exercises: updatedExercises })

    // Update instructions
    setInstructions((prev) => {
      const instructionIndex = prev.exercises.findIndex(
        (e) => e.exerciseId === exerciseId
      )
      if (instructionIndex === -1) return prev

      const updatedInstructions = [...prev.exercises]
      const instructionExercise = { ...updatedInstructions[instructionIndex] }

      if (type === 'rpe') {
        delete instructionExercise.rir
        instructionExercise.rpe = {
          expected: value as number,
          actual: value as number,
        }
      } else if (type === 'weight') {
        const weightValue = (value as number) ?? 0
        instructionExercise.sets = instructionExercise.sets.map((set) => ({
          ...set,
          weight: {
            expected: weightValue,
            actual: weightValue,
          },
        }))
      } else if (type === 'reps') {
        value = Math.floor(value as number)
        const repsValue = (value as number) ?? 0
        instructionExercise.sets = instructionExercise.sets.map((set) => ({
          ...set,
          reps: {
            expected: repsValue,
            actual: repsValue,
          },
        }))
      } else if (type === 'rir') {
        delete instructionExercise.rpe
        value = Math.floor(value as number)
        instructionExercise.rir = {
          expected: value as number,
          actual: value as number,
        }
      }

      updatedInstructions[instructionIndex] = instructionExercise
      return {
        ...prev,
        exercises: updatedInstructions,
      }
    })
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
          actual: notes,
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
          actual: notes,
        },
      }

      return {
        ...prev,
        exercises: updatedExercises,
      }
    })
  }

  const onChangeRpeRir = (exerciseId: string, value: 'rpe' | 'rir') => {
    console.log(exerciseId, value)
    const exerciseToUpdate = workout.exercises.find(
      (e) => e.exerciseId === exerciseId
    )
    if (!exerciseToUpdate) return

    if (value === 'rpe') {
      delete exerciseToUpdate.details?.rir
    } else {
      delete exerciseToUpdate.details?.rpe
    }

    onEditExerciseDetails(exerciseId, value, value === 'rpe' ? 8 : 2)
  }

  const getStageTitle = (stage: WorkoutStage): string => {
    switch (stage) {
      case 'name':
        return 'Name and Muscles'
      case 'exercises':
        return 'Exercises List'
      case 'details':
        return 'Details'
      default:
        return capitalizeFirstLetter(stage)
    }
  }

  const getIsNextDisabled = (stage: WorkoutStage): boolean => {
    // TODO: Add validation logic
    switch (stage) {
      case 'name':
        // if (!workout.name) return true
        if (workout.muscleGroups.length < 1) return true
        return false
      case 'exercises':
        if (workout.exercises.length < 1) return true
        return false
      case 'details':
        if (workout.exercises.length < 1) return true
        return false
      default:
        return true
    }
  }

  const renderStage = (stage: WorkoutStage) => {
    switch (stage) {
      case 'name':
        return (
          <NameStage
            workout={workout}
            muscleGroupFilter={muscleGroupFilter}
            onNameChange={onNameChange}
            onToggleMuscleGroup={onToggleMuscleGroup}
            onMuscleGroupFilterChange={setMuscleGroupFilter}
          />
        )
      case 'exercises':
        return (
          <ExercisesStage
            workout={workout}
            exerciseFilter={exerciseFilter}
            exerciseResults={exerciseResults}
            onExerciseFilterChange={onExerciseFilterChangeTxt}
            onAddExercise={onAddExercise}
            onDeleteExercise={onDeleteExercise}
            onReorderExercises={onReorderExercises}
            renderErrorImage={(exercise) =>
              imageService.renderErrorExerciseImage(
                exercise,
                exerciseResults,
                setExerciseResults
              )
            }
          />
        )
      case 'details':
        return (
          <DetailsStage
            workout={workout}
            instructions={instructions}
            weeksStatus={weeksStatus}
            instructionsFilter={instructionsFilter}
            onInstructionsFilterChange={setInstructionsFilter}
            onEditExerciseDetails={onEditExerciseDetails}
            onEditExerciseNotes={onEditExerciseNotes}
            onChangeRpeRir={onChangeRpeRir}
          />
        )
      default:
        return <div>Stage not implemented</div>
    }
  }

  const getInstructionsToSave = (): Instructions => {
    const instructionsExercises = workout.exercises.map((exercise) => {
      const existingInstruction = instructions.exercises.find(
        (e) => e.exerciseId === exercise.exerciseId
      )

      if (existingInstruction) {
        return existingInstruction
      }

      const setsLength = 1
      const newSets = Array.from({ length: setsLength }, () => ({
        reps: {
          expected: exercise.details?.reps?.expected || 0,
          actual: exercise.details?.reps?.expected || 0,
        },
        weight: {
          expected: exercise.details?.weight?.expected || 0,
          actual: exercise.details?.weight?.expected || 0,
        },
      }))

      const exerciseInstructions: ExerciseInstructions = {
        exerciseId: exercise.exerciseId,
        sets: newSets,
        notes: exercise.details?.notes || { expected: '', actual: '' },
      }

      if (exercise.details?.rpe) {
        exerciseInstructions.rpe =
          exercise.details?.rpe ||
          instructionsService.getEmptyExpectedActual('rpe')
      }

      if (exercise.details?.rir) {
        exerciseInstructions.rir =
          exercise.details?.rir ||
          instructionsService.getEmptyExpectedActual('rir')
      }

      return exerciseInstructions
    })

    return {
      ...instructions,
      exercises: instructionsExercises,
    }
  }

  const onFinish = async () => {
    const workoutToSave = {
      ...workout,
      forUserId:
        forUserId || traineeUser?._id || user?._id || workout.forUserId,
    }

    if (!workoutToSave.name) {
      workoutToSave.name = 'Untitled Workout'
    }

    const instructionsToSave = getInstructionsToSave()

    try {
      setIsLoading(true)
      const savedWorkout = await saveWorkout(workoutToSave)
      instructionsToSave.workoutId = savedWorkout._id
      const idDoneToSave = instructionsToSave._id ? true : false
      await instructionsService.save({
        ...instructionsToSave,
        isDone: idDoneToSave,
      })
      showSuccessMsg(messages.success.saveWorkout)
    } catch (err) {
      showErrorMsg(messages.error.saveWorkout)
    } finally {
      setIsLoading(false)
      closeDialog()
    }
  }

  return (
    <div
      className={`page-container edit-workout-container ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
      // style={
      //   keyboardHeight > 0
      //     ? {
      //         position: 'absolute',
      //         bottom: `${25}px`,
      //         left: 0,
      //         right: 0,
      //         transition: 'bottom 0.25s ease',
      //       }
      //     : {}
      // }
    >
      <CustomStepper
        stages={stages}
        activeStage={activeStage}
        onStageChange={onStageChange}
        renderStage={renderStage}
        title={getStageTitle}
        direction={direction}
        getIsNextDisabled={getIsNextDisabled}
        onFinish={onFinish}
        finishText='Save Workout'
      />
    </div>
  )
}
