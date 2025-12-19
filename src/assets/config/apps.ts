import myTrackerLogo from '../../../public/original-logo.png'
import liftMateLogo from '../../../public/lift-mate-logo-square.png'
import { App } from '../../types/app/App'

export const apps = {
  myTracker: {
    name: 'My Tracker',
    logo: myTrackerLogo,
    id: 'my-tracker' as App,
  },
  liftMate: {
    name: 'Lift Mate',
    logo: liftMateLogo,
    id: 'lift-mate' as App,
  },
}
