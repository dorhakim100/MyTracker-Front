import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Badge, Checkbox, Divider, Tooltip, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

import { RootState } from '../../store/store'
import { Set } from '../../types/exercise/Exercise'
import { ExerciseInstructions } from '../../types/exercise/ExerciseInstructions'
import { instructionsService } from '../../services/instructions/instructions.service'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { PickerSelect } from '../Pickers/PickerSelect'
import { ClockPicker } from '../Pickers/ClockPicker'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { DeleteAction } from '../DeleteAction/DeleteAction'
import { SwipeableWrapper } from '../SwipeableWrapper/SwipeableWrapper'
import { ExpectedActual } from '../../types/expectedActual/ExpectedActual'
import {
  pickerButtonsValues,
  pickerMinMaxValues,
} from '../../assets/config/exercise-editor-pickers'

import CheckIcon from '@mui/icons-material/Check'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { CustomSwipeAction } from '../CustomSwipeAction/CustomSwipeAction'

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import { Instructions } from '../../types/instructions/Instructions'
import { setSelectedSessionDay } from '../../store/actions/workout.action'
import { useWindowDimentions } from '../../hooks/useWindowDimentions'
import DeleteIcon from '@mui/icons-material/Delete'

export interface ExerciseEditorProps {
  exercise: ExerciseInstructions
  exerciseSets?: Set[]
  previousInstructions?: Instructions | null
  isExpected?: boolean
  updateExercise: (exercise: ExerciseInstructions) => Promise<void> | void
  addSet?: (
    exercise: ExerciseInstructions,
    setIndex: number
  ) => Promise<void> | void
  removeSet?: (
    exercise: ExerciseInstructions,
    setIndex: number
  ) => Promise<void> | void
  markSetAsDone?: (
    exercise: ExerciseInstructions,
    setIndex: number
  ) => Promise<void> | void
  isOpen?: boolean
}

interface EditSet extends Set {
  index: number
}

type PickerType = 'reps' | 'weight' | 'rpe' | 'rir' | null

interface PickerOption {
  isOpen: boolean
  type: PickerType
}

