import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../../store/store'
import { Workout } from '../../../../../../types/workout/Workout'
import { workoutService } from '../../../../../../services/workout/workout.service'
import { duplicateWorkout } from '../../../../../../store/actions/workout.action'
import {
  showErrorMsg,
  showSuccessMsg,
} from '../../../../../../services/event-bus.service'
import { CustomSkeleton } from '../../../../../../CustomMui/CustomSkeleton/CustomSkeleton'
import { WorkoutCard } from '../../../WorkoutCard'

interface RoutineCardsProps {
  routineIds: string[]
  forUserId: string
}

export function RoutineCards({ routineIds, forUserId }: RoutineCardsProps) {
  const { t } = useTranslation()
  const isDarkMode = useSelector(
    (state: RootState) => state.systemModule.prefs.isDarkMode
  )
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const loaded = await Promise.all(
        routineIds.map(async (id) => {
          try {
            return (await workoutService.getById(id, {})) as Workout
          } catch {
            return null
          }
        })
      )
      if (cancelled) return
      setWorkouts(
        loaded.filter((workout): workout is Workout => Boolean(workout))
      )
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [routineIds])

  async function onDuplicateWorkout(workout: Workout) {
    try {
      const duplicated = await duplicateWorkout(
        workout,
        forUserId,
        t('workout.copyName', { name: workout.name })
      )
      if (!duplicated?._id) {
        showErrorMsg(t('messages.error.duplicateWorkout'))
        return
      }
      setWorkouts((current) => [...current, duplicated])
      showSuccessMsg(t('messages.success.duplicateWorkout'))
    } catch {
      showErrorMsg(t('messages.error.duplicateWorkout'))
    }
  }

  if (loading) {
    return (
      <div className='distribution-routines'>
        {routineIds.map((id) => (
          <CustomSkeleton
            key={id}
            variant='rounded'
            width='100%'
            height={140}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    )
  }

  return (
    <div className='distribution-routines'>
      {workouts.map((workout) => (
        <WorkoutCard
          key={workout._id}
          workout={workout}
          onStartWorkout={() => undefined}
          selectedWorkoutId={null}
          isRenderStartButtons={false}
          onReorderWorkouts={setWorkouts}
          workouts={workouts}
          onDuplicateWorkout={onDuplicateWorkout}
        />
      ))}
    </div>
  )
}
