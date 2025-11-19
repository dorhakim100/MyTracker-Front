import { MuscleGroupCard } from '../../../components/LiftMate/MuscleGroupCard/MuscleGroupCard'
import { musclesGroup } from '../../../assets/config/muscles-group'

export function Workouts() {
  return (
    <div className="page-container workouts-container">
      <h1>Lift Mate Workouts</h1>
      {musclesGroup.map((muscleGroup) => (
        <div key={muscleGroup.name}>
          <h2>{muscleGroup.name}</h2>
          <MuscleGroupCard muscleGroup={muscleGroup} />
        </div>
      ))}
    </div>
  )
}
