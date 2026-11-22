import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Divider, Typography } from '@mui/material'
import { CustomList } from '../../../CustomMui/CustomList/CustomList'
import { Chevron } from '../../../CustomMui/Chevron/Chevron'
import { BodyPartBadges } from '../../BodyPartBadge/BodyPartBadge'
import { EquipmentBadges } from '../../EquipmentBadges/EquipmentBadges'
import { MarqueeText } from '../../MarqueeText/MarqueeText'
import { BottomReachIndicator } from '../../BottomReachIndicator/BottomReachIndicator'
import { exerciseImage as exerciseImageObject } from '../../../assets/config/exercise-image'
import { showErrorMsg } from '../../../services/event-bus.service'
import { capitalizeFirstLetter } from '../../../services/util.service'
import { EquipmentSelect } from '../../ExercisesFilter/EquipmentSelect'
import { NoResults } from '../../NoResults/NoResults'
import { filterExercises } from '../../../services/exersice-search/exersice-search'
import { useAlternateExercises } from '../../../hooks/useAlternateExercises'
import { Exercise } from '../../../types/exercise/Exercise'
import { ExerciseFilter } from '../../../types/exerciseFilter/ExerciseFilter'
import { exerciseDetailsNs } from '../locals'
import type { ExerciseWithDetails } from '../ExerciseDetails'

interface DetailsProps {
  exercise: ExerciseWithDetails | null
  image: string
  muscleGroupsText: string
  isDarkMode: boolean
  onImageError: () => void
  onOpenExercise: (exercise: Exercise) => void
}

export function Details({
  exercise,
  image,
  muscleGroupsText,
  isDarkMode,
  onImageError,
  onOpenExercise,
}: DetailsProps) {
  const { t } = useTranslation()
  const { t: tDetails } = useTranslation(exerciseDetailsNs)
  const [exerciseFilter, setExerciseFilter] = useState<ExerciseFilter>({
    equipmentValue: 'All',
    searchValue: '',
    muscleGroupValue: 'All',
  })
  const {
    items,
    isError,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isPlaceholderData,
    fetchNextPage,
  } = useAlternateExercises({
    exercise,
    equipment: exerciseFilter.equipmentValue,
  })

  const similarExercises = useMemo(() => {
    return filterExercises(exerciseFilter, items).filter(
      (item) => item.exerciseId !== exercise?.exerciseId
    )
  }, [exercise?.exerciseId, exerciseFilter, items])

  const isFilterLoading =
    isPlaceholderData || (isFetching && !isFetchingNextPage)
  const showLoading = isFilterLoading && similarExercises.length === 0

  useEffect(() => {
    if (!isError) return
    showErrorMsg(t('messages.error.getExercises'))
  }, [isError, t])

  return (
    <>
      <img
        src={image}
        alt={exercise?.name}
        onError={onImageError}
      />
      <div className='exercise-body-parts-container'>
        <BodyPartBadges
          exercise={exercise}
          size='l'
        />
        {muscleGroupsText ? (
          <MarqueeText
            variant='body2'
            className='exercise-muscle-groups bold-header'
          >
            {muscleGroupsText}
          </MarqueeText>
        ) : null}
        <EquipmentBadges
          equipments={exercise?.equipments}
          size='l'
        />
      </div>
      <Divider className={`divider ${isDarkMode ? 'dark-mode' : ''}`} />
      <div className='similar-exercises'>
        <div className='header-container'>
          <Typography
            variant='h6'
            className='bold-header'
          >
            {tDetails('similarExercises')}
          </Typography>

          <EquipmentSelect
            exerciseFilter={exerciseFilter}
            onExerciseFilterChange={setExerciseFilter}
            variant='thin'
          />
        </div>

        {showLoading ? (
          <CustomList
            variant='card'
            className={isDarkMode ? 'dark-mode' : ''}
            isLoading
            skeletonCount={4}
            items={[]}
          />
        ) : similarExercises.length > 0 ? (
          <CustomList
            variant='card'
            className={isDarkMode ? 'dark-mode' : ''}
            items={similarExercises}
            getKey={(item) => item.exerciseId}
            renderPrimaryText={(item) => (
              <MarqueeText className='primary-text bold-header'>
                {capitalizeFirstLetter(item.name)}
              </MarqueeText>
            )}
            renderSecondaryText={(item) => (
              <MarqueeText
                className='secondary-text'
                variant='caption'
              >
                {capitalizeFirstLetter(item.muscleGroups.join(', '))}
              </MarqueeText>
            )}
            renderUnderText={(item) => (
              <EquipmentBadges
                equipments={item.equipments}
                size='s'
              />
            )}
            renderLeft={(item) => (
              <img
                src={item.image}
                alt={item.name}
                onError={(event) => {
                  event.currentTarget.src = exerciseImageObject.ERROR_IMAGE
                }}
                className='similar-exercise-image'
              />
            )}
            renderRight={() => <Chevron fontSize='small' />}
            onItemClick={onOpenExercise}
          />
        ) : hasNextPage ? null : (
          <NoResults text={tDetails('noSimilarExercises')} />
        )}
        {!showLoading && (hasNextPage || isFetchingNextPage) && (
          <div className='similar-exercises-more'>
            <BottomReachIndicator
              hasMore={Boolean(hasNextPage)}
              isLoading={isFetchingNextPage}
              onReachBottom={async () => {
                await fetchNextPage()
              }}
            />
          </div>
        )}
      </div>
    </>
  )
}
