import { useMemo } from 'react'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

type RangeKey = '7D' | '1M' | '3M' | '6M' | '1Y' | 'ALL'

interface LineChartControlsProps {
  value: RangeKey
  onChange: (next: RangeKey) => void
  className?: string
}

export function LineChartControls({
  value,
  onChange,
  className = '',
}: LineChartControlsProps) {
  const ranges: RangeKey[] = useMemo(() => ['1M', '3M', '6M', '1Y', 'ALL'], [])

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  return (
    <div className={`line-chart-controls ${className}`.trim()}>
      <div className='controls-row'>
        {ranges.map((key) => (
          <CustomButton
            key={key}
            text={key}
            className={`control-btn ${value === key ? 'active' : ''} ${
              prefs.favoriteColor
            }`}
            onClick={() => onChange(key)}
            disabled={value === key}
          />
        ))}
      </div>
    </div>
  )
}

export type { RangeKey as LineChartRangeKey }
