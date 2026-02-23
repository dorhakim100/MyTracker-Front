import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'
import { Diary } from '../Diary/Diary'
import { FixedMenu } from '../FixedMenu/FixedMenu'

export function FoodTab() {
  const user = useSelector((state: RootState) => state.userModule.user)
  const traineeUser = useSelector(
    (state: RootState) => state.userModule.traineeUser
  )
  const displayUser = traineeUser || user

  if (displayUser?.isFixedMenu) {
    return <FixedMenu />
  }
  return <Diary />
}
