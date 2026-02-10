import { Workout } from '../../../types/workout/Workout'
import { CustomBasicList } from '../../../CustomMui/CustomBasicList/CustomBasicList'
import { WorkoutCard } from './WorkoutCard'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'

interface WorkoutsListProps {
  workouts: Workout[]
  className?: string
  onStartWorkout: (workout: Workout) => void
  selectedWorkoutId: string | null
  isRenderStartButtons: boolean
  onReorderWorkouts: (workouts: Workout[]) => void
}

export function WorkoutsList({
  workouts,
  className,
  onStartWorkout,
  selectedWorkoutId,
  isRenderStartButtons = true,
  onReorderWorkouts,
}: WorkoutsListProps) {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  return (
    <CustomBasicList<Workout>
      items={workouts}
      renderItem={(workout) => (
        <WorkoutCard
          workout={workout}
          className={`workout-card ${prefs.favoriteColor}`}
          onStartWorkout={onStartWorkout}
          selectedWorkoutId={selectedWorkoutId}
          isRenderStartButtons={isRenderStartButtons}
          onReorderWorkouts={onReorderWorkouts}
          workouts={workouts}
        />
      )}
      getKey={(workout, index) => workout._id || `workout-${index}`}
      containerClassName={`workouts-list-container ${className || ''}`}
      emptyMessage='No workouts found'
      onReorder={onReorderWorkouts}
    />
  )
}
