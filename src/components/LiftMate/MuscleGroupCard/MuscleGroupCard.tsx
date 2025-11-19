import { useSelector } from 'react-redux'
import { MuscleGroup } from '../../../types/muscleGroup/MuscleGroup'

import { Card } from '@mui/material'
import { RootState } from '../../../store/store'
import { capitalizeFirstLetter } from '../../../services/util.service'

const BASE_FRONT =
  'https://wger.de/static/images/muscles/muscular_system_front.svg'

const BASE_BACK =
  'https://wger.de/static/images/muscles/muscular_system_back.svg'
export function MuscleGroupCard({ muscleGroup }: { muscleGroup: MuscleGroup }) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const getBase = () => {
    return muscleGroup.base === 'front' ? BASE_FRONT : BASE_BACK
  }

  const getMuscleContainerClass = () => {
    const group = muscleGroup.name
    if (group === 'calves' || group === 'hamstrings') {
      return `lower-body ${group}`
    }
    if (group === 'abs' || group === 'quads' || group === 'glutes')
      return `middle ${group}`

    return `upper-body ${group}`
  }

  return (
    <div className="muscle-group-card-container">
      <h2>{capitalizeFirstLetter(muscleGroup.name)}</h2>
      <Card
        className={`card muscle-container ${
          prefs.isDarkMode ? 'dark-mode' : ''
        } ${getMuscleContainerClass()}`}
      >
        <img src={getBase()} alt="base" className="base-img" />
        {muscleGroup.img.map((img) => (
          <img
            key={`${muscleGroup.name}-${img}`}
            src={img}
            alt="muscle"
            className="muscle-overlay"
          />
        ))}
      </Card>{' '}
    </div>
  )
}
