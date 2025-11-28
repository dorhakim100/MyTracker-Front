import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../../store/store'
import {
  capitalizeFirstLetter,
  debounce,
  getArrayOfNumbers,
} from '../../../services/util.service'

import { CustomStepper } from '../../../CustomMui/CustomStepper/CustomStepper'
import { CustomInput } from '../../../CustomMui/CustomInput/CustomInput'
import { Workout } from '../../../types/workout/Workout'
import { workoutService } from '../../../services/workout/workout.service'
import { CustomList } from '../../../CustomMui/CustomList/CustomList'
import { Exercise, ExerciseDetail } from '../../../types/exercise/Exercise'
import {
  showErrorMsg,
  showSuccessMsg,
} from '../../../services/event-bus.service'
import { messages } from '../../../assets/config/messages'
import { exersiceDetailsSelects } from '../../../assets/config/exersice-details-selects'

import {
  exerciseSearch,
  matchesMuscleGroup,
} from '../../../services/exersice-search/exersice-search'
import { setIsLoading } from '../../../store/actions/system.actions'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'

import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { Chip, Divider } from '@mui/material'
import { DeleteAction } from '../../../components/DeleteAction/DeleteAction'
import { musclesGroup } from '../../../assets/config/muscles-group'
import { MuscleGroupCard } from '../../../components/LiftMate/MuscleGroupCard/MuscleGroupCard'
import { MuscleGroup } from '../../../types/muscleGroup/MuscleGroup'
import { ClickAnimation } from '../../../components/ClickAnimation/ClickAnimation'
import { CustomSelect } from '../../../CustomMui/CustomSelect/CustomSelect'
import { PickerSelect } from '../../../components/Pickers/PickerSelect'
import { SlideDialog } from '../../../components/SlideDialog/SlideDialog'
import { ClockPicker } from '../../../components/Pickers/ClockPicker'
import { saveWorkout } from '../../../store/actions/workout.action'
import { Instructions } from '../../../types/instructions/Instructions'
import { instructionsService } from '../../../services/instructions/instructions.service'
import { CustomToggle } from '../../../CustomMui/CustomToggle/CustomToggle'
import { WeekNumberStatus } from '../../../types/weekNumberStatus/WeekNumberStatus'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

interface EditWorkoutProps {
  selectedWorkout?: Workout | null
  // saveWorkout?: (workout: Workout) => void
  forUserId?: string
  closeDialog: () => void
}

