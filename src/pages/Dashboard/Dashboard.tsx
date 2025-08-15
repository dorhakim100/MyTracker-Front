import { TimesContainer } from '../../components/TimesContainer/TimesContainer'
import { StatsCarousel } from '../../components/StatsCarousel/StatsCarousel'

export function Dashboard() {
  return (
    <div className='page-container dashboard-container'>
      <TimesContainer />
      <StatsCarousel />
    </div>
  )
}
