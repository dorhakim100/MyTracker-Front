import { useEffect, useMemo, useState } from 'react'
import { Card, Typography, Divider, DialogActions } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Exercise, Set } from '../../types/exercise/Exercise'
import { capitalizeFirstLetter, formatTime } from '../../services/util.service'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { ExerciseInstructions } from '../../types/exercise/ExerciseInstructions'
import { ExerciseEditor } from '../ExerciseEditor/ExerciseEditor'
import { CustomOptionsMenu } from '../../CustomMui/CustomOptionsMenu/CustomOptionsMenu'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { Instructions } from '../../types/instructions/Instructions'

import EditNoteIcon from '@mui/icons-material/EditNote'
import DeleteIcon from '@mui/icons-material/Delete'
import InfoOutlineIcon from '@mui/icons-material/InfoOutline'
import { DropdownOption } from '../../types/DropdownOption'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { ExerciseDetails } from '../ExerciseDetails/ExerciseDetails'
import SwitchLeftIcon from '@mui/icons-material/SwitchLeft'
import { CustomAlertDialog } from '../../CustomMui/CustomAlertDialog/CustomAlertDialog'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { instructionsService } from '../../services/instructions/instructions.service'
import { showErrorMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { setService } from '../../services/set/set.service'
import TimerIcon from '@mui/icons-material/Timer'
import { RestingTimerEdit } from '../RestingTimerEdit/RestingTimerEdit'
import { DEFAULT_RESTING_TIME } from '../../assets/config/times'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

interface SlideDialogOptions {
  title: string
  component: React.ReactNode
  type: 'resting-timer' | 'exercise-details'
  open: boolean
  height?: 'full' | 'half'
}

interface ExerciseCardProps {
  exercise: Exercise
  className?: string
  onDelete?: (exercise: Exercise) => void
  onClick?: (exercise: Exercise) => void
  showEquipment?: boolean
  exerciseInstructions?: ExerciseInstructions
  isExpected?: boolean
  onEditExerciseNotes: (exerciseId: string, notes: string) => void
  setInstructions?: (instructions: Instructions) => void
  instructions: Instructions
  onSwitchRpeRir?: (exerciseId: string, value: 'rpe' | 'rir') => void
  setIsReorderExercisesOpen?: (isOpen: boolean) => void
  updateExercise?: (
    exercise: ExerciseInstructions,
    setIndex: number,
    isNew: boolean,
    isRemove: boolean
  ) => Promise<void> | void
  isOpen?: boolean
  onOpenChange?: () => void
}

export function ExerciseCard({
  exercise,
  className = '',
  onDelete,
  onClick,
  showEquipment = false,
  instructions,
  isExpected = false,
  onEditExerciseNotes,
  setInstructions,
  exerciseInstructions,
  onSwitchRpeRir,
  setIsReorderExercisesOpen,
  updateExercise,
  isOpen = true,
  onOpenChange,
}: ExerciseCardProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const { traineeUser, user } = useSelector(
    (stateSelector: RootState) => stateSelector.userModule
  )

  const sessionDay = useSelector(
    (stateSelector: RootState) => stateSelector.workoutModule.sessionDay
  )
  const [previousInstructions, setPreviousInstructions] =
    useState<Instructions | null>(null)
  const updateExerciseInInstructions = (exercise: ExerciseInstructions) => {
    if (!setInstructions) return
    setInstructions({
      ...instructions,
      exercises: instructions.exercises.map((e) =>
        e.exerciseId === exercise.exerciseId ? exercise : e
      ),
    })
  }

  const [exerciseSets, setExerciseSets] = useState<Set[]>([])
  const [isEditNotesOpen, setIsEditNotesOpen] = useState(false)

  const [slideDialogOptions, setSlideDialogOptions] =
    useState<SlideDialogOptions>({
      title: '',
      component: null,
      type: 'exercise-details',
      open: false,
    })

  const [editNotes, setEditNotes] = useState(
    isExpected
      ? exerciseInstructions?.notes?.expected
      : exerciseInstructions?.notes?.actual
  )

  const isDone = useMemo(() => {
    if (!exerciseInstructions) return false
    return getIsExerciseDone(exerciseInstructions)
  }, [exerciseInstructions])

  const handleClick = () => {
    if (!isOpen && onOpenChange) {
      onOpenChange()
      return
    }
    if (onClick) {
      onClick(exercise)
    }
  }

  const menuOptions = [
    {
      title: 'View Details',
      icon: <InfoOutlineIcon />,
      onClick: openDetailsDialog,
    },
    isExpected && {
      title: `Toggle to ${exerciseInstructions?.sets[0]?.rpe ? 'RIR' : 'RPE'}`,
      icon: <SwitchLeftIcon />,
      onClick: () => {
        const modeToSet = exerciseInstructions?.sets[0]?.rpe ? 'rir' : 'rpe'

        if (onSwitchRpeRir) {
          onSwitchRpeRir(exercise.exerciseId, modeToSet)
        }
      },
    },
    isExpected && {
      title: 'Edit Resting Timer',
      icon: <TimerIcon />,
      onClick: () => {
        setSlideDialogOptions((prev) => {
          return {
            ...prev,
            type: 'resting-timer',
            open: true,
          }
        })
      },
    },

    !isExpected && {
      title: isDone ? 'Mark as Not Done' : 'Mark as Done',
      icon: isDone ? <RemoveCircleIcon /> : <CheckCircleIcon />,
      onClick: () => {
        onMarkAsDone(!isDone)
      },
    },
    {
      title: 'Edit Notes',
      icon: <EditNoteIcon />,
      onClick: () => {
        setIsEditNotesOpen(true)
      },
    },

    isExpected
      ? {
          title: 'Reorder Exercises',
          icon: <DragHandleIcon />,
          onClick: () => {
            if (setIsReorderExercisesOpen) {
              setIsReorderExercisesOpen(true)
            }
          },
        }
      : null,
    (isExpected && {
      title: 'Delete',
      icon: <DeleteIcon />,
      onClick: () => {
        if (onDelete) {
          onDelete(exercise)
        }
      },
    }) ||
      null,
  ].filter((option) => option) as DropdownOption[]

  function getIsExerciseDone(exerciseInstructions: ExerciseInstructions) {
    return exerciseInstructions?.sets.every((set) => set.isDone)
  }

  async function onMarkAsDone(isDoneToSet: boolean) {
    if (!exerciseInstructions) return
    if (!updateExercise || !sessionDay?._id) return
    const newExerciseInstructions: ExerciseInstructions = {
      ...exerciseInstructions,
      sets: exerciseInstructions.sets.map((set) => ({
        ...set,
        isDone: isDoneToSet,
      })),
      image: exercise.image,
    }

    try {
      await updateExercise(newExerciseInstructions, 0, false, false)
      const sets = await setService.getSetsBySessionIdAndExerciseId(
        sessionDay._id,
        exercise.exerciseId
      )

      const promises = sets.map(async (set: Set) => {
        let cleanedSet: Set = {
          ...set,
          isDone: isDoneToSet,
        }
        // Remove the unused RPE/RIR field - only keep the one that's actually used
        if (cleanedSet.rir) {
          const { rpe, ...setWithoutRpe } = cleanedSet
          cleanedSet = setWithoutRpe
        } else if (cleanedSet.rpe) {
          const { rir, ...setWithoutRir } = cleanedSet
          cleanedSet = setWithoutRir
        }

        await setService.save(cleanedSet)
      })

      await Promise.all(promises)
    } catch (err) {
      showErrorMsg(messages.error.updateSet)
    }
  }

  useEffect(() => {
    if (!isExpected) return
    getPreviousInstructions()
  }, [instructions])

  useEffect(() => {
    const getExerciseSets = async () => {
      if (!sessionDay?._id) return
      try {
        const sets = await setService.getSetsBySessionIdAndExerciseId(
          sessionDay._id,
          exercise.exerciseId
        )

        setExerciseSets(sets)
      } catch (err) {
        showErrorMsg(messages.error.getSets)
      }
    }

    getExerciseSets()
  }, [sessionDay?._id])

  function openDetailsDialog() {
    setSlideDialogOptions({
      title: capitalizeFirstLetter(exercise.name),
      component: <ExerciseDetails exercise={exercise} />,
      type: 'exercise-details',
      open: true,
    })
  }

  async function getPreviousInstructions() {
    if (!instructions || instructions.weekNumber === 1) return null
    try {
      const previousInstructions = await instructionsService.getByWorkoutId({
        workoutId: instructions.workoutId,
        forUserId: traineeUser?._id || user?._id || '',
        weekNumber: instructions.weekNumber - 1,
      })

      setPreviousInstructions(previousInstructions)
    } catch (err) {
      console.error(err)
    }
  }

  function getSlideDialogTitle() {
    switch (slideDialogOptions.type) {
      case 'exercise-details':
        return capitalizeFirstLetter(exercise.name)
      case 'resting-timer':
        return 'Edit Resting Time'
      default:
        return ''
    }
  }

  function getSlideDialogComponent() {
    switch (slideDialogOptions.type) {
      case 'exercise-details':
        return <ExerciseDetails exercise={exercise} />
      case 'resting-timer':
        return (
          <RestingTimerEdit
            restingTime={
              exerciseInstructions?.restingTime || DEFAULT_RESTING_TIME
            }
            updateRestingTime={updateRestingTime}
            onClose={() => {
              setSlideDialogOptions({
                ...slideDialogOptions,
                open: false,
              })
            }}
          />
        )
      default:
        return <></>
    }
  }

  function getSlideDialogHeight() {
    switch (slideDialogOptions.type) {
      case 'exercise-details':
        return 'full'
      case 'resting-timer':
        return 'half'
      default:
        return 'full'
    }
  }

  function updateRestingTime(restingTime: number) {
    if (!exerciseInstructions || !setInstructions) return
    setInstructions({
      ...instructions,
      exercises: instructions.exercises.map((e) =>
        e.exerciseId === exercise.exerciseId
          ? { ...e, restingTime: restingTime }
          : e
      ),
    })
  }

  if (!exerciseInstructions || !exercise) return null

  return (
    <>
      <Card
        className={`exercise-card-container ${className} ${
          prefs.isDarkMode ? 'dark-mode' : ''
        } ${prefs.favoriteColor} ${isDone ? 'done' : ''} ${
          isOpen ? 'open' : 'closed'
        }`}
        onClick={handleClick}
      >
        <div
          className="exercise-card-content"
          onClick={() => {
            if (!isOpen && onOpenChange) {
              onOpenChange()
              return
            }
            openDetailsDialog()
          }}
        >
          {exercise.image && (
            <img
              src={exercise.image}
              alt={exercise.name}
              className="exercise-card-image"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          )}

          <div className="exercise-card-actions">
            <CustomOptionsMenu
              className="more-options-container"
              options={menuOptions}
              triggerElement={
                <CustomButton
                  isIcon={true}
                  icon={<MoreHorizIcon />}
                  className={`more-options ${prefs.favoriteColor} ${
                    prefs.isDarkMode ? 'dark-mode' : ''
                  }`}
                />
              }
            />

            {onOpenChange && (
              <CustomButton
                icon={isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenChange?.()
                }}
                isIcon={true}
              />
            )}
          </div>

          <div className="exercise-card-info">
            <Typography variant="h6" className="exercise-card-name">
              {capitalizeFirstLetter(exercise.name)}
            </Typography>
            {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
              <Typography
                variant="body2"
                className="exercise-card-muscle-groups"
              >
                {exercise.muscleGroups
                  .map((muscleGroup) => capitalizeFirstLetter(muscleGroup))
                  .join(', ')}
              </Typography>
            )}
            {/* if expected is false and expected notes are empty, don't show expected notes */}
            {!isExpected && !exerciseInstructions?.notes?.expected ? null : (
              <Typography variant="body2" className="exercise-card-notes">
                {`Expected Notes: ${
                  exerciseInstructions?.notes?.expected || ''
                }`}
              </Typography>
            )}
            {/* if there are actual notes, show them */}
            {!exerciseInstructions?.notes?.actual ? null : (
              <Typography variant="body2" className="exercise-card-notes">
                {`Actual Notes: ${exerciseInstructions?.notes?.actual || ''}`}
              </Typography>
            )}
            {showEquipment &&
              exercise.equipment &&
              exercise.equipment.length > 0 && (
                <>
                  <Typography
                    variant="body2"
                    className="exercise-card-equipment"
                  >
                    {exercise.equipment
                      .map((eq) => capitalizeFirstLetter(eq))
                      .join(', ')}
                  </Typography>
                </>
              )}
            {isExpected && (
              <>
                <Divider
                  className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
                />
                <span>
                  Resting time:{' '}
                  {formatTime(
                    exerciseInstructions.restingTime || DEFAULT_RESTING_TIME
                  )}
                </span>
              </>
            )}
          </div>
        </div>
        {exerciseInstructions && exerciseInstructions.sets && (
          <ExerciseEditor
            exerciseSets={exerciseSets}
            previousInstructions={previousInstructions}
            exercise={exerciseInstructions}
            isOpen={isOpen}
            updateExercise={
              isExpected
                ? updateExerciseInInstructions
                : (exerciseToUpdate, setIndex, isNew, isRemove) =>
                    updateExercise?.(
                      { ...exerciseToUpdate, image: exercise.image },
                      setIndex || 0,
                      isNew || false,
                      isRemove || false
                    )
            }
            isExpected={isExpected}
          />
        )}
      </Card>
      <SlideDialog
        open={slideDialogOptions.open}
        onClose={() =>
          setSlideDialogOptions({
            ...slideDialogOptions,
            open: false,
            component: null,
            type: 'exercise-details',
            title: '',
          })
        }
        title={getSlideDialogTitle()}
        component={getSlideDialogComponent()}
        type={getSlideDialogHeight()}
      />
      <CustomAlertDialog
        open={isEditNotesOpen}
        onClose={() => setIsEditNotesOpen(false)}
        title={capitalizeFirstLetter(exercise.name)}
      >
        <Typography variant="h6">Add Notes</Typography>

        <CustomInput
          value={editNotes || ''}
          onChange={setEditNotes}
          placeholder={`${capitalizeFirstLetter(exercise.name)} notes`}
          isRemoveIcon={true}
          className={`${prefs.favoriteColor}`}
        />
        <DialogActions>
          <CustomButton
            text="Cancel"
            fullWidth
            onClick={() => setIsEditNotesOpen(false)}
            className={`${prefs.favoriteColor}`}
          />
          <CustomButton
            text="Save"
            fullWidth
            onClick={() => {
              onEditExerciseNotes(exercise.exerciseId, editNotes || '')
              setIsEditNotesOpen(false)
              setEditNotes('')
            }}
            className={`${prefs.favoriteColor}`}
          />
        </DialogActions>
      </CustomAlertDialog>
    </>
  )
}
