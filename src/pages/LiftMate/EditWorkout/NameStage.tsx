import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'
import { capitalizeFirstLetter } from '../../../services/util.service'
import { CustomInput } from '../../../CustomMui/CustomInput/CustomInput'
import { Divider, Chip } from '@mui/material'
import { CustomSelect } from '../../../CustomMui/CustomSelect/CustomSelect'
import { ClickAnimation } from '../../../components/ClickAnimation/ClickAnimation'
import { MuscleGroupCard } from '../../../components/LiftMate/MuscleGroupCard/MuscleGroupCard'
import { MuscleGroup } from '../../../types/muscleGroup/MuscleGroup'
import { musclesGroup } from '../../../assets/config/muscles-group'
import { matchesMuscleGroup } from '../../../services/exersice-search/exersice-search'
import { Workout } from '../../../types/workout/Workout'

type MuscleGroupArea = 'all' | 'upper' | 'lower'

interface MuscleGroupFilter {
  txt: string
  area: MuscleGroupArea
}

interface NameStageProps {
  workout: Workout
  muscleGroupFilter: MuscleGroupFilter
  onNameChange: (name: string) => void
  onToggleMuscleGroup: (muscleGroup: MuscleGroup) => void
  onMuscleGroupFilterChange: (filter: MuscleGroupFilter) => void
}

export function NameStage({
  workout,
  muscleGroupFilter,
  onNameChange,
  onToggleMuscleGroup,
  onMuscleGroupFilterChange,
}: NameStageProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const filteredMuscleGroups = useMemo(() => {
    let filtered = musclesGroup
    if (muscleGroupFilter.txt) {
      filtered = filtered.filter((muscleGroup) =>
        matchesMuscleGroup(muscleGroup, muscleGroupFilter.txt)
      )
    }

    if (muscleGroupFilter.area !== 'all') {
      filtered = filtered.filter(
        (muscleGroup) => muscleGroup.area === muscleGroupFilter.area
      )
    }
    return filtered
  }, [muscleGroupFilter.txt, muscleGroupFilter.area])

  const getMuscleGroupCardClass = (muscleGroup: MuscleGroup) => {
    return workout.muscleGroups.includes(muscleGroup.name) ? 'selected' : ''
  }

  return (
    <div className='edit-workout-stage name-stage'>
      <CustomInput
        value={workout.name}
        onChange={onNameChange}
        placeholder='Enter workout name'
        isRemoveIcon={true}
      />
      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
      <div className='selected-muscles-group-container'>
        {workout.muscleGroups.length > 0 ? (
          workout.muscleGroups.map((muscleGroup) => (
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
        )}
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
