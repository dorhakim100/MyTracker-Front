import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useSelector } from 'react-redux'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

import { RootState } from '../../store/store'
import { Workout } from '../../types/workout/Workout'
import { capitalizeFirstLetter } from '../../services/util.service'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { Exercise } from '../../types/exercise/Exercise'

import { SlideDialog } from '../SlideDialog/SlideDialog'
import { ExerciseDetails } from '../ExerciseDetails/ExerciseDetails'
import { getWorkoutMuscles } from '../../services/exersice-search/exersice-search'
import { MarqueeText } from '../MarqueeText/MarqueeText'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { ChatUnreadBadge } from '../../CustomMui/ChatUnreadBadge/ChatUnreadBadge'
import { ExerciseChatDialog } from '../ExerciseChatDialog/ExerciseChatDialog'
import { exerciseChatNs } from '../ExerciseChatDialog/locals'
import { useUnreadSummary } from '../../hooks/useUnreadSummary'
import { useChatRole } from '../../hooks/useChatRole'
interface WorkoutDetailsProps {
  workout: Workout | null
}

interface ExerciseDialogOptions {
  open: boolean
  exercise: Exercise | null
}

export function WorkoutDetails({ workout }: WorkoutDetailsProps) {
  const { t } = useTranslation()
  const { t: tChat } = useTranslation(exerciseChatNs)
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const isDashboard = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isDashboard
  )
  const { user, traineeUser } = useSelector(
    (stateSelector: RootState) => stateSelector.userModule
  )
  const chatRole = useChatRole()
  const { getExerciseCount, hasExerciseMessages } = useUnreadSummary(chatRole)
  const traineeName =
    chatRole === 'trainer' && traineeUser && traineeUser._id !== user?._id
      ? traineeUser.details.fullname
      : undefined

  const [exersiceDialogOptions, setExersiceDialogOptions] =
    useState<ExerciseDialogOptions>({
      open: false,
      exercise: null,
    })
  const [chatExercise, setChatExercise] = useState<Exercise | null>(null)

  const onOpenExerciseDetails = (exercise: Exercise) => {
    setExersiceDialogOptions({ open: true, exercise })
  }

  if (!workout) {
    return (
      <div className='workout-details-container'>
        <Typography>{t('workout.noWorkoutSelected')}</Typography>
      </div>
    )
  }
  const workoutMuscles = getWorkoutMuscles(workout).join(', ')

  return (
    <>
      <div className='workout-details-container'>
        <div className='header-container'>
          <Typography
            variant='h4'
            className='name-container bold-header'
          >
            {workout.name}
          </Typography>
          {workoutMuscles && workoutMuscles.length > 0 && (
            <Typography
              variant='body1'
              className='muscle-groups-container'
            >
              {workoutMuscles}
            </Typography>
          )}
        </div>
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />

        <CustomList
          items={workout.exercises}
          renderPrimaryText={(exercise) => (
            <MarqueeText variant='body1'>
              {capitalizeFirstLetter(exercise.name)}
            </MarqueeText>
          )}
          renderSecondaryText={(exercise) => (
            <MarqueeText variant='body2'>
              {capitalizeFirstLetter(exercise.muscleGroups.join(', '))}
            </MarqueeText>
          )}
          className={`exercises-list  ${prefs.isDarkMode ? 'dark-mode' : ''} ${isDashboard ? 'dashboard' : ''}`}
          renderLeft={(exercise) => (
            <img
              src={exercise.image}
              alt={exercise.name}
            />
          )}
          getKey={(exercise) => exercise.exerciseId}
          onItemClick={(exercise) => onOpenExerciseDetails(exercise)}
          renderRight={(exercise) =>
            workout._id ? (
              <ChatUnreadBadge
                count={getExerciseCount(workout._id, exercise.exerciseId)}
                hasMessages={hasExerciseMessages(
                  workout._id,
                  exercise.exerciseId
                )}
              >
                <CustomButton
                  isIcon={true}
                  icon={<ChatBubbleOutlineIcon />}
                  tooltipTitle={tChat('openChat')}
                />
              </ChatUnreadBadge>
            ) : null
          }
          onRightClick={(exercise) => {
            if (!workout._id) return
            setChatExercise(exercise)
          }}
        />
      </div>
      <SlideDialog
        open={exersiceDialogOptions.open}
        onClose={() =>
          setExersiceDialogOptions({ open: false, exercise: null })
        }
        component={
          <ExerciseDetails
            exercise={exersiceDialogOptions.exercise}
            workoutId={workout._id}
            workoutName={workout.name}
            chatRole={chatRole}
          />
        }
        title={capitalizeFirstLetter(
          exersiceDialogOptions.exercise?.name || ''
        )}
        type='full'
      />
      {workout._id && (
        <ExerciseChatDialog
          open={Boolean(chatExercise)}
          onClose={() => setChatExercise(null)}
          workoutId={workout._id}
          exerciseId={chatExercise?.exerciseId || ''}
          role={chatRole}
          exerciseName={chatExercise?.name || ''}
          workoutName={workout.name}
          traineeName={traineeName}
        />
      )}
    </>
  )
}
