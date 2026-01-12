import { useSelector } from 'react-redux'
import { RootState } from '../../store/store.ts'
import { EditGoal } from '../EditGoal/EditGoal.tsx'
import { handleFirstGoal } from '../../store/actions/user.actions.ts'
import './styles/FirstGoalEdit.scss'

export function FirstGoalEdit() {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  if (user)
    return (
      <main className={`main ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
        <div className="first-time-edit-goal-container">
          <EditGoal saveGoal={(goal) => handleFirstGoal(goal, user)} />
        </div>
      </main>
    )
}
