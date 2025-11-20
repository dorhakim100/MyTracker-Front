import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../../store/store'
import { capitalizeFirstLetter, debounce } from '../../../services/util.service'

import { CustomStepper } from '../../../CustomMui/CustomStepper/CustomStepper'
import { CustomInput } from '../../../CustomMui/CustomInput/CustomInput'
import { Workout } from '../../../types/workout/Workout'
import { workoutService } from '../../../services/workout/workout-service'
import { CustomList } from '../../../CustomMui/CustomList/CustomList'
import { Exercise } from '../../../types/exercise/Exercise'
import { showErrorMsg } from '../../../services/event-bus.service'
import { messages } from '../../../assets/config/messages'
import {
  exerciseSearch,
  matchesMuscleGroup,
} from '../../../services/exersice-search/exersice-search'
import { setIsLoading } from '../../../store/actions/system.actions'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'

import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { Divider } from '@mui/material'
import { DeleteAction } from '../../../components/DeleteAction/DeleteAction'
import { musclesGroup } from '../../../assets/config/muscles-group'
import { MuscleGroupCard } from '../../../components/LiftMate/MuscleGroupCard/MuscleGroupCard'
import { MuscleGroup } from '../../../types/muscleGroup/MuscleGroup'

interface EditWorkoutProps {
  selectedWorkout?: Workout | null
  saveWorkout?: (workout: Workout) => void
}

const stages = ['name', 'exercises', 'details']
type WorkoutStage = (typeof stages)[number]

export function EditWorkout({
  selectedWorkout,
  saveWorkout,
}: EditWorkoutProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [workout, setWorkout] = useState<Workout>(
    selectedWorkout || workoutService.getEmptyWorkout()
  )

  const [searchMuscleGroupTxt, setSearchMuscleGroupTxt] = useState('')

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
    if (!searchMuscleGroupTxt) {
      return musclesGroup
    }
    return musclesGroup.filter((muscleGroup) => {
      return matchesMuscleGroup(muscleGroup, searchMuscleGroupTxt)
    })
  }, [searchMuscleGroupTxt])

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
        return 'Workout Name'
      case 'exercises':
        return 'Exercises'
      case 'details':
        return 'Workout Details'
      default:
        return capitalizeFirstLetter(stage)
    }
  }

  const getIsNextDisabled = (stage: WorkoutStage): boolean => {
    // TODO: Add validation logic
    switch (stage) {
      case 'name':
        return false // TODO: Check if name is filled
      case 'exercises':
        return false // TODO: Check if exercises are added
      case 'details':
        return false
      default:
        return false
    }
  }

  const renderStage = (stage: WorkoutStage) => {
    switch (stage) {
      case 'name':
        return renderNameStage()
      case 'exercises':
        return renderExercisesStage()
      case 'details':
        return renderDetailsStage()
      default:
        return <div>Stage not implemented</div>
    }
  }

  function renderNameStage() {
    return (
      <div className="edit-workout-stage name-stage">
        <CustomInput
          value={workout.name}
          onChange={onNameChange}
          placeholder="Enter workout name"
          isRemoveIcon={true}
        />
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        <CustomInput
          value={searchMuscleGroupTxt}
          onChange={setSearchMuscleGroupTxt}
          placeholder="Search for muscles"
          isRemoveIcon={true}
        />
        <div className="muscles-group-container">
          {filteredMuscleGroups.map((muscleGroup) => (
            <MuscleGroupCard
              key={muscleGroup.name}
              muscleGroup={muscleGroup}
              className={`${getMuscleGroupCardClass(muscleGroup)} ${
                prefs.favoriteColor
              }`}
              onClick={() => onToggleMuscleGroup(muscleGroup)}
            />
          ))}
        </div>
      </div>
    )
  }

  function renderExercisesStage() {
    return (
      <div className="edit-workout-stage exercises-stage">
        <CustomInput
          value={exerciseFilter.txt}
          onChange={onExerciseFilterChangeTxt}
          placeholder="Search for exercises"
        />

        <div className="exercises-lists-container">
          <CustomList
            items={exerciseResults}
            renderPrimaryText={(exercise) =>
              capitalizeFirstLetter(exercise.name)
            }
            renderSecondaryText={(exercise) => (
              <span className={`${prefs.isDarkMode ? 'dark-mode' : ''}`}>
                {capitalizeFirstLetter(exercise.muscleGroups.join(', '))}
              </span>
            )}
            renderLeft={(exercise) => (
              <img src={exercise.image} alt={exercise.name} />
            )}
            getKey={(exercise) => exercise.exerciseId}
            className={`search-exercise-list ${
              prefs.isDarkMode ? 'dark-mode' : ''
            }`}
            renderRight={(exercise) => (
              <CustomButton
                icon={getExerciseActionIcon(exercise)}
                onClick={() => onAddExercise(exercise)}
                className={`${getExerciseActionButtonClass(exercise)}`}
              />
            )}
            noResultsMessage="No exercises found..."
          />
          <h4>Selected Exercises</h4>
          <Divider
            className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          />
          {workout.exercises.length > 0 ? (
            <CustomList
              items={workout.exercises}
              renderPrimaryText={(exercise) =>
                capitalizeFirstLetter(exercise.name)
              }
              renderSecondaryText={(exercise) =>
                capitalizeFirstLetter(exercise.muscleGroups.join(', '))
              }
              renderLeft={(exercise) => (
                <img src={exercise.image} alt={exercise.name} />
              )}
              getKey={(exercise) => `${exercise.exerciseId}-selected`}
              className={`selected-exercise-list ${
                prefs.isDarkMode ? 'dark-mode' : ''
              }`}
              noResultsMessage="No exercises added yet"
              isSwipeable={true}
              renderRightSwipeActions={(exercise) => (
                <DeleteAction item={exercise} onDeleteItem={onDeleteExercise} />
              )}
              isDragable={true}
              onReorder={onReorderExercises}
              dragOffsetY={-180}
            />
          ) : (
            <div className="no-exercises">No exercises added yet</div>
          )}
        </div>
      </div>
    )
  }

  function getExerciseActionIcon(exercise: Exercise) {
    const addedIndex = workout.exercises.findIndex(
      (e) => e.exerciseId === exercise.exerciseId
    )
    return addedIndex === -1 ? <AddIcon /> : <RemoveIcon />
  }

  function getExerciseActionButtonClass(exercise: Exercise) {
    return workout.exercises.find((e) => e.exerciseId === exercise.exerciseId)
      ? 'red'
      : ''
  }

  function getMuscleGroupCardClass(muscleGroup: MuscleGroup) {
    return workout.muscleGroups.includes(muscleGroup.name) ? 'selected' : ''
  }

  function renderDetailsStage() {
    return (
      <div className="edit-workout-stage details-stage">
        <p>Details stage - TODO: Add workout details</p>
      </div>
    )
  }

  function onFinish() {
    // TODO: Implement save logic
    if (saveWorkout) {
      // saveWorkout(workoutData)
    }
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
        finishText="Save Workout"
      />
    </div>
  )
}
