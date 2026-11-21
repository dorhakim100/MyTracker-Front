import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import { CustomList } from '../../../CustomMui/CustomList/CustomList'
import { RootState } from '../../../store/store'
import { setMark } from '../../../services/set/set-type'
import { SetType } from '../../../types/exercise/SetType'
import { InfoHint } from '../../InfoHint/InfoHint'
import { setTypeSheetNs } from './locals'

const TYPES: { type: SetType; mark?: string }[] = [
  { type: 'normal' },
  { type: 'warmUp', mark: 'W' },
  { type: 'failure', mark: 'F' },
  { type: 'drop', mark: 'D' },
  { type: 'myoReps', mark: 'M' },
]

const TYPE_CLASS: Record<Exclude<SetType, 'normal'>, string> = {
  warmUp: 'set-type-warm-up',
  failure: 'set-type-failure',
  drop: 'set-type-drop',
  myoReps: 'set-type-myo',
}

interface SetTypeSheetProps {
  sets: { type?: string }[]
  index: number
  onSelect: (type: SetType) => void
  restLabel?: string
  onEditRest?: () => void
}

export function SetTypeSheet({
  sets,
  index,
  onSelect,
  restLabel,
  onEditRest,
}: SetTypeSheetProps) {
  const { t } = useTranslation(setTypeSheetNs)
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const normalMark = setMark(
    sets.map((set, i) => (i === index ? { ...set, type: 'normal' } : set)),
    index
  )

  return (
    <div className='set-type-sheet-container'>
      {restLabel && onEditRest && (
        <div className='set-type-rest'>
          <span>{restLabel}</span>
          <CustomButton
            isIcon
            variant='flat'
            size='small'
            icon={<AccessTimeIcon />}
            onClick={onEditRest}
            tooltipTitle={t('editRest')}
            ariaLabel={t('editRest')}
          />
        </div>
      )}
      <CustomList
        items={TYPES}
        getKey={(item) => item.type}
        separator
        onItemClick={(item) => onSelect(item.type)}
        renderPrimaryText={(item) => t(item.type)}
        renderLeft={(item) => (
          <span
            className={`set-type-mark ${prefs.favoriteColor} ${
              item.type === 'normal' ? '' : TYPE_CLASS[item.type]
            }`}
          >
            {item.type === 'normal' ? normalMark : item.mark}
          </span>
        )}
        renderRight={(item) =>
          item.type === 'normal' ? null : (
            <span
              onClick={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <InfoHint
                title={t(item.type)}
                description={t(`${item.type}Info`)}
              />
            </span>
          )
        }
      />
    </div>
  )
}
