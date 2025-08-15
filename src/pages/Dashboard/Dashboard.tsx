import { TimesContainer } from '../../components/TimesContainer/TimesContainer'
import { StatsCarousel } from '../../components/StatsCarousel/StatsCarousel'

export function Dashboard() {
  return (
    <div className='home-container'>
      <TimesContainer />
      <StatsCarousel />
    </div>
  )
}
