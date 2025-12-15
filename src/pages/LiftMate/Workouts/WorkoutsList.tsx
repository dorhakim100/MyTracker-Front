import { Workout } from '../../../types/workout/Workout'
import { CustomBasicList } from '../../../CustomMui/CustomBasicList/CustomBasicList'
import { WorkoutCard } from './WorkoutCard'

interface WorkoutsListProps {
  workouts: Workout[]
  className?: string
}

export function WorkoutsList({ workouts, className }: WorkoutsListProps) {
  return (
    <CustomBasicList<Workout>
      items={workouts}
      renderItem={(workout) => (
        <WorkoutCard workout={workout} className="workout-card" />
      )}
      getKey={(workout, index) => workout._id || `workout-${index}`}
      containerClassName={`workouts-list-container ${className || ''}`}
      emptyMessage="No workouts found"
    />
  )
}
