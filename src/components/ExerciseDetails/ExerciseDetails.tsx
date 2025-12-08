import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getExerciseSummary } from '../../services/exersice-search/exersice-search'
import { Exercise } from '../../types/exercise/Exercise'
import { showErrorMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { Badge, Divider, Typography } from '@mui/material'
import { RootState } from '../../store/store'
import { translateService } from '../../services/translate/translate.service'
import { ExpectedActual } from '../../types/expectedActual/ExpectedActual'
import { exerciseImage as exerciseImageObject } from '../../assets/config/exercise-image'
import { CustomAccordion } from '../../CustomMui/CustomAccordion/CustomAccordion'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import TimelineIcon from '@mui/icons-material/Timeline'
import { setService } from '../../services/set/set.service'
import { Set } from '../../types/exercise/Exercise'
import { getDateFromISO } from '../../services/util.service'
import SetsTable from '../SetsTable/SetsTable'
export interface ExerciseWithDetails extends Exercise {
  notes?: ExpectedActual<string>
  rpe?: ExpectedActual<number>
  rir?: ExpectedActual<number>
  instructions?: string[]
  sets?: ExpectedActual<number>
}
interface ExerciseDetailsProps {
  exercise: ExerciseWithDetails | null
}

export function ExerciseDetails({ exercise }: ExerciseDetailsProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )
  const traineeUser = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.traineeUser
  )

  const [exerciseInstructions, setExerciseInstructions] = useState<
    string[] | null
  >(null)

  const [exerciseImage, setExerciseImage] = useState<string>(
    exercise?.image || ''
  )

  const [exerciseSets, setExerciseSets] = useState<Set[]>([])
  const [groupedSets, setGroupedSets] = useState<Record<string, Set[]>>({})

  useEffect(() => {
    const getExerciseSets = async () => {
      if (!exercise?.exerciseId || (!traineeUser?._id && !user?._id)) return
      const sets = await setService.query({
        exerciseId: exercise?.exerciseId,
        userId: traineeUser?._id || user?._id,
      })
      setExerciseSets(sets as Set[])
      const groupedSetsToSet = groupSetsByDate(sets as Set[])
      setGroupedSets(groupedSetsToSet)
      console.log('groupedSets', groupedSetsToSet)
    }
    getExerciseSets()
  }, [exercise, traineeUser?._id, user?._id])

  useEffect(() => {
    const getWorkoutInstructions = async () => {
      try {
        if (exercise?.instructions) {
          setExerciseInstructions(exercise.instructions)
          return
        }
        const exerciseId = exercise?.exerciseId
        if (!exerciseId) return

        const instructions = await getExerciseSummary(exerciseId)
        setExerciseInstructions(instructions)
      } catch (err) {
        console.error(err)
        showErrorMsg(messages.error.getExerciseSummary)
      }
    }

    getWorkoutInstructions()
  }, [exercise])

  const renderExerciseInstructions = (instruction: string) => {
    const cleaned = instruction.replace(/^Step:\d+\s*/, '')

    return <p key={instruction}>{cleaned}</p>
  }

  const getNotesClass = (notes: string) => {
    return translateService.isLtrString(notes)
      ? 'english-notes'
      : 'hebrew-notes'
  }

  const groupSetsByDate = (sets: Set[]) => {
    return sets
      .sort(
        (a, b) =>
          new Date(b.createdAt || '').getTime() -
          new Date(a.createdAt || '').getTime()
      )
      .reduce((acc: Record<string, Set[]>, set: Set) => {
        if (!set.createdAt) return acc
        const date = getDateFromISO(new Date(set.createdAt).toISOString())
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(set)
        return acc
      }, {} as Record<string, Set[]>)
  }

  return (
    <div className='exercise-details-container'>
      <img
        src={exerciseImage}
        alt={exercise?.name}
        onError={() => setExerciseImage(exerciseImageObject.ERROR_IMAGE)}
      />
      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
      <div className='exercise-details'>
        {exercise?.notes?.expected && (
          <>
            <Typography variant='h5' className='bold-header'>
              Notes
            </Typography>
            <div
              className={`notes-container ${getNotesClass(
                exercise?.notes?.expected || ''
              )}`}
            >
              {exercise?.notes?.expected}
            </div>
          </>
        )}

        <CustomAccordion
          title='Instructions'
          cmp={exerciseInstructions?.map(renderExerciseInstructions)}
          icon={<AutoStoriesIcon />}
        />
        <Typography variant='h5' className='bold-header'>
          Past Sessions
        </Typography>
        {/* {exerciseSets.length === 0} */}
        {exerciseSets.length === 0 && (
          <Badge badgeContent={'New'} className={prefs.favoriteColor}></Badge>
        )}
        <SetsTable groupedSets={groupedSets} />
      </div>
    </div>
  )
}
