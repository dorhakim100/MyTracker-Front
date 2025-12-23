import { useCallback, useState } from 'react'
import { DialogActions, Divider, Typography } from '@mui/material'

import { SessionDay } from '../../types/workout/SessionDay'
import { Exercise } from '../../types/exercise/Exercise'
import { capitalizeFirstLetter } from '../../services/util.service'
import {
  removeSessionDay,
  removeCurrentExercise,
  setCurrentExercise,
  setSelectedSessionDay,
  removeTimer,
  markAsDoneSession,
} from '../../store/actions/workout.action'

import { ExerciseEditor } from '../../components/ExerciseEditor/ExerciseEditor'

import { CustomAccordion } from '../../CustomMui/CustomAccordion/CustomAccordion'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

import InfoOutlineIcon from '@mui/icons-material/InfoOutline'
// import ExpandLessIcon from '@mui/icons-material/ExpandLess'
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { ExerciseInstructions } from '../../types/exercise/ExerciseInstructions'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
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
import { getWorkoutMuscles } from '../../services/exersice-search/exersice-search'
import CircleIcon from '@mui/icons-material/Circle'
import DoneAllIcon from '@mui/icons-material/DoneAll'
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

    const workout = workouts.find((w) => w._id === workoutId)
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
          nextExercise
            ? (currentExerciseToSet = { ...nextExercise, setIndex: 0 })
            : null
        }

        const isAllExercisesDone = sessionDay.instructions.exercises.every(
          (e) =>
            e.exerciseId === exercise.exerciseId
              ? isExerciseDone(exercise)
              : isExerciseDone(e)
        )
        if (isAllExercisesDone) {
          await markAsDoneSession()
        } else {
          setCurrentExercise(currentExerciseToSet)
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
              disabled={sessionDay.instructions.isFinished}
            />
          </DialogActions>
        </div>
      )
    }

    if (alertDialogOptions.component === 'mark-as-done') {
      return (
        <div className="modal-mark-as-done-container">
          <Typography variant="h6">
            Are you sure you want to mark this workout as done?
          </Typography>
          <DialogActions>
            <CustomButton
              text="Cancel"
              fullWidth
              onClick={closeAlertDialog}
              className={`${prefs.favoriteColor}`}
            />
            <CustomButton
              text="Mark as Done"
              fullWidth
              onClick={async () => {
                try {
                  setIsLoading(true)
                  await markAsDoneSession(true)
                  closeAlertDialog()
                  showSuccessMsg(messages.success.markAsDone)
                } catch (error) {
                  showErrorMsg(messages.error.updateSet)
                } finally {
                  setIsLoading(false)
                }
              }}
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
            <CustomButton
              icon={<DoneAllIcon />}
              onClick={() => {
                setAlertDialogOptions({
                  open: true,
                  title: 'Mark as Done',
                  component: 'mark-as-done',
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
      </div>
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
