import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { debounce, DialogActions, Divider, Typography } from '@mui/material'

import { SessionDay } from '../../types/workout/SessionDay'
import { Exercise } from '../../types/exercise/Exercise'
import { capitalizeFirstLetter } from '../../services/util.service'
import {
  removeSessionDay,
  removeCurrentExercise,
  setCurrentExercise,
  setSelectedSessionDay,
  removeTimer,
  setTimer,
  saveWorkout,
} from '../../store/actions/workout.action'

import { ExerciseEditor } from '../../components/ExerciseEditor/ExerciseEditor'

import { CustomAccordion } from '../../CustomMui/CustomAccordion/CustomAccordion'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

import InfoOutlineIcon from '@mui/icons-material/InfoOutline'
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
import NoteAddIcon from '@mui/icons-material/NoteAdd'
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
import { imageService } from '../../services/image/image.service'
import { DEFAULT_RESTING_TIME } from '../../assets/config/times'
interface WorkoutSessionProps {
  sessionDay: SessionDay
  onExerciseInfoClick: (exercise: Exercise) => void
  updateSessionDay: () => void
}

export function WorkoutSession({
  sessionDay,
  onExerciseInfoClick,
  updateSessionDay,
}: WorkoutSessionProps) {
  if (!sessionDay.instructions) return null

  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(
    new Set()
  )

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

  const [exerciseNotes, setExerciseNotes] = useState<string>('')

  const [exerciseDialogOptions, setExerciseDialogOptions] = useState<{
    open: boolean
    title: string
    component: React.ReactNode
  }>({
    open: false,
    title: '',
    component: null,
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
      const results = await exerciseSearch(exerciseFilter.searchValue)
      setExerciseResults(results)
    } catch (err) {
      showErrorMsg(messages.error.search)
      setExerciseResults([])
    } finally {
      setIsLoading(false)
    }
  }, [exerciseFilter])

  const latestHandleSearchRef = useRef(handleSearch)
  const debouncedRunSearch = useRef(
    debounce(() => latestHandleSearchRef.current(), 300)
  ).current

  useEffect(() => {
    latestHandleSearchRef.current = handleSearch
  }, [handleSearch])

  useEffect(() => {
    debouncedRunSearch()
  }, [exerciseFilter, debouncedRunSearch])

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

      const [savedInstructions, savedWorkout, savedSet] = await Promise.all(
        promises
      )

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

  const resultsMsg = 'No exercises found'

  const handleAccordionChange = useCallback(
    (exerciseId: string) =>
      (_event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedExercises((prev) => {
          const newSet = new Set(prev)
          if (isExpanded) {
            newSet.add(exerciseId)
          } else {
            newSet.delete(exerciseId)
          }
          return newSet
        })
      },
    []
  )

  // const toggleExpandAll = () => {
  //   if (!sessionDay?.workout?.exercises) return
  //   const allExerciseIds = sessionDay.workout.exercises.map(
  //     (ex) => ex.exerciseId
  //   )
  //   const allExpanded = allExerciseIds.every((id) => expandedExercises.has(id))

  //   if (allExpanded) {
  //     setExpandedExercises(new Set())
  //   } else {
  //     setExpandedExercises(new Set(allExerciseIds))
  //   }
  // }

  const getWorkoutName = () => {
    const workoutId = sessionDay.instructions.workoutId

    const workout =
      workouts.find((w) => w._id === workoutId) || sessionDay.workout
    return workout?.name
  }

  const updateExercise = async (
    exercise: ExerciseInstructions,
    setIndex: number,
    isNew: boolean,
    isRemove: boolean
  ) => {
    if (!sessionDay._id) return showErrorMsg(messages.error.updateSet)

    const originalInstructions = sessionDay.instructions
    const newInstructions = {
      ...sessionDay.instructions,
      exercises: sessionDay.instructions.exercises.map((e) =>
        e.exerciseId === exercise.exerciseId ? exercise : e
      ),
    }
    const exerciseIndex = newInstructions.exercises.findIndex(
      (e) => e.exerciseId === exercise.exerciseId
    )

    if (getIsStringifySame(originalInstructions, newInstructions)) return
    setSelectedSessionDay({
      ...sessionDay,
      instructions: { ...newInstructions },
    })
    try {
      const savedInstructions = await saveNewInstructions(newInstructions)
      if (savedInstructions) {
        setSelectedSessionDay({
          ...sessionDay,
          instructions: savedInstructions,
        })
      }
      if (exerciseIndex !== -1 && !isRemove) {
        let setToSave = { ...exercise.sets[setIndex] }
        // Remove the unused RPE/RIR field - only keep the one that's actually used
        if (setToSave.rir) {
          const { rpe, ...setWithoutRpe } = setToSave
          setToSave = setWithoutRpe
        } else if (setToSave.rpe) {
          const { rir, ...setWithoutRir } = setToSave
          setToSave = setWithoutRir
        }

        let currentExerciseToSet = { ...exercise, setIndex }

        const isExerciseDone = (exerciseToCheck: ExerciseInstructions) => {
          return exerciseToCheck.sets.every((set) => set.isDone)
        }

        if (isExerciseDone(exercise)) {
          const nextExercise = sessionDay.instructions.exercises.find(
            (e, index) => !isExerciseDone(e) && index > exerciseIndex
          )

          const imageToSet = nextExercise?.image
            ? nextExercise.image
            : sessionDay.workout.exercises.find(
                (e) => e.exerciseId === nextExercise?.exerciseId
              )?.image

          nextExercise
            ? (currentExerciseToSet = {
                ...nextExercise,
                setIndex: 0,
                image: imageToSet,
              })
            : null
        }

        const isAllExercisesDone = sessionDay.instructions.exercises.every(
          (e) =>
            e.exerciseId === exercise.exerciseId
              ? isExerciseDone(exercise)
              : isExerciseDone(e)
        )
        if (isAllExercisesDone) {
          setSelectedSessionDay({
            ...sessionDay,
            instructions: { ...savedInstructions, isFinished: true },
          })
          removeCurrentExercise()
          await removeTimer(timer?._id)
        } else {
          setCurrentExercise(currentExerciseToSet)

          await setTimer({
            currentExercise: currentExerciseToSet,
            startTime: new Date().getTime(),
          })
        }

        await setService.saveSetBySessionIdAndExerciseId(
          sessionDay._id,
          exercise.exerciseId,
          {
            ...setToSave,
            userId: sessionDay.workout.forUserId || '',
          },
          setIndex,
          isNew
        )
      } else if (exerciseIndex !== -1 && isRemove) {
        await setService.removeSetBySessionIdAndExerciseId(
          sessionDay._id,
          exercise.exerciseId,
          setIndex
        )
      }
    } catch (err) {
      setSelectedSessionDay({
        ...sessionDay,
        instructions: originalInstructions,
      })
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

  function closeExerciseDialog() {
    setExerciseDialogOptions({
      open: false,
      title: '',
      component: null,
    })
    setExerciseFilter({
      searchValue: '',
      muscleGroupValue: 'All',
      equipmentValue: 'All',
    })
  }

  function openExerciseDialog() {
    setExerciseDialogOptions({
      open: true,
      title: 'Add Exercise',
      component: null,
    })
  }

  const getAlertDialogComponent = () => {
    if (alertDialogOptions.component === 'delete')
      return (
        <div className="modal-delete-workout-container">
          <Typography variant="h6">
            Are you sure you want to delete this workout?
          </Typography>
          <DialogActions>
            <CustomButton
              text="Cancel"
              fullWidth
              onClick={closeAlertDialog}
              className={`${prefs.favoriteColor}`}
            />
            <CustomButton
              text="Delete"
              fullWidth
              onClick={deleteSession}
              className={`${prefs.favoriteColor} delete-account-button`}
            />
          </DialogActions>
        </div>
      )

    if (alertDialogOptions.component === 'note') {
      return (
        <div className="notes-edit-container">
          <CustomInput
            value={exerciseNotes}
            onChange={setExerciseNotes}
            placeholder="Enter notes"
            isRemoveIcon={true}
            className={`${prefs.favoriteColor}`}
          />
          <DialogActions>
            <CustomButton
              text="Cancel"
              fullWidth
              onClick={closeAlertDialog}
              className={`${prefs.favoriteColor}`}
            />
            <CustomButton
              text="Save"
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

  // const allExerciseIds = sessionDay.instructions.exercises.map(
  //   (ex) => ex.exerciseId
  // )
  // const allExpanded =
  //   allExerciseIds.length > 0 &&
  //   allExerciseIds.every((id) => expandedExercises.has(id))

  return (
    <>
      <div className="workout-container">
        <div className="workout-header-container">
          <div className="workout-name-container">
            {sessionDay.instructions.isFinished ? (
              <CircleIcon color="success" />
            ) : (
              <CircleIcon color="error" />
            )}
            <Typography variant="h5" className="bold-header">
              {getWorkoutName()}{' '}
            </Typography>
          </div>
          <div className="actions-container">
            <CustomButton
              // text="Finish Workout"
              isIcon={true}
              icon={<CheckIcon />}
              disabled={!timer}
              size="small"
              onClick={() => {
                if (!timer) return
                removeTimer(timer._id)
              }}
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
            />
            {/* <CustomButton
              icon={allExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={toggleExpandAll}
              /> */}
          </div>
        </div>
        <Typography variant="body1" className="bold-header">
          {getWorkoutMuscles(sessionDay.workout).join(', ')}
        </Typography>
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        {/* <CustomButton text="Add Exercise" icon={<AddIcon />} /> */}
        <div className="exercises-container">
          {sessionDay.instructions.exercises.map((exercise) => {
            const isExpanded = expandedExercises.has(exercise.exerciseId)

            const workoutExercise = sessionDay.workout.exercises.find(
              (e) => e.exerciseId === exercise.exerciseId
            )

            return (
              <ExerciseCard
                key={`${exercise.exerciseId}-${sessionDay._id}`}
                exercise={workoutExercise as Exercise}
                updateExercise={(exercise, setIndex, isNewSet, isRemove) =>
                  updateExercise(
                    exercise,
                    setIndex || 0,
                    isNewSet || false,
                    isRemove || false
                  )
                }
                instructions={sessionDay.instructions}
                exerciseInstructions={exercise}
                onEditExerciseNotes={(exerciseId, notes) =>
                  saveExerciseNotes(exerciseId, notes)
                }
              />
            )

            return (
              <CustomAccordion
                key={`${exercise.exerciseId}-${sessionDay._id}`}
                title={capitalizeFirstLetter(exercise.name || '')}
                cmp={
                  <ExerciseEditor
                    exercise={exercise}
                    updateExercise={(exercise, setIndex, isNewSet, isRemove) =>
                      updateExercise(
                        exercise,
                        setIndex || 0,
                        isNewSet || false,
                        isRemove || false
                      )
                    }
                  />
                }
                expanded={isExpanded}
                onChange={handleAccordionChange(exercise.exerciseId)}
                icon={
                  <div className="exercise-info-container">
                    <InfoOutlineIcon
                      onClick={(ev) => {
                        ev.stopPropagation()
                        onExerciseInfoClick(exercise as Exercise)
                      }}
                    />
                    <NoteAddIcon
                      onClick={(ev) => {
                        ev.stopPropagation()
                        setAlertDialogOptions({
                          open: true,
                          title: `${capitalizeFirstLetter(
                            exercise.name || ''
                          )} Notes`,
                          component: 'note',
                          exerciseId: exercise.exerciseId,
                        })
                        setExerciseNotes(exercise.notes?.actual || '')
                      }}
                    />
                  </div>
                }
              />
            )
          })}
        </div>
        <div className="buttons-container">
          <CustomButton
            text="Add Exercise"
            icon={<AddIcon />}
            fullWidth
            onClick={openExerciseDialog}
          />
          <Divider
            className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
            orientation="vertical"
            flexItem={true}
          />
          <CustomButton
            text="Finish Workout"
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
        open={exerciseDialogOptions.open}
        onClose={closeExerciseDialog}
        title={exerciseDialogOptions.title}
        component={
          <ExercisesStage
            workout={sessionDay.workout}
            exerciseFilter={exerciseFilter}
            exerciseResults={filteredExerciseResults}
            onExerciseFilterChange={onExerciseFilterChange}
            onAddExercise={onAddExercise}
            onDeleteExercise={onDeleteExercise}
            onReorderExercises={onReorderExercises}
            renderErrorImage={(exercise) =>
              imageService.renderErrorExerciseImage(
                exercise,
                filteredExerciseResults,

                setExerciseResults
              )
            }
            resultsMsg={resultsMsg}
          />
        }
        type="full"
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