export function ExerciseEditor({
  exercise,
  exerciseSets,
  previousInstructions,
  isExpected,
  updateExercise,
  addSet,
  removeSet,
  markSetAsDone,
  isOpen = true,
}: ExerciseEditorProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [pickerOptions, setPickerOptions] = useState<PickerOption>({
    isOpen: false,
    type: null,
  })

  const [editSet, setEditSet] = useState<EditSet | null>(null)
  const [currentPickerValue, setCurrentPickerValue] = useState<number>(0)

  const sessionDay = useSelector(
    (stateSelector: RootState) => stateSelector.workoutModule.sessionDay
  )
  const { width: windowWidth } = useWindowDimentions()
  const isDashboard = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isDashboard
  )
  const onAddSet = async () => {
    const existingSet =
      exercise.sets[exercise.sets.length - 1] ||
      instructionsService.getEmptySet()

    const newSet = {
      ...existingSet,
      setIndex: exercise.sets.length,
    }

    const newSets = [...exercise.sets, newSet]
    const updatedExercise = {
      ...exercise,
      sets: newSets,
      image: exercise.image,
    }

    try {
      if (isExpected) {
        await updateExercise(updatedExercise)
      } else if (addSet) {
        await addSet(updatedExercise, newSets.length - 1)
      }
      showSuccessMsg(messages.success.addSet)
    } catch (err) {
      showErrorMsg(messages.error.addSet)
    }
  }

  const onDeleteSet = async (indexToRemove: number) => {
    if (indexToRemove === 0 && exercise.sets.length === 1) {
      showErrorMsg(messages.error.deleteSet)
      return
    }
    const newSets = exercise.sets.filter((_, index) => index !== indexToRemove)
    const updatedExercise = { ...exercise, sets: newSets }

    try {
      if (isExpected) {
        await updateExercise(updatedExercise)
      } else if (removeSet) {
        await removeSet(updatedExercise, indexToRemove)
      }
    } catch (err) {
      showErrorMsg(messages.error.deleteSet)
    }
  }

  const onClosePicker = () => {
    setPickerOptions({
      isOpen: false,
      type: null,
    })
  }

  const onPickerChange = (value: number) => {
    if (!editSet) return

    let newSet = { ...editSet }

    if (pickerOptions.type === 'rir') {
      value = Math.floor(value)
    }

    const type = pickerOptions.type as keyof Set
    if (isExpected) {
      newSet = {
        ...newSet,
        [type]: {
          expected: value,
          actual: value,
        },
      }
    } else {
      newSet = {
        ...newSet,
        [type]: {
          expected: (newSet[type] as ExpectedActual<number>)?.expected || value,
          actual: value,
        },
      }
    }
    setEditSet(newSet)
  }

  useEffect(() => {
    const newExercise = { ...exercise }
    if (!newExercise || !editSet) return
    newExercise.sets = newExercise.sets.map((set, index) => {
      if (editSet.index === index) return editSet
      if (editSet.index < index && isExpected) return editSet
      return set
    })
    updateExercise(newExercise)
  }, [editSet])

  useEffect(() => {
    if (!exerciseSets || !sessionDay || !sessionDay.instructions) return

    const newSets = exercise.sets.map((setToUpdate, index) => {
      const setToSet = exerciseSets.find(
        (set) =>
          set.exerciseId === exercise.exerciseId && set.setNumber === index + 1
      )

      let cleanedSet = {
        ...setToUpdate,
        isDone: setToSet?.isDone || false,
      }

      // Remove the unused RPE/RIR field - only keep the one that's actually used
      if (cleanedSet.rir) {
        const { rpe, ...setWithoutRpe } = cleanedSet
        cleanedSet = setWithoutRpe
      } else if (cleanedSet.rpe) {
        const { rir, ...setWithoutRir } = cleanedSet
        cleanedSet = setWithoutRir
      }

      return cleanedSet
    })

    setSelectedSessionDay({
      ...sessionDay,
      instructions: {
        ...sessionDay.instructions,
        exercises: sessionDay.instructions.exercises.map(
          (ex: ExerciseInstructions) =>
            ex.exerciseId === exercise.exerciseId
              ? { ...ex, sets: newSets }
              : ex
        ),
      },
    })
  }, [exerciseSets, exercise.exerciseId])

  const getIsAfterValue = (type: PickerType): boolean => {
    return type === 'rpe' || type === 'weight'
  }

  const onMarkAsDone = async (index: number) => {
    const newSets = [...exercise.sets]
    const stateToSet = !newSets[index].isDone

    const setToSave = {
      ...newSets[index],
      isDone: stateToSet,
    }

    let newSetsToSave = [...newSets]

    // if isDone true, set all previous sets to true
    if (stateToSet) {
      newSetsToSave = newSetsToSave.map((set, i) => {
        if (i === index) return setToSave
        // if (i < index) return { ...set, isDone: stateToSet }
        return set
      })

      // if isDone false, set all next sets to false
    } else {
      newSetsToSave = newSetsToSave.map((set, i) => {
        if (i === index) return setToSave
        // if (i > index) return { ...set, isDone: stateToSet }
        return set
      })
    }

    try {
      const updatedExercise = { ...exercise, sets: newSetsToSave }
      if (isExpected) {
        await updateExercise(updatedExercise)
      } else if (markSetAsDone) {
        await markSetAsDone(updatedExercise, index)
      }
    } catch (err) {
      showErrorMsg(messages.error.updateSet)
    }
  }

  return (
    <>
      <div
        className={`exercise-editor-container ${isOpen ? 'open' : 'closed'}`}
      >
        {exercise.sets && exercise.sets.length > 0 && (
          <SwipeableWrapper
            disableSwipe={isDashboard}
            items={exercise.sets.map((set, index) => ({
              id: `${exercise.exerciseId}-set-${index}`,
              content: (
                <div className={`set-container ${isDashboard ? 'dashboard' : ''}`}>
                  <div
                    className={`set-editor-container ${previousInstructions ? 'with-previous-set' : ''
                      } ${isDashboard ? 'dashboard' : ''}`}
                  >
                    <Badge
                      badgeContent={index + 1}
                      color="primary"
                      className={`${prefs.favoriteColor} float ${isDashboard ? 'dashboard' : ''}`}
                    />
                    <div className="badges-container">
                      {(previousInstructions || !isExpected) && (
                        <Tooltip
                          title={set.isDone ? 'Mark as not done' : 'Mark as done'}
                          disableHoverListener={!isDashboard}
                        >

                          <Checkbox
                            disabled={isExpected}
                            icon={
                              <RadioButtonUncheckedIcon
                                className="not-finished"
                                sx={{ color: 'white' }}
                              />
                            }
                            checkedIcon={
                              <CheckIcon
                                className="finished"
                                sx={{ color: 'white' }}
                              />
                            }
                            checked={set.isDone ? true : false}
                            onChange={() => onMarkAsDone(index)}
                          />
                        </Tooltip>
                      )}
                    </div>
                    {previousInstructions && (
                      <span className={`previous-set-label ${isDashboard ? 'dashboard' : ''}`}>
                        Previous week expected:
                      </span>
                    )}
                    <div className="reps-container">
                      {previousInstructions && (
                        <>
                          <span>
                            {previousInstructions?.exercises.find(
                              (e) => e.exerciseId === exercise.exerciseId
                            )?.sets[index]?.reps?.expected || 'N/A'}{' '}
                            reps
                          </span>
                          <Divider
                            orientation="horizontal"
                            className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''
                              }`}
                          />
                          {previousInstructions && (
                            <Typography
                              variant="body1"
                              className="previous-set-actual-label bold-header"
                            >
                              Actual:
                            </Typography>
                          )}
                        </>
                      )}
                      <PickerSelect
                        className={`${prefs.favoriteColor}`}
                        openClock={() => {
                          setPickerOptions({
                            type: 'reps',
                            isOpen: true,
                          })
                          setEditSet({ ...set, index })
                          setCurrentPickerValue(set.reps.actual || 0)
                        }}
                        option={{
                          label: 'Reps',
                          key: 'reps',
                          type: 'number',
                        }}
                        value={set.reps.actual}
                        minWidth={windowWidth > 1050 ? windowWidth / 12 : 80}

                      // isAutoWidth={true}
                      />
                    </div>
                    <div className="weight-container">
                      {previousInstructions && (
                        <>
                          <span>
                            {previousInstructions?.exercises.find(
                              (e) => e.exerciseId === exercise.exerciseId
                            )?.sets[index]?.weight?.expected || 'N/A'}{' '}
                            kg
                          </span>
                          <Divider
                            orientation="horizontal"
                            className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''
                              }`}
                          />
                          {previousInstructions && (
                            <span className="previous-set-actual-label"></span>
                          )}
                        </>
                      )}
                      <PickerSelect
                        className={`${prefs.favoriteColor}`}
                        openClock={() => {
                          setPickerOptions({
                            type: 'weight',
                            isOpen: true,
                          })
                          setEditSet({ ...set, index })
                          setCurrentPickerValue(set.weight.actual || 0)
                        }}
                        option={{
                          label: 'Weight',
                          key: 'weight',
                          type: 'number',
                        }}
                        value={set.weight.actual}
                        minWidth={windowWidth > 1050 ? windowWidth / 10 : 100}
                        afterString="kg"
                      // isAutoWidth={true}
                      />
                    </div>
                    <div className="rpe-rir-container">
                      {previousInstructions && (
                        <>
                          {' '}
                          <span>
                            {previousInstructions?.exercises.find(
                              (e) => e.exerciseId === exercise.exerciseId
                            )?.sets[index]?.rpe?.expected
                              ? previousInstructions?.exercises.find(
                                (e) => e.exerciseId === exercise.exerciseId
                              )?.sets[index]?.rpe?.expected
                              : previousInstructions?.exercises.find(
                                (e) => e.exerciseId === exercise.exerciseId
                              )?.sets[index]?.rir?.expected}{' '}
                            {previousInstructions?.exercises.find(
                              (e) => e.exerciseId === exercise.exerciseId
                            )?.sets[0].rpe?.expected
                              ? 'RPE'
                              : 'RIR'}
                          </span>
                          <Divider
                            orientation="horizontal"
                            className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''
                              }`}
                          />
                          {previousInstructions && (
                            <span className="previous-set-actual-label"></span>
                          )}
                        </>
                      )}

                      <PickerSelect
                        className={`${prefs.favoriteColor}`}
                        openClock={() => {
                          setPickerOptions({
                            type: set.rpe ? 'rpe' : 'rir',
                            isOpen: true,
                          })
                          setEditSet({ ...set, index })

                          setCurrentPickerValue(
                            set.rpe ? set.rpe.actual : set.rir?.actual ?? 2
                          )
                        }}
                        option={{
                          label: set.rpe ? 'RPE' : 'RIR',
                          key: set.rpe ? 'rpe' : 'rir',
                          type: 'number',
                        }}
                        value={set.rpe ? set.rpe.actual : set.rir?.actual ?? 2}
                        minWidth={windowWidth > 1050 ? windowWidth / 14 : 70}
                      // isAutoWidth={true}
                      />
                    </div>
                    {isDashboard && isExpected && <CustomButton
                      className="delete-set-button red"
                      text="Delete Set"
                      onClick={() => onDeleteSet(index)}
                      icon={<DeleteIcon />}
                    />}
                  </div>{' '}
                  {/* <Divider
                    className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
                  /> */}
                </div>
              ),
              renderRightSwipeActions: isExpected
                ? () => (
                  <DeleteAction
                    item={set}
                    onDeleteItem={() => onDeleteSet(index)}
                    destructive={
                      index === 0 && exercise.sets.length === 1 ? false : true
                    }
                  />
                )
                : undefined,
              renderLeftSwipeActions: !isExpected
                ? () => (
                  <CustomSwipeAction
                    item={set}
                    onAction={() => onMarkAsDone(index)}
                    destructive={false}
                    icon={
                      set.isDone ? (
                        <RemoveCircleOutlineIcon />
                      ) : (
                        <CheckCircleOutlineIcon />
                      )
                    }
                    text={set.isDone ? 'Not done' : 'Done'}
                    className={set.isDone ? 'red' : 'green'}
                  />
                )
                : undefined,
            }))}
            listKey={`${exercise.exerciseId}-list-${exercise.sets.length}`}
            threshold={0.15}
          />
        )}
        {!isDashboard && <div className="controls-container">
          <CustomButton
            icon={<AddIcon />}
            text="Add Set"
            onClick={onAddSet}
            fullWidth
          />
        </div>}
      </div>
      <SlideDialog
        open={pickerOptions.isOpen}
        onClose={onClosePicker}
        component={
          <ClockPicker
            value={currentPickerValue}
            onChange={(_, value) => onPickerChange(value)}
            isAfterValue={getIsAfterValue(pickerOptions.type)}
            buttonsValues={
              pickerButtonsValues[
              pickerOptions.type as keyof typeof pickerButtonsValues
              ]
            }
            minValue={
              pickerMinMaxValues[
                pickerOptions.type as keyof typeof pickerMinMaxValues
              ].min
            }
            maxValue={
              pickerMinMaxValues[
                pickerOptions.type as keyof typeof pickerMinMaxValues
              ].max
            }
            onClose={onClosePicker}
          />
        }
      />
    </>
  )
}
