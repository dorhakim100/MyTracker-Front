import { useState } from 'react'
import { DateRangeController } from '../../../components/DateRangeController/DateRangeController'
import { getDateFromISO } from '../../../services/util.service'
import { MONTH_IN_MS } from '../../../assets/config/times'

export function Progress() {
  const [selectedPastDate, setSelectedPastDate] = useState({
    from: getDateFromISO(
      new Date(new Date().getTime() - MONTH_IN_MS).toISOString()
    ),
    to: getDateFromISO(new Date().toISOString()),
  })

  const onDateChange = (dates: { from: string; to: string }) => {
    setSelectedPastDate(dates)
  }

  return (
    <div className='page-container progress-container'>
      <DateRangeController
        selectedPastDate={selectedPastDate}
        onDateChange={onDateChange}
      />
    </div>
  )
}
