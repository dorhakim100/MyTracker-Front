import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'
import { Workout } from '../../../types/workout/Workout'

import { WorkoutCard } from './WorkoutCard'

interface WorkoutsListProps {
  workouts: Workout[]
  className?: string
}
export function WorkoutsList({ workouts, className }: WorkoutsListProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  return (
    <div
      className={`workouts-list-container ${className} ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
    >
      {workouts.map((workout) => (
        <WorkoutCard
          key={workout._id}
          workout={workout}
          className={`workout-card`}
        />
      ))}
    </div>
  )
}
