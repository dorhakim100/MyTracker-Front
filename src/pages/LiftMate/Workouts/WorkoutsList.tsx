import { Workout } from '../../../types/workout/Workout'
import { CustomBasicList } from '../../../CustomMui/CustomBasicList/CustomBasicList'
import { WorkoutCard } from './WorkoutCard'

interface WorkoutsListProps {
  workouts: Workout[]
  className?: string
  onStartWorkout: (workout: Workout) => void
  selectedWorkoutId: string | null
}

export function WorkoutsList({
  workouts,
  className,
  onStartWorkout,
  selectedWorkoutId,
}: WorkoutsListProps) {
  return (
    <CustomBasicList<Workout>
      items={workouts}
      renderItem={(workout) => (
        <WorkoutCard
          workout={workout}
          className="workout-card"
          onStartWorkout={onStartWorkout}
          selectedWorkoutId={selectedWorkoutId}
        />
      )}
      getKey={(workout, index) => workout._id || `workout-${index}`}
      containerClassName={`workouts-list-container ${className || ''}`}
      emptyMessage="No workouts found"
    />
  )
}
