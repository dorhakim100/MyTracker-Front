import { TimesContainer } from '../../components/TimesContainer/TimesContainer'
import { CaloriesProgress } from '../../components/CaloriesProgress/CaloriesProgress'

export function Dashboard() {
  return (
    <div className='home-container'>
      <TimesContainer />
      <CaloriesProgress value={50} current={1000} goal={2000} />
    </div>
  )
}
