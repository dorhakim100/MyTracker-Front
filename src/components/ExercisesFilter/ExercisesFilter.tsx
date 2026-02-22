import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { CustomSelect } from '../../CustomMui/CustomSelect/CustomSelect'
import { musclesValues, musclesImgs } from '../../assets/config/muscles'

import { ExerciseFilter } from '../../types/exerciseFilter/ExerciseFilter'
import { workoutService } from '../../services/workout/workout.service'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import { Typography } from '@mui/material'
import { EquipmentSelect } from './EquipmentSelect'

interface ExercisesFilterProps {
  exerciseFilter: ExerciseFilter
  onExerciseFilterChange: (exerciseFilter: ExerciseFilter) => void
  searchPlaceholder?: string
  className?: string
  resultsMsg?: string
}

export function ExercisesFilter({
  exerciseFilter,
  onExerciseFilterChange,
  searchPlaceholder,
  className = '',
  resultsMsg,
}: ExercisesFilterProps) {
  const { t } = useTranslation()
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const isDashboard = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isDashboard
  )

  const getIsDisabled = () => {
    return (
      JSON.stringify(exerciseFilter) ===
      JSON.stringify(workoutService.getEmptyExerciseFilter())
    )
  }

  return (
    <div
      className={`exercises-filter-container ${className} ${prefs.isDarkMode ? 'dark-mode' : ''
        } ${isDashboard ? 'dashboard' : ''}`}
    >
      <CustomInput
        value={exerciseFilter.searchValue}
        onChange={(value) => {
          onExerciseFilterChange({ ...exerciseFilter, searchValue: value })
        }}
        placeholder={searchPlaceholder ?? t('workout.searchForExercises')}
        isRemoveIcon={true}
        className={`${prefs.favoriteColor}`}
      />
      <CustomSelect
        tooltipTitle={t('exercise.editMuscleGroup')}
        value={exerciseFilter.muscleGroupValue}
        onChange={(value) =>
          onExerciseFilterChange({ ...exerciseFilter, muscleGroupValue: value })
        }
        label={t('exercise.muscleGroup')}
        values={musclesValues}
        className={`${prefs.favoriteColor}`}
        imgs={musclesImgs}
      />

      <EquipmentSelect
        exerciseFilter={exerciseFilter}
        onExerciseFilterChange={onExerciseFilterChange}
      />
      <div className="results-msg-container">
        <Typography variant="h6" className="bold-header">
          {resultsMsg}
        </Typography>
        <CustomButton
          icon={<FilterAltOffIcon />}
          isIcon={true}
          tooltipTitle={t('exercise.clearFilters')}
          onClick={() => {
            onExerciseFilterChange(workoutService.getEmptyExerciseFilter())
          }}
          disabled={getIsDisabled()}
        />
      </div>
    </div>
  )
}
