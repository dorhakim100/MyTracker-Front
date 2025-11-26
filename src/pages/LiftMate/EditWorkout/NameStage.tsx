import { useSelector } from 'react-redux'
import { Divider } from '@mui/material'

import { RootState } from '../../../store/store'
import { capitalizeFirstLetter } from '../../../services/util.service'
import { CustomInput } from '../../../CustomMui/CustomInput/CustomInput'
import { CustomSelect } from '../../../CustomMui/CustomSelect/CustomSelect'
import { MuscleGroupCard } from '../../../components/LiftMate/MuscleGroupCard/MuscleGroupCard'
import { ClickAnimation } from '../../../components/ClickAnimation/ClickAnimation'
import { MuscleGroup } from '../../../types/muscleGroup/MuscleGroup'
import { Chip } from '@mui/material'

type MuscleGroupArea = 'all' | 'upper' | 'lower'
interface MuscleGroupFilter {
  txt: string
  area: MuscleGroupArea
}

interface NameStageProps {
  workoutName: string
  muscleGroups: string[]
  onNameChange: (name: string) => void
  onToggleMuscleGroup: (muscleGroup: MuscleGroup) => void
  muscleGroupFilter: MuscleGroupFilter
  onMuscleGroupFilterChange: (filter: MuscleGroupFilter) => void
  filteredMuscleGroups: MuscleGroup[]
}

export function NameStage({
  workoutName,
  muscleGroups,
  onNameChange,
  onToggleMuscleGroup,
  muscleGroupFilter,
  onMuscleGroupFilterChange,
  filteredMuscleGroups,
}: NameStageProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const getMuscleGroupCardClass = (muscleGroup: MuscleGroup) => {
    return muscleGroups.includes(muscleGroup.name) ? 'selected' : ''
  }

  const renderSelectedMusclesGroup = () => {
    return muscleGroups.length > 0 ? (
      muscleGroups.map((muscleGroup) => (
        <Chip
          label={capitalizeFirstLetter(muscleGroup)}
          variant='outlined'
          key={`${muscleGroup}-chip`}
        />
      ))
    ) : (
      <span className='no-muscles-selected bold-header'>
        No muscles selected
      </span>
    )
  }

  return (
    <div className='edit-workout-stage name-stage'>
      <CustomInput
        value={workoutName}
        onChange={onNameChange}
        placeholder='Enter workout name'
        isRemoveIcon={true}
      />
      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
      <div className='selected-muscles-group-container'>
        {renderSelectedMusclesGroup()}
      </div>
      <div className='muscle-filter-container'>
        <CustomInput
          value={muscleGroupFilter.txt}
          onChange={(txt: string) =>
            onMuscleGroupFilterChange({ ...muscleGroupFilter, txt })
          }
          placeholder='Search muscle'
          isRemoveIcon={true}
        />
        <CustomSelect
          value={muscleGroupFilter.area}
          onChange={(area: string) =>
            onMuscleGroupFilterChange({
              ...muscleGroupFilter,
              area: area as MuscleGroupArea,
            })
          }
          values={['all', 'upper', 'lower']}
          label='Area'
        />
      </div>
      <div className='muscles-group-container'>
        {filteredMuscleGroups.map((muscleGroup) => (
          <ClickAnimation
            key={muscleGroup.name}
            onClick={() => onToggleMuscleGroup(muscleGroup)}
          >
            <MuscleGroupCard
              muscleGroup={muscleGroup}
              className={`${getMuscleGroupCardClass(muscleGroup)} ${
                prefs.favoriteColor
              }`}
            />
          </ClickAnimation>
        ))}
      </div>
    </div>
  )
}

