import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
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
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import CalculateIcon from '@mui/icons-material/Calculate'
import SettingsIcon from '@mui/icons-material/Settings'
import ModeStandbyIcon from '@mui/icons-material/ModeStandby'
import { WeightChart } from '../../components/WeightChart/WeightChart'
import { StatsCarousel } from '../../components/StatsCarousel/StatsCarousel'

export function UserDetails() {
  const { t } = useTranslation()
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  const user = useSelector(
    (storeState: RootState) => storeState.userModule.user
  )

  const isDashboard = useSelector(
    (storeState: RootState) => storeState.systemModule.isDashboard
  )

  const traineeUser = useSelector(
    (storeState: RootState) => storeState.userModule.traineeUser
  )

  const timer = useSelector((state: RootState) => state.workoutModule.timer)

  const acrodions = [
    {
      title: t('user.accordionMeals'),
      cmp: <MealsCard />,
      icon: <RestaurantMenuIcon />,
      key: 'meals',
    },
    {
      title: t('user.accordionGoals'),
      cmp: <GoalsCard />,
      icon: <ModeStandbyIcon />,
      key: 'goals',
    },
    {
      title: t('user.accordionFavoriteItems'),
      cmp: <FavoriteItemsCard />,
      icon: <FavoriteBorderIcon />,
      key: 'favorite-items',
    },
    {
      title: t('user.accordionBmrCalculator'),
      cmp: <BmrCard sentUser={traineeUser || user || undefined} />,
      icon: <CalculateIcon />,
      key: 'bmr-calculator',
    },
    {
      title: t('user.accordionPreferences'),
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

  const statsCarouselItems = useMemo(() => {
    if (!user) return []
    return [
      <WeightCard />,
      <WeightChart sentUser={traineeUser || user || undefined} />,
    ]
  }, [user, traineeUser])

  return (
    <div
      className={`page-container user-page ${
        prefs.isDarkMode ? 'dark-mode' : ''
      } ${timer ? 'has-timer' : ''} ${isDashboard ? 'dashboard' : ''}`}
    >
      <ProfileCard userToDisplay={traineeUser || user || undefined} />

      {isDashboard && (
        <div className='weight-chart-container'>
          <WeightChart sentUser={traineeUser || user || undefined} />
        </div>
      )}
      {isDashboard && <BmrCard sentUser={traineeUser || user || undefined} />}

      {!isDashboard && (
        <div className='content-container'>
          <StatsCarousel
            items={statsCarouselItems}
            showSkeleton={!user}
            direction='vertical'
          />

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
            text={t('user.logout')}
          />
        </div>
      )}
    </div>
  )
}
