import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { debounce, DialogActions, Divider, Typography } from '@mui/material'

import { SessionDay } from '../../types/workout/SessionDay'
import { Exercise } from '../../types/exercise/Exercise'
import {
  removeSessionDay,
  removeCurrentExercise,
  setCurrentExercise,
  setSelectedSessionDay,
  removeTimer,
  setTimer,
  saveWorkout,
} from '../../store/actions/workout.action'

import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { ExerciseInstructions } from '../../types/exercise/ExerciseInstructions'
import { showErrorMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { instructionsService } from '../../services/instructions/instructions.service'
import { setIsLoading } from '../../store/actions/system.actions'
import { setService } from '../../services/set/set.service'
import { Instructions } from '../../types/instructions/Instructions'
import DeleteIcon from '@mui/icons-material/Delete'
import { CustomAlertDialog } from '../../CustomMui/CustomAlertDialog/CustomAlertDialog'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { ExerciseCard } from '../ExerciseCard/ExerciseCard'
import {
  filterExercises,
  getMostPopularExercises,
  getWorkoutMuscles,
  exerciseSearch,
} from '../../services/exersice-search/exersice-search'
import CircleIcon from '@mui/icons-material/Circle'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { ExercisesStage } from '../../pages/LiftMate/EditWorkout/ExercisesStage'
import { ExerciseFilter } from '../../types/exerciseFilter/ExerciseFilter'
import { DEFAULT_RESTING_TIME } from '../../assets/config/times'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { WorkoutDetails } from '../WorkoutDetails/WorkoutDetails'
interface WorkoutSessionProps {
  sessionDay: SessionDay
  updateSessionDay: () => void
}

export function WorkoutSession({
  sessionDay,
  updateSessionDay,
}: WorkoutSessionProps) {
  if (!sessionDay.instructions) return null

  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const isDashboard = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isDashboard
  )

  const [openExercises, setOpenExercises] = useState<Set<string>>(new Set())

  const workouts = useSelector(
    (state: RootState) => state.workoutModule.workouts
  )

  const [exerciseFilter, setExerciseFilter] = useState<ExerciseFilter>({
    searchValue: '',
    muscleGroupValue: 'All',
    equipmentValue: 'All',
  })

  const [exerciseResults, setExerciseResults] = useState<Exercise[]>([])

  const timer = useSelector((state: RootState) => state.workoutModule.timer)

  const [alertDialogOptions, setAlertDialogOptions] = useState<{
    open: boolean
    title: string
    component: React.ReactNode
    exerciseId: string
  }>({
    open: false,
    title: '',
    component: null,
    exerciseId: '',
  })
  const allExerciseIds = sessionDay.instructions.exercises.map(
    (ex) => ex.exerciseId
  )
  const allExpanded =
    allExerciseIds.length > 0 &&
    allExerciseIds.every((id) => openExercises.has(id))

  const [exerciseNotes, setExerciseNotes] = useState<string>('')

  const [slideDialogOptions, setSlideDialogOptions] = useState<{
    open: boolean
    title: string
    component: React.ReactNode
    type: 'details' | 'edit' | null
  }>({
    open: false,
    title: '',
    component: null,
    type: null,
  })

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
    if (isDashboard) {
      setOpenExercises(
        new Set(sessionDay.workout.exercises.map((ex) => ex.exerciseId))
      )
      return
    }

    if (
      !sessionDay.instructions.exercises ||
      sessionDay.instructions.isFinished
    )
      return
    const isExerciseDone = (exercise: ExerciseInstructions) => {
      return exercise.sets.every((set) => set.isDone)
    }
    const firstExerciseToOpen = sessionDay.instructions.exercises.find(
      (e) => !isExerciseDone(e)
    )
    if (firstExerciseToOpen) {
      handleOpenChange(firstExerciseToOpen.exerciseId, true)
    }
  }, [sessionDay.instructions.exercises])

  const onExerciseFilterChange = (exerciseFilter: ExerciseFilter) => {
    setExerciseFilter(exerciseFilter)
  }

  const onAddExercise = async (exercise: Exercise) => {
    try {
      if (!sessionDay._id) return showErrorMsg(messages.error.addExercise)
      const instructions = sessionDay.instructions
      const isExerciseAlreadyAdded = instructions.exercises.find(
        (e) => e.exerciseId === exercise.exerciseId
      )
      const newSet = {
        ...instructionsService.getEmptySet(),
        setIndex: 0,
        userId: sessionDay.workout.forUserId || '',
      }
      const newExercises = isExerciseAlreadyAdded
        ? instructions.exercises.filter(
            (e) => e.exerciseId !== exercise.exerciseId
          )
        : [
            ...instructions.exercises,
            {
              exerciseId: exercise.exerciseId,
              sets: [newSet],
              notes: { expected: '', actual: '' },
              restingTime: DEFAULT_RESTING_TIME,
              image: exercise.image,
            },
          ]

      const newInstructions = {
        ...instructions,
        exercises: newExercises,
      }

      const workout = sessionDay.workout

      const newWorkoutExercises = isExerciseAlreadyAdded
        ? workout.exercises.filter((e) => e.exerciseId !== exercise.exerciseId)
        : [...workout.exercises, exercise]

      const newWorkout = {
        ...workout,
        exercises: newWorkoutExercises,
      }

      const promises = [
        saveNewInstructions(newInstructions),
        saveWorkout(newWorkout),
        !isExerciseAlreadyAdded
          ? setService.saveSetBySessionIdAndExerciseId(
              sessionDay._id,
              exercise.exerciseId,
              newSet,
              0,
              true
            )
          : Promise.resolve(null),
      ]

      const [savedInstructions, savedWorkout, savedSet] =
        await Promise.all(promises)

      if (savedSet) {
        setCurrentExercise({
          ...exercise,
          sets: [savedSet],
          notes: { expected: '', actual: '' },
          restingTime: DEFAULT_RESTING_TIME,
        })
      }

      setSelectedSessionDay({
        ...sessionDay,
        instructions: savedInstructions,
        workout: savedWorkout,
      })
    } catch (err) {
      showErrorMsg(messages.error.addExercise)
    }
  }

  const onDeleteExercise = async (exercise: Exercise) => {
    try {
      const newExercises = sessionDay.instructions.exercises.filter(
        (e) => e.exerciseId !== exercise.exerciseId
      )
      const newInstructions = {
        ...sessionDay.instructions,
        exercises: newExercises,
      }
      const newWorkout = {
        ...sessionDay.workout,
        exercises: sessionDay.workout.exercises.filter(
          (e) => e.exerciseId !== exercise.exerciseId
        ),
      }
      const promises = [
        saveNewInstructions(newInstructions),
        saveWorkout(newWorkout),
      ]
      const [savedInstructions, savedWorkout] = await Promise.all(promises)
      setSelectedSessionDay({
        ...sessionDay,
        instructions: savedInstructions,
        workout: savedWorkout,
      })
    } catch (err) {
      showErrorMsg(messages.error.deleteExercise)
    }
  }

  const onReorderExercises = (exercises: Exercise[]) => {
    console.log('exercises', exercises)
  }

  const resultsMsg = !exerciseFilter.searchValue
    ? 'Most Popular Exercises'
    : `${filteredExerciseResults.length} exercises found`

  const handleOpenChange = useCallback(
    (exerciseId: string, openToSet: boolean) => {
      setOpenExercises((prev) => {
        const newSet = new Set(prev)
        if (openToSet) {
          newSet.add(exerciseId)
        } else {
          newSet.delete(exerciseId)
        }
        return newSet
      })
    },
    []
  )

  const toggleExpandAll = () => {
    if (!sessionDay?.workout?.exercises) return
    const allExerciseIds = sessionDay.workout.exercises.map(
      (ex) => ex.exerciseId
    )
    const allExpanded = allExerciseIds.every((id) => openExercises.has(id))

    if (allExpanded) {
      setOpenExercises(new Set())
    } else {
      setOpenExercises(new Set(allExerciseIds))
    }
  }

  const getWorkoutName = () => {
    const workoutId = sessionDay.instructions.workoutId

    const workout =
      workouts.find((w) => w._id === workoutId) || sessionDay.workout
    return workout?.name
  }

  // Helper function to check if exercise is done
  const isExerciseDone = (exerciseToCheck: ExerciseInstructions): boolean => {
    return exerciseToCheck.sets.every((set) => set.isDone)
  }

  // Helper function to clean set (remove unused RPE/RIR field)
  const cleanSet = (set: any) => {
    let cleanedSet = { ...set }
    if (cleanedSet.rir) {
      const { rpe, ...setWithoutRpe } = cleanedSet
      cleanedSet = setWithoutRpe
    } else if (cleanedSet.rpe) {
      const { rir, ...setWithoutRir } = cleanedSet
      cleanedSet = setWithoutRir
    }
    return cleanedSet
  }

  // Updates exercise in instructions state
  const updateExerciseInInstructions = (
    exercise: ExerciseInstructions
  ): Instructions => {
    return {
      ...sessionDay.instructions,
      exercises: sessionDay.instructions.exercises.map((e) =>
        e.exerciseId === exercise.exerciseId ? exercise : e
      ),
    }
  }

  // Handles moving to next exercise when current is completed
  const handleMoveToNextExercise = (
    completedExercise: ExerciseInstructions,
    exerciseIndex: number
  ) => {
    const nextExercise = sessionDay.instructions.exercises.find(
      (e, index) => !isExerciseDone(e) && index > exerciseIndex
    )

    if (!nextExercise) return null

    const imageToSet = nextExercise?.image
      ? nextExercise.image
      : sessionDay.workout.exercises.find(
          (e) => e.exerciseId === nextExercise?.exerciseId
        )?.image

    const currentExerciseToSet = {
      ...nextExercise,
      setIndex: 0,
      image: imageToSet,
    }

    handleOpenChange(completedExercise.exerciseId || '', false)
    handleOpenChange(nextExercise?.exerciseId || '', true)

    return currentExerciseToSet
  }

  // Handles when all exercises are completed
  const handleAllExercisesCompleted = async (
    savedInstructions: Instructions
  ) => {
    setSelectedSessionDay({
      ...sessionDay,
      instructions: { ...savedInstructions, isFinished: true },
    })
    removeCurrentExercise()

    if (timer) {
      await removeTimer(timer?._id)
    }
  }

  // Updates exercise values (reps, weight, RPE/RIR) and saves instructions
  const updateExercise = async (exercise: ExerciseInstructions) => {
    if (!sessionDay._id) {
      showErrorMsg(messages.error.updateSet)
      return
    }

    const originalInstructions = sessionDay.instructions
    const newInstructions = updateExerciseInInstructions(exercise)

    // Skip if nothing changed
    if (getIsStringifySame(originalInstructions, newInstructions)) return

    // Update state immediately
    setSelectedSessionDay({
      ...sessionDay,
      instructions: { ...newInstructions },
    })

    try {
      // Save instructions to backend
      const savedInstructions = await saveNewInstructions(newInstructions)
      if (savedInstructions) {
        setSelectedSessionDay({
          ...sessionDay,
          instructions: savedInstructions,
        })
      }

      // Save the updated set values to backend
      const exerciseIndex = newInstructions.exercises.findIndex(
        (e) => e.exerciseId === exercise.exerciseId
      )

      if (exerciseIndex !== -1) {
        // Save all sets that have been updated
        for (let setIndex = 0; setIndex < exercise.sets.length; setIndex++) {
          const setToSave = cleanSet(exercise.sets[setIndex])
          await setService.saveSetBySessionIdAndExerciseId(
            sessionDay._id,
            exercise.exerciseId,
            {
              ...setToSave,
              userId: sessionDay.workout.forUserId || '',
            },
            setIndex,
            false // isNew - updating existing set
          )
        }
      }
    } catch (err) {
      // Rollback on error
      setSelectedSessionDay({
        ...sessionDay,
        instructions: originalInstructions,
      })
      showErrorMsg(messages.error.updateSet)
    }
  }

  // Adds a new set to an exercise
  const addSet = async (
    exercise: ExerciseInstructions,
    setIndex: number
  ): Promise<void> => {
    if (!sessionDay._id) {
      showErrorMsg(messages.error.updateSet)
      return
    }

    const originalInstructions = sessionDay.instructions
    const newInstructions = updateExerciseInInstructions(exercise)

    // Update state immediately
    setSelectedSessionDay({
      ...sessionDay,
      instructions: { ...newInstructions },
    })

    try {
      // Save instructions to backend
      const savedInstructions = await saveNewInstructions(newInstructions)
      if (savedInstructions) {
        setSelectedSessionDay({
          ...sessionDay,
          instructions: savedInstructions,
        })
      }

      // Save the new set to backend
      const setToSave = cleanSet(exercise.sets[setIndex])
      await setService.saveSetBySessionIdAndExerciseId(
        sessionDay._id,
        exercise.exerciseId,
        {
          ...setToSave,
          userId: sessionDay.workout.forUserId || '',
        },
        setIndex,
        true // isNew
      )
    } catch (err) {
      // Rollback on error
      setSelectedSessionDay({
        ...sessionDay,
        instructions: originalInstructions,
      })
      showErrorMsg(messages.error.updateSet)
    }
  }

  // Removes a set from an exercise
  const removeSet = async (
    exercise: ExerciseInstructions,
    setIndex: number
  ): Promise<void> => {
    if (!sessionDay._id) {
      showErrorMsg(messages.error.updateSet)
      return
    }

    const originalInstructions = sessionDay.instructions
    const newInstructions = updateExerciseInInstructions(exercise)

    // Update state immediately
    setSelectedSessionDay({
      ...sessionDay,
      instructions: { ...newInstructions },
    })

    try {
      // Remove set from backend
      await setService.removeSetBySessionIdAndExerciseId(
        sessionDay._id,
        exercise.exerciseId,
        setIndex
      )

      // Save instructions to backend
      const savedInstructions = await saveNewInstructions(newInstructions)
      if (savedInstructions) {
        setSelectedSessionDay({
          ...sessionDay,
          instructions: savedInstructions,
        })
      }
    } catch (err) {
      // Rollback on error
      setSelectedSessionDay({
        ...sessionDay,
        instructions: originalInstructions,
      })
      showErrorMsg(messages.error.updateSet)
    }
  }

  // Marks a set as done and handles timer/exercise completion
  const markSetAsDone = async (
    exercise: ExerciseInstructions,
    setIndex: number
  ): Promise<void> => {
    if (!sessionDay._id) {
      showErrorMsg(messages.error.updateSet)
      return
    }

    const originalInstructions = sessionDay.instructions
    const newInstructions = updateExerciseInInstructions(exercise)
    const exerciseIndex = newInstructions.exercises.findIndex(
      (e) => e.exerciseId === exercise.exerciseId
    )

    // Update state immediately
    setSelectedSessionDay({
      ...sessionDay,
      instructions: { ...newInstructions },
    })

    try {
      const currentExerciseToSet = { ...exercise, setIndex }
      // Check if exercise is done
      if (isExerciseDone(exercise)) {
        const nextExercise = handleMoveToNextExercise(exercise, exerciseIndex)
        if (nextExercise) {
          setCurrentExercise(nextExercise)
          await setTimer({
            currentExercise: nextExercise,
            startTime: new Date().getTime(),
          })
        }
      } else {
        // Just update timer for current exercise
        setCurrentExercise(currentExerciseToSet)
        await setTimer({
          currentExercise: currentExerciseToSet,
          startTime: new Date().getTime(),
        })
      }
      const setToSave = cleanSet(exercise.sets[setIndex])

      const promises = []
      promises.push(saveNewInstructions(newInstructions))
      promises.push(
        setService.saveSetBySessionIdAndExerciseId(
          sessionDay._id,
          exercise.exerciseId,
          {
            ...setToSave,
            userId: sessionDay.workout.forUserId || '',
          },
          setIndex,
          false // isNew
        )
      )
      const [savedInstructions] = await Promise.all(promises)

      if (savedInstructions) {
        setSelectedSessionDay({
          ...sessionDay,
          instructions: savedInstructions,
        })
      }
      // Check if all exercises are done
      const isAllExercisesDone = savedInstructions.exercises.every(
        (e: ExerciseInstructions) =>
          e.exerciseId === exercise.exerciseId
            ? isExerciseDone(exercise)
            : isExerciseDone(e)
      )

      if (isAllExercisesDone) {
        await handleAllExercisesCompleted(savedInstructions || newInstructions)
        handleOpenChange(exercise.exerciseId, false)
      }

      // Save the updated set to backend
    } catch (err) {
      // Rollback on error
      setSelectedSessionDay({
        ...sessionDay,
        instructions: originalInstructions,
      })
      showErrorMsg(messages.error.updateSet)
    }
  }

  async function saveNewInstructions(newInstructions: Instructions) {
    try {
      setIsLoading(true)
      const savedInstructions = await instructionsService.save(newInstructions)
      return savedInstructions
    } catch (err) {
      showErrorMsg(messages.error.updateSet)
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteSession() {
    try {
      if (!sessionDay._id) return showErrorMsg(messages.error.deleteSession)
      setIsLoading(true)
      await removeSessionDay(sessionDay._id)
      if (timer?._id) await removeTimer(timer?._id)
      updateSessionDay()
      closeAlertDialog()
    } catch (err) {
      showErrorMsg(messages.error.deleteSession)
    } finally {
      setIsLoading(false)
    }
  }

  async function saveExerciseNotes(exerciseId: string, notes: string) {
    try {
      setIsLoading(true)
      await instructionsService.save({
        ...sessionDay.instructions,
        exercises: sessionDay.instructions.exercises.map((e) =>
          e.exerciseId === exerciseId
            ? {
                ...e,
                notes: { expected: e.notes?.expected || '', actual: notes },
              }
            : e
        ),
      })
      closeAlertDialog()
    } catch (err) {
      showErrorMsg(messages.error.updateSet)
    } finally {
      setIsLoading(false)
    }
  }

  function closeAlertDialog() {
    setAlertDialogOptions({
      open: false,
      title: '',
      component: null,
      exerciseId: '',
    })
    setExerciseNotes('')
  }

  function getIsStringifySame(
    originalInstructions: Instructions,
    newInstructions: Instructions
  ) {
    return (
      JSON.stringify(originalInstructions) === JSON.stringify(newInstructions)
    )
  }

  function closeSlideDialog() {
    setSlideDialogOptions({
      open: false,
      title: '',
      component: null,
      type: null,
    })
    setExerciseFilter({
      searchValue: '',
      muscleGroupValue: 'All',
      equipmentValue: 'All',
    })
  }

  function getSlideDialogComponent() {
    const type = slideDialogOptions.type
    switch (type) {
      case 'edit':
        return (
          <ExercisesStage
            workout={sessionDay.workout}
            exerciseFilter={exerciseFilter}
            exerciseResults={filteredExerciseResults}
            onExerciseFilterChange={onExerciseFilterChange}
            onAddExercise={onAddExercise}
            onDeleteExercise={onDeleteExercise}
            onReorderExercises={onReorderExercises}
            resultsMsg={resultsMsg}
          />
        )
      case 'details':
        return <WorkoutDetails workout={sessionDay.workout} />

      default:
        return null
        break
    }
    return null
  }

  function openExerciseDialog() {
    setSlideDialogOptions({
      open: true,
      title: 'Add Exercise',
      component: null,
      type: 'edit',
    })
  }
  const onOpenWorkoutDetails = () => {
    setSlideDialogOptions({
      open: true,
      title: 'Workout Details',
      component: <WorkoutDetails workout={sessionDay.workout} />,
      type: 'details',
    })
  }
  const getAlertDialogComponent = () => {
    if (alertDialogOptions.component === 'delete')
      return (
        <div className='modal-delete-workout-container'>
          <Typography variant='h6'>
            Are you sure you want to delete this workout?
          </Typography>
          <DialogActions>
            <CustomButton
              text='Cancel'
              fullWidth
              onClick={closeAlertDialog}
              className={`${prefs.favoriteColor}`}
            />
            <CustomButton
              text='Delete'
              fullWidth
              onClick={deleteSession}
              className={`${prefs.favoriteColor} delete-account-button`}
            />
          </DialogActions>
        </div>
      )

    if (alertDialogOptions.component === 'note') {
      return (
        <div className='notes-edit-container'>
          <CustomInput
            value={exerciseNotes}
            onChange={setExerciseNotes}
            placeholder='Enter notes'
            isRemoveIcon={true}
            className={`${prefs.favoriteColor}`}
          />
          <DialogActions>
            <CustomButton
              text='Cancel'
              fullWidth
              onClick={closeAlertDialog}
              className={`${prefs.favoriteColor}`}
            />
            <CustomButton
              text='Save'
              fullWidth
              onClick={() =>
                saveExerciseNotes(alertDialogOptions.exerciseId, exerciseNotes)
              }
              className={`${prefs.favoriteColor}`}
            />
          </DialogActions>
        </div>
      )
    }
  }

  return (
    <>
      <div className='workout-container'>
        <div className='workout-header-container'>
          <div
            className='workout-name-container'
            onClick={onOpenWorkoutDetails}
          >
            {sessionDay.instructions.isFinished ? (
              <CircleIcon color='success' />
            ) : (
              <CircleIcon color='error' />
            )}
            <Typography
              variant='h5'
              className='bold-header'
            >
              {getWorkoutName()}{' '}
            </Typography>
          </div>
          <div className='actions-container'>
            <CustomButton
              icon={allExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={toggleExpandAll}
              isIcon={true}
              tooltipTitle={allExpanded ? 'Collapse all' : 'Expand all'}
            />
            <CustomButton
              // text="Finish Workout"
              isIcon={true}
              icon={<CheckIcon />}
              disabled={!timer}
              size='small'
              onClick={() => {
                if (!timer) return
                removeTimer(timer._id)
              }}
              tooltipTitle='Finish Workout'
            />
            <CustomButton
              icon={<DeleteIcon />}
              onClick={() => {
                setAlertDialogOptions({
                  open: true,
                  title: 'Delete Workout',
                  component: 'delete',
                  exerciseId: '',
                })
              }}
              isIcon={true}
              tooltipTitle='Delete Workout'
            />
          </div>
        </div>
        <Typography
          variant='body1'
          className='bold-header'
        >
          {getWorkoutMuscles(sessionDay.workout).join(', ')}
        </Typography>
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        {/* <CustomButton text="Add Exercise" icon={<AddIcon />} /> */}
        <div className='exercises-container'>
          {sessionDay.instructions.exercises.map((exercise) => {
            const isOpen = openExercises.has(exercise.exerciseId)

            let workoutExercise = sessionDay.workout.exercises.find(
              (e) => e.exerciseId === exercise.exerciseId
            )

            if (!workoutExercise) {
              workoutExercise = {
                equipments: exercise.equipments || [],
                name: exercise.name || '',
                muscleGroups: exercise.muscleGroups || [],
                image: exercise.image || '',
                exerciseId: exercise.exerciseId,
              }
            }

            return (
              <ExerciseCard
                key={`${exercise.exerciseId}-${sessionDay._id}`}
                exercise={workoutExercise as Exercise}
                updateExercise={updateExercise}
                addSet={addSet}
                removeSet={removeSet}
                markSetAsDone={markSetAsDone}
                instructions={sessionDay.instructions}
                exerciseInstructions={exercise}
                onEditExerciseNotes={(exerciseId, notes) =>
                  saveExerciseNotes(exerciseId, notes)
                }
                isOpen={isOpen}
                onOpenChange={() =>
                  handleOpenChange(exercise.exerciseId, !isOpen)
                }
              />
            )
          })}
        </div>
        <div className='buttons-container'>
          <CustomButton
            text='Add Exercise'
            icon={<AddIcon />}
            fullWidth
            onClick={openExerciseDialog}
          />
          <Divider
            className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
            orientation='vertical'
            flexItem={true}
          />
          <CustomButton
            text='Finish Workout'
            icon={<CheckIcon />}
            fullWidth
            disabled={!timer}
            onClick={() => {
              if (!timer) return
              removeTimer(timer._id)
            }}
          />
        </div>
      </div>
      <SlideDialog
        open={slideDialogOptions.open}
        onClose={closeSlideDialog}
        title={slideDialogOptions.title}
        component={getSlideDialogComponent() as React.ReactElement}
        type='full'
      />
      <CustomAlertDialog
        open={alertDialogOptions.open}
        onClose={closeAlertDialog}
        title={alertDialogOptions.title}
      >
        {getAlertDialogComponent()}
      </CustomAlertDialog>
    </>
  )
}
