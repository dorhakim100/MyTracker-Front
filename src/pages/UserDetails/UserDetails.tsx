import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { logout } from '../../store/actions/user.actions'
import { CustomAccordion } from '../../CustomMui/CustomAccordion/CustomAccordion'
import { ProfileCard } from '../../components/ProfileCard/ProfileCard'
import { WeightCard } from '../../components/WeightCard/WeightCard'
import { GoalsCard } from '../../components/GoalsCard/GoalsCard'
import { BmrCard } from '../../components/BmrCard/BmrCard'
import { MealsCard } from '../../components/MealsCard/MealsCard'
import { FavoriteItemsCard } from '../../components/FavoriteItemsCard/FavoriteItemsCard'
import { PreferencesCard } from '../../components/PreferencesCard/PreferencesCard'
import { MyTraineeCard } from '../../components/MyTraineeCard/MyTraineeCard'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import CalculateIcon from '@mui/icons-material/Calculate'
import SettingsIcon from '@mui/icons-material/Settings'
import ModeStandbyIcon from '@mui/icons-material/ModeStandby'
import PersonAddIcon from '@mui/icons-material/PersonAdd'

export function UserDetails() {
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  const user = useSelector(
    (storeState: RootState) => storeState.userModule.user
  )

  const acrodions = [
    user?.isTrainer
      ? {
          title: 'My Trainees',
          cmp: <MyTraineeCard />,
          icon: <PersonAddIcon />,
          key: 'my-trainees',
        }
      : null,
    {
      title: 'Meals',
      cmp: <MealsCard />,
      icon: <RestaurantMenuIcon />,
      key: 'meals',
    },
    {
      title: 'Goals',
      cmp: <GoalsCard />,
      icon: <ModeStandbyIcon />,
      key: 'goals',
    },
    {
      title: 'Favorite Items',
      cmp: <FavoriteItemsCard />,
      icon: <FavoriteBorderIcon />,
      key: 'favorite-items',
    },
    {
      title: 'BMR Calculator',
      cmp: <BmrCard />,
      icon: <CalculateIcon />,
      key: 'bmr-calculator',
    },
    {
      title: 'Preferences',
      cmp: <PreferencesCard />,
      icon: <SettingsIcon />,
      key: 'preferences',
    },
  ].filter(Boolean) as {
    title: string
    cmp: React.ReactNode
    icon: React.ReactNode
    key: string
  }[]

  return (
    <div
      className={`page-container user-page ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
    >
      <ProfileCard />

      <div className='content-container'>
        <WeightCard />

        {acrodions.map((accordion) => (
          <CustomAccordion
            key={`${accordion.key}-accordion`}
            title={accordion.title}
            cmp={accordion.cmp}
            icon={accordion.icon}
          />
        ))}

        <CustomButton
          fullWidth
          onClick={() => logout()}
          className={`${prefs.favoriteColor}`}
          text='Logout'
        />
      </div>
    </div>
  )
}
