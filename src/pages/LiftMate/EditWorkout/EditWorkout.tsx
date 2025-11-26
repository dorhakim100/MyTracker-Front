import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../../store/store'
import {
  capitalizeFirstLetter,
  debounce,
  getArrayOfNumbers,
} from '../../../services/util.service'

import { CustomStepper } from '../../../CustomMui/CustomStepper/CustomStepper'
import { Workout } from '../../../types/workout/Workout'
import { workoutService } from '../../../services/workout/workout.service'
import { Exercise } from '../../../types/exercise/Exercise'
import {
  showErrorMsg,
  showSuccessMsg,
} from '../../../services/event-bus.service'
import { messages } from '../../../assets/config/messages'

import {
  exerciseSearch,
  matchesMuscleGroup,
} from '../../../services/exersice-search/exersice-search'
import { setIsLoading } from '../../../store/actions/system.actions'
import { musclesGroup } from '../../../assets/config/muscles-group'
import { MuscleGroup } from '../../../types/muscleGroup/MuscleGroup'
import { saveWorkout } from '../../../store/actions/workout.action'
import { NameStage } from './NameStage'
import { ExercisesStage } from './ExercisesStage'
import { DetailsStage } from './DetailsStage'
import { instructionsService } from '../../../services/instructions/instructions.service'

interface EditWorkoutProps {
  selectedWorkout?: Workout | null
  // saveWorkout?: (workout: Workout) => void
  forUserId?: string
  closeDialog: () => void
}

type MuscleGroupArea = 'all' | 'upper' | 'lower'
interface MuscleGroupFilter {
  txt: string
  area: MuscleGroupArea
}

const stages = ['name', 'exercises', 'details']
type WorkoutStage = (typeof stages)[number]

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

  const [workout, setWorkout] = useState<Workout>(
    selectedWorkout || workoutService.getEmptyWorkout()
  )

  const [muscleGroupFilter, setMuscleGroupFilter] = useState<MuscleGroupFilter>(
    {
      txt: '',
      area: 'all',
    }
  )

  const [exerciseFilter, setExerciseFilter] = useState({
    txt: '',
  })
  const [exerciseResults, setExerciseResults] = useState<Exercise[]>([])

  const latestHandleSearchRef = useRef(handleSearch)

  const debouncedRunSearch = useRef(
    debounce(() => latestHandleSearchRef.current(), 300)
  ).current

  const [activeStage, setActiveStage] = useState<WorkoutStage>(stages[0])
  const [direction, setDirection] = useState(1)

  const filteredMuscleGroups = useMemo(() => {
    let filteredMuscleGroups = musclesGroup
    if (muscleGroupFilter.txt) {
      filteredMuscleGroups = musclesGroup.filter((muscleGroup) => {
        return matchesMuscleGroup(muscleGroup, muscleGroupFilter.txt)
      })
    }

    if (muscleGroupFilter.area !== 'all') {
      filteredMuscleGroups = filteredMuscleGroups.filter((muscleGroup) => {
        return muscleGroup.area === muscleGroupFilter.area
      })
    }
    return filteredMuscleGroups
  }, [muscleGroupFilter.txt, muscleGroupFilter.area])

  useEffect(() => {
    latestHandleSearchRef.current = handleSearch
  }, [handleSearch])

  useEffect(() => {
    debouncedRunSearch()
  }, [exerciseFilter, debouncedRunSearch])

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
    const addedIndex = workout.exercises.findIndex(
      (e) => e.exerciseId === exercise.exerciseId
    )
    let newExercises: Exercise[] = []
    if (addedIndex === -1) {
      exercise.details = workoutService.getEmptyExerciseDetail()
      newExercises = [...workout.exercises, exercise]
    } else {
      workout.exercises.splice(addedIndex, 1)
      newExercises = [...workout.exercises]
    }
    setWorkout({ ...workout, exercises: newExercises })
  }

  const onExerciseFilterChangeTxt = (txt: string) => {
    setExerciseFilter((prev) => ({ ...prev, txt }))
  }

  const onDeleteExercise = (exercise: Exercise) => {
    const newExercises = workout.exercises.filter(
      (e) => e.exerciseId !== exercise.exerciseId
    )
    setWorkout({ ...workout, exercises: newExercises })
  }

  const onReorderExercises = (exercises: Exercise[]) => {
    setWorkout({ ...workout, exercises })
  }

  const editExerciseDetailes = (exerciseToUpdate: Exercise) => {
    const exerciseIndex = workout.exercises.findIndex(
      (e) => e.exerciseId === exerciseToUpdate.exerciseId
    )
    if (exerciseIndex === -1) return
    workout.exercises[exerciseIndex].details = exerciseToUpdate.details
    setWorkout({ ...workout, exercises: [...workout.exercises] })
  }

  async function handleSearch() {
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
      console.error(err)
      showErrorMsg(messages.error.search)
      setExerciseResults([])
    } finally {
      setIsLoading(false)
    }
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
        if (!workout.name) return true
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
            workoutName={workout.name}
            muscleGroups={workout.muscleGroups}
            onNameChange={onNameChange}
            onToggleMuscleGroup={onToggleMuscleGroup}
            muscleGroupFilter={muscleGroupFilter}
            onMuscleGroupFilterChange={setMuscleGroupFilter}
            filteredMuscleGroups={filteredMuscleGroups}
          />
        )
      case 'exercises':
        return (
          <ExercisesStage
            exerciseFilter={exerciseFilter}
            onExerciseFilterChange={onExerciseFilterChangeTxt}
            exerciseResults={exerciseResults}
            exercises={workout.exercises}
            onAddExercise={onAddExercise}
            onDeleteExercise={onDeleteExercise}
            onReorderExercises={onReorderExercises}
          />
        )
      case 'details':
        return (
          <DetailsStage
            exercises={workout.exercises}
            onEditExerciseDetails={editExerciseDetailes}
          />
        )
      default:
        return <div>Stage not implemented</div>
    }
  }

  async function onFinish() {
    if (!forUserId) {
      workout.forUserId = user?._id
    }
    // console.log(workout)

    const exercisesDetailsInstructions = workout.exercises.map((exercise) => {
      return {
        workoutId: workout._id,
        exerciseId: exercise.exerciseId,
        sets: getArrayOfNumbers(1, exercise.details?.sets.expected || 1).map(
          () => {
            return {
              reps: {
                expected: exercise.details?.reps.expected,
                actual: exercise.details?.reps.actual || 0,
              },
              weight: {
                expected: exercise.details?.weight.expected,
                actual: exercise.details?.weight.actual || 0,
              },
            }
          }
        ),
        rpe: exercise.details?.rpe,
      }
    })

    console.log(exercisesDetailsInstructions)

    instructionsService.save({
      userId: user?._id || '',
      workoutId: workout._id || '',
      sets: exercisesDetailsInstructions,
      weekNumber: 1,
    })
    return
    try {
      setIsLoading(true)
      await saveWorkout(workout)
      showSuccessMsg(messages.success.saveWorkout)
    } catch (err) {
      console.error(err)
      showErrorMsg(messages.error.saveWorkout)
    } finally {
      setIsLoading(false)
      closeDialog()
    }
    // TODO: Implement save logic
    // if (saveWorkout) {
    //   // saveWorkout(workoutData)
    // }
  }

  return (
    <div
      className={`page-container edit-workout-container ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
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
