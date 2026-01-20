import React, { useEffect, useMemo, useState } from 'react'
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
import { userService } from '../../services/user/user.service'
import { setIsLoading } from '../../store/actions/system.actions'
import { TrainerRequest } from '../../types/trainerRequest/TrainerRequest'
import { TrainerRequestCard } from '../../components/TrainerRequestCard/TrainerRequestCard'
import { messages } from '../../assets/config/messages'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import {
  APPROVED_STATUS,
  REJECTED_STATUS,
} from '../../assets/config/request-statuses'
import { WeightChart } from '../../components/WeightChart/WeightChart'
import { StatsCarousel } from '../../components/StatsCarousel/StatsCarousel'

export function UserDetails() {
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  const user = useSelector(
    (storeState: RootState) => storeState.userModule.user
  )

  const isDashboard = useSelector(
    (storeState: RootState) => storeState.systemModule.isDashboard
  )

  const [requests, setRequests] = useState<TrainerRequest[]>([])

  const acrodions = [

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

  const statsCarouselItems = useMemo(() => {
    if (!user) return []
    return [<WeightCard />, <WeightChart />]
  }, [user])

  useEffect(() => {
    getUsersRequests()
  }, [user])

  async function getUsersRequests() {
    try {
      if (!user?._id) return
      setIsLoading(true)
      const requests = await userService.getRequests(undefined, user._id)
      setRequests(requests)
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function onUpdateRequest(
    request: TrainerRequest,
    status: typeof APPROVED_STATUS | typeof REJECTED_STATUS
  ) {
    if (!request?._id) return
    try {
      setIsLoading(true)
      await userService.updateRequest(request._id, status)
      const updatedRequests = requests.filter((r) => r._id !== request._id)
      setRequests(updatedRequests)
      showSuccessMsg(messages.success.updateRequest)
    } catch (err) {
      showErrorMsg(messages.error.updateRequest)
    } finally {
      setIsLoading(false)
    }
  }




  return (
    <div
      className={`page-container user-page ${prefs.isDarkMode ? 'dark-mode' : ''
        } ${isDashboard ? 'dashboard' : ''}`}
    >
      <ProfileCard />


      {isDashboard &&

        <div className="weight-chart-container">
          <WeightChart />
        </div>
      }
      {isDashboard &&
        <BmrCard />
      }

      {!isDashboard && <div className="content-container">
        <StatsCarousel
          items={statsCarouselItems}
          showSkeleton={!user}
          direction="vertical"
        />

        {requests.length > 0 && (
          <TrainerRequestCard
            request={requests[0]}
            onAccept={(request) => onUpdateRequest(request, APPROVED_STATUS)}
            onReject={(request) => onUpdateRequest(request, REJECTED_STATUS)}
          />
        )}

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
          text="Logout"
        />
      </div>}
    </div>
  )
}
