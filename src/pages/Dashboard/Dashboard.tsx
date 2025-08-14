import { TimesContainer } from '../../components/TimesContainer/TimesContainer'
import { CaloriesProgress } from '../../components/CaloriesProgress/CaloriesProgress'
import { StatsCarousel } from '../../components/StatsCarousel/StatsCarousel'

export function Dashboard() {
  return (
    <div className='home-container'>
      <TimesContainer />
      {/* <CaloriesProgress value={50} current={1000} goal={2000} /> */}
      <StatsCarousel />
    </div>
  )
}
