import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Checkbox } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { Typography } from '@mui/material'
import { CustomBasicList } from '../../CustomMui/CustomBasicList/CustomBasicList'
import { SetMark } from '../SetMark/SetMark'
import { PickerSelect } from '../Pickers/PickerSelect'
import { Exercise, Set } from '../../types/exercise/Exercise'
import { RootState } from '../../store/store'
import { capitalizeFirstLetter } from '../../services/util.service'
import './styles/ReorderSets.scss'

interface ReorderSetsProps {
  exercise: Exercise
  sets: Set[]
  isExpected?: boolean
  onReorder: (sets: Set[]) => void
}

export function ReorderSets({
  exercise,
  sets,
  isExpected = false,
  onReorder,
}: ReorderSetsProps) {
  const { t } = useTranslation()
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const side = isExpected ? 'expected' : 'actual'

  return (
    <div className='reorder-sets'>
      <div className='reorder-sets-header'>
        <img
          src={exercise.image}
          alt={exercise.name}
          className='reorder-sets-image'
        />

        <Typography variant='h6'>
          {capitalizeFirstLetter(exercise.name)}
        </Typography>
      </div>
      <CustomBasicList
        items={sets}
        separator
        dragHandle
        getKey={(_, index) => `${exercise.exerciseId}-${index}`}
        onReorder={onReorder}
        renderItem={(set, index) => (
          <div className='reorder-set-row'>
            <SetMark
              sets={sets}
              index={index}
              set={set}
              className={`${prefs.favoriteColor} ${
                prefs.isDarkMode ? '' : 'dashboard'
              }`}
            />
            <PickerSelect
              readOnly
              className={prefs.favoriteColor}
              openClock={() => undefined}
              option={{
                label: t('exercise.reps'),
                key: 'reps',
                type: 'number',
              }}
              value={set.reps?.[side] || 0}
              minWidth={70}
            />
            <PickerSelect
              readOnly
              className={`weight-picker ${prefs.favoriteColor} ${
                prefs.lang === 'he' ? 'rtl' : ''
              }`}
              openClock={() => undefined}
              option={{
                label: t('exercise.weight'),
                key: 'weight',
                type: 'number',
              }}
              value={set.weight?.[side] || 0}
              minWidth={90}
              afterString={t('weight.kg')}
            />
            <PickerSelect
              readOnly
              className={prefs.favoriteColor}
              openClock={() => undefined}
              option={{
                label: set.rpe ? 'RPE' : 'RIR',
                key: set.rpe ? 'rpe' : 'rir',
                type: 'number',
              }}
              value={set.rpe ? set.rpe[side] || 0 : set.rir?.[side] ?? 2}
              minWidth={70}
            />
            <Checkbox
              className='reorder-set-check'
              checked={Boolean(set.isDone)}
              onChange={() => undefined}
              disableRipple
              tabIndex={-1}
              icon={<RadioButtonUncheckedIcon className='not-finished' />}
              checkedIcon={<CheckIcon className='finished' />}
            />
          </div>
        )}
      />
    </div>
  )
}