type MuscleGroupArea = 'all' | 'upper' | 'lower'
type PickerModalType = 'expectedSets' | 'actualSets' | 'rpe'
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

  const [instructions, setInstructions] = useState<Instructions>(
    instructionsService.getEmptyInstructions()
  )

  const [weeksStatus, setWeeksStatus] = useState<WeekNumberStatus[]>([])
  const [instructionsFilter, setInstructionsFilter] = useState({
    weekNumber: 1,
    forUserId: user?._id || '',
    workoutId: workout._id || '',
  })

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

  const [pickerModal, setPickerModal] = useState({
    isOpen: false,
    type: null as PickerModalType | null,
    exerciseId: null as string | null,
  })
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  )

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

  useEffect(() => {
    getWorkoutInstructions()
  }, [workout, instructionsFilter])

  async function getWorkoutInstructions() {
    try {
      if (!workout._id || !user?._id) return

      const instructions = await instructionsService.getByWorkoutId(
        instructionsFilter
      )
      console.log(instructions)
      const statuses = await instructionsService.getWeekNumberDone(workout._id)
      setWeeksStatus(statuses)
      setInstructions(instructions)
    } catch (err) {
      console.error(err)
      showErrorMsg(messages.error.getWorkoutInstructions)
    }
  }

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

    const instructionsExercises = newExercises.map((exercise) => {
      const rpe = instructionsService.getEmptyExpectedActual('rpe')
      const notes = instructionsService.getEmptyExpectedActual('notes')
      return {
        exerciseId: exercise.exerciseId,
        sets: [instructionsService.getEmptySet()],
        rpe: (rpe || { expected: 8, actual: 8 }) as {
          expected: number
          actual: number
        },
        notes: (notes || { expected: '', actual: '' }) as {
          expected: string
          actual: string
        },
      }
    })

    setInstructions((prev) => {
      return {
        ...prev,
        exercises: instructionsExercises,
      }
    })

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
      <div className='edit-workout-stage name-stage'>
        <CustomInput
          value={workout.name}
          onChange={onNameChange}
          placeholder='Enter workout name'
          isRemoveIcon={true}
        />
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        <div className='selected-muscles-group-container'>
          {renderSelectedMusclesGroup()}
        </div>
        <div className='muscle-filter-container'>
          <CustomInput
            value={muscleGroupFilter.txt}
            onChange={(txt: string) =>
              setMuscleGroupFilter({ ...muscleGroupFilter, txt })
            }
            placeholder='Search muscle'
            isRemoveIcon={true}
          />
          <CustomSelect
            value={muscleGroupFilter.area}
            onChange={(area: string) =>
              setMuscleGroupFilter({
                ...muscleGroupFilter,
                area: area as MuscleGroupArea,
              })
            }
            values={['all', 'upper', 'lower']}
            label='Area'
          />
        </div>
        <div className='muscles-group-container'>
          {filteredMuscleGroups.map((muscleGroup) => (
            <ClickAnimation
              key={muscleGroup.name}
              onClick={() => onToggleMuscleGroup(muscleGroup)}
            >
              <MuscleGroupCard
                muscleGroup={muscleGroup}
                className={`${getMuscleGroupCardClass(muscleGroup)} ${
                  prefs.favoriteColor
                }`}
              />
            </ClickAnimation>
          ))}
        </div>
      </div>
    )
  }

  function renderSelectedMusclesGroup() {
    return workout.muscleGroups.length > 0 ? (
      workout.muscleGroups.map((muscleGroup) => (
        <Chip
          label={capitalizeFirstLetter(muscleGroup)}
          variant='outlined'
          key={`${muscleGroup}-chip`}
        />
      ))
    ) : (
      <span className='no-muscles-selected bold-header'>
        No muscles selected
      </span>
    )
  }

  function renderExercisesStage() {
    return (
      <div className='edit-workout-stage exercises-stage'>
        <CustomInput
          value={exerciseFilter.txt}
          onChange={onExerciseFilterChangeTxt}
          placeholder='Search for exercises'
          isRemoveIcon={true}
        />

        <div className='exercises-lists-container'>
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
            noResultsMessage='No exercises found...'
          />
          <h4 className='bold-header'>Selected Exercises</h4>
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
              noResultsMessage='No exercises added yet'
              isSwipeable={true}
              renderRightSwipeActions={(exercise) => (
                <DeleteAction item={exercise} onDeleteItem={onDeleteExercise} />
              )}
              isDragable={true}
              onReorder={onReorderExercises}
              dragOffsetY={-180}
            />
          ) : (
            <div className='no-exercises bold-header'>
              No exercises added yet
            </div>
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
    const openPickerModal = (exercise: Exercise, type: PickerModalType) => {
      setPickerModal({ isOpen: true, type, exerciseId: exercise.exerciseId })
      setSelectedExercise(exercise)
    }

    const closePickerModal = () => {
      setPickerModal({ isOpen: false, type: null, exerciseId: null })
      setSelectedExercise(null)
    }

    const getIsAfterValue = (type: PickerModalType | null) => {
      if (!type) return false
      return exersiceDetailsSelects.find((select) => select.name === type)
        ?.isAfterValue
    }

    const getPickerModalValue = (
      type: PickerModalType | null,
      exercise: Exercise
    ): number => {
      if (!type) return 0

      if (type === ('sets' as PickerModalType)) {
        return (
          instructions.exercises.find(
            (e) => e.exerciseId === exercise.exerciseId
          )?.sets.length ||
          0 ||
          0
        )
      }

      const value = (
        exercise.details?.[type as keyof ExerciseDetail] as
          | { expected: number | string }
          | undefined
      )?.expected

      return typeof value === 'number' ? value : Number(value) || 0
    }

    const onEditExerciseDetailes = (newValue: number | string) => {
      const exerciseToUpdate = workout.exercises.find(
        (e) => e.exerciseId === pickerModal.exerciseId
      )

      console.log(pickerModal)

      if (pickerModal.type === ('sets' as PickerModalType)) {
        const instructionsExercise = instructions.exercises.find(
          (exercise) => exercise.exerciseId === pickerModal.exerciseId
        )
        if (!instructionsExercise) return

        instructionsExercise.sets.length = newValue as number
        instructionsExercise.sets = instructionsExercise.sets.map(() => {
          return instructionsService.getEmptySet()
        })

        console.log(instructionsExercise)

        setInstructions((prev) => ({
          ...prev,
          exercises: prev.exercises.map((exercise) =>
            exercise.exerciseId === pickerModal.exerciseId
              ? { ...exercise, sets: instructionsExercise.sets }
              : exercise
          ),
        }))

        return
      }

      if (!exerciseToUpdate) return

      const detail = exerciseToUpdate.details![
        pickerModal.type as keyof ExerciseDetail
      ] as { expected: number | string } | undefined
      if (detail) {
        detail.expected = newValue
      }

      editExerciseDetailes(exerciseToUpdate)
    }

    const onEditExerciseNotes = (notes: string, exercise: Exercise) => {
      if (!exercise.details?.notes)
        exercise.details!.notes = { expected: '', actual: '' }
      exercise.details!.notes!.expected = notes

      editExerciseDetailes(exercise)
    }

    async function getWeekNumberIcon(weekNumber: number) {
      if (!weeksStatus) return <CloseIcon />
      const status = weeksStatus.find(
        (status) => status.weekNumber === weekNumber
      )
      return status?.isDone ? <CheckIcon /> : <CloseIcon />
      return status?.isDone
    }

    return (
      <>
        <CustomToggle
          value={instructionsFilter.weekNumber + ''}
          onChange={(weekNumber: string) =>
            setInstructionsFilter({
              ...instructionsFilter,
              weekNumber: +weekNumber,
            })
          }
          options={getArrayOfNumbers(1, 10).map((weekNumber) => ({
            label: `Week`,
            value: weekNumber.toString(),
            icon: <span>{weekNumber}</span>,
            badgeIcon: getWeekNumberIcon(+weekNumber),
          }))}
          isBadge={true}
          isReversedIcon={true}
          className='week-number-toggle'
        />
        <div className='edit-workout-stage details-stage'>
          {workout.exercises.map((exercise: Exercise) => (
            <div
              key={exercise.exerciseId}
              className='exercise-details-edit-container'
            >
              <h4>{capitalizeFirstLetter(exercise.name)}</h4>

              {exersiceDetailsSelects.map((select) => {
                return (
                  <PickerSelect
                    openClock={() =>
                      openPickerModal(exercise, select.name as PickerModalType)
                    }
                    option={{
                      label: select.label,
                      key: select.name,
                      type: 'number',
                    }}
                    value={getPickerModalValue(
                      select.name as PickerModalType,
                      exercise
                    )}
                    key={select.name}
                  />
                )
              })}
              <CustomInput
                value={exercise.details?.notes?.expected || ''}
                onChange={(notes: string) =>
                  onEditExerciseNotes(notes, exercise)
                }
                placeholder={`${capitalizeFirstLetter(
                  exercise.name || ''
                )} notes`}
                isRemoveIcon={true}
              />
              <Divider
                className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
              />
            </div>
          ))}
        </div>
        <SlideDialog
          open={pickerModal.isOpen}
          onClose={closePickerModal}
          component={
            <ClockPicker
              value={getPickerModalValue(
                pickerModal.type,
                selectedExercise || workout.exercises[0]
              )}
              onChange={(_, value: number) => onEditExerciseDetailes(value)}
              isAfterValue={getIsAfterValue(pickerModal.type)}
            />
          }
          title={capitalizeFirstLetter(pickerModal.type || '')}
        />
      </>
    )
  }

  function getInstructionsToSave() {
    const instructionsExercises = workout.exercises.map((exercise) => {
      const sets = instructions.exercises.find(
        (e) => e.exerciseId === exercise.exerciseId
      )?.sets
      const newSets = getArrayOfNumbers(1, sets?.length || 0).map(() => {
        return {
          reps: {
            expected: exercise.details?.reps?.expected || 0,
            actual: exercise.details?.reps?.expected || 0,
          },
          weight: {
            expected: exercise.details?.weight?.expected || 0,
            actual: exercise.details?.weight?.expected || 0,
          },
        }
      })
      return {
        exerciseId: exercise.exerciseId,
        sets: newSets,
        rpe: exercise.details?.rpe,
        notes: exercise.details?.notes,
      }
    })

    const instructionsToSave = {
      ...instructions,
      exercises: instructionsExercises,
    }
    return instructionsToSave
  }

  async function onFinish() {
    if (!forUserId) {
      workout.forUserId = user?._id
    }

    const instructionsToSave = getInstructionsToSave()

    try {
      setIsLoading(true)

      const savedWorkout = await saveWorkout(workout)
      instructionsToSave.workoutId = savedWorkout._id
      await instructionsService.save(instructionsToSave as Instructions)
      showSuccessMsg(messages.success.saveWorkout)
    } catch (err) {
      console.error(err)
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
