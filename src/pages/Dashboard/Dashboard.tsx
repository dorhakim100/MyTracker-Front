import { TimesContainer } from '../../components/TimesContainer/TimesContainer'
import { StatsCarousel } from '../../components/StatsCarousel/StatsCarousel'
import { CurrMeal } from '../../components/CurrMeal/CurrMeal'

export function Dashboard() {
  return (
    <div className='page-container dashboard-container'>
      <TimesContainer />
      <StatsCarousel />
      <CurrMeal />
    </div>
  )
}
