import { TimesContainer } from '../../components/TimesContainer/TimesContainer'
import { StatsCarousel } from '../../components/StatsCarousel/StatsCarousel'
import { Macros } from '../../components/Macros/Macros'
import { MacrosDistribution } from '../../components/MacrosDistribution/MacrosDistribution'

export function Dashboard() {
  return (
    <div className='home-container'>
      <TimesContainer />
      <StatsCarousel />
      <Macros protein={150} carbs={220} fats={70} />
      <MacrosDistribution protein={150} carbs={220} fats={70} />
    </div>
  )
}
