import { MuscleGroup } from '../../../types/muscleGroup/MuscleGroup'

const BASE_FRONT =
  'https://wger.de/static/images/muscles/muscular_system_front.svg'

const BASE_BACK =
  'https://wger.de/static/images/muscles/muscular_system_back.svg'

export function MuscleGroupCard({ muscleGroup }: { muscleGroup: MuscleGroup }) {
  const getBase = () => {
    return muscleGroup.base === 'front' ? BASE_FRONT : BASE_BACK
  }

  return (
    <div className="muscle-container">
      <img src={getBase()} alt="base" className="base-img" />
      {muscleGroup.img.map((img) => (
        <img
          key={`${muscleGroup.name}-${img}`}
          src={img}
          alt="muscle"
          className="muscle-overlay"
        />
      ))}
    </div>
  )
}
