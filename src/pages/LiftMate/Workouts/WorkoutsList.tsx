import { Workout } from '../../../types/workout/Workout'
import { CustomBasicList } from '../../../CustomMui/CustomBasicList/CustomBasicList'
import { WorkoutCard } from './WorkoutCard'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'
import { useDragHaptics } from '../../../hooks/useDragHaptics'

interface WorkoutsListProps {
  workouts: Workout[]
  className?: string
  onStartWorkout: (workout: Workout) => void
  selectedWorkoutId: string | null
  isRenderStartButtons: boolean
  onReorderWorkouts: (workouts: Workout[]) => void
  onDuplicateWorkout: (workout: Workout) => Promise<void>
}

export function WorkoutsList({
  workouts,
  className,
  onStartWorkout,
  selectedWorkoutId,
  isRenderStartButtons = true,
  onReorderWorkouts,
  onDuplicateWorkout,
}: WorkoutsListProps) {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const dragHaptics = useDragHaptics({itemHeight:120, style: 'Heavy'})
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
          onDuplicateWorkout={onDuplicateWorkout}
        />
      )}
      getKey={(workout, index) => workout._id || `workout-${index}`}
      containerClassName={`workouts-list-container ${className || ''}`}
      emptyMessage='No workouts found'
      onReorder={onReorderWorkouts}
      {...dragHaptics}
    />
  )
}
