import { useSelector } from 'react-redux'
import { RootState } from '../../../../store/store'
import { Typography, Box, debounce } from '@mui/material'

import { ExercisesSearch } from '../../../../components/ExercisesSearch/ExercisesSearch'
import { ExerciseFilter } from '../../../../types/exerciseFilter/ExerciseFilter'
import { Exercise } from '../../../../types/exercise/Exercise'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { workoutService } from '../../../../services/workout/workout.service'
import {
  exerciseSearch,
  filterExercises,
  getMostPopularExercises,
} from '../../../../services/exersice-search/exersice-search'
import { messages } from '../../../../assets/config/messages'
import { showErrorMsg } from '../../../../services/event-bus.service'
import { setIsLoading } from '../../../../store/actions/system.actions'

export function TrainerExercises() {
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  const [exerciseFilter, setExerciseFilter] = useState<ExerciseFilter>(
    workoutService.getEmptyExerciseFilter()
  )
  const [exerciseResults, setExerciseResults] = useState<Exercise[]>([])

  const filteredExerciseResults = useMemo(() => {
    return filterExercises(exerciseFilter, exerciseResults)
  }, [
    exerciseResults,
    exerciseFilter.muscleGroupValue,
    exerciseFilter.equipmentValue,
  ])

  const onExerciseFilterChange = (exerciseFilter: ExerciseFilter) => {
    setExerciseFilter(exerciseFilter)
  }

  const handleSearch = useCallback(async () => {
    try {
      if (!exerciseFilter.searchValue) {
        const res = getMostPopularExercises()
        setExerciseResults(res)
        return
      }
      setIsLoading(true)
      const results = await exerciseSearch(exerciseFilter)
      setExerciseResults(results)
    } catch (err) {
      showErrorMsg(messages.error.search)
      setExerciseResults([])
    } finally {
      setIsLoading(false)
    }
  }, [
    exerciseFilter.searchValue,
    exerciseFilter.muscleGroupValue,
    exerciseFilter.equipmentValue,
  ])

  const latestHandleSearchRef = useRef(handleSearch)
  const debouncedRunSearch = useRef(
    debounce(() => latestHandleSearchRef.current(), 300)
  ).current

  useEffect(() => {
    latestHandleSearchRef.current = handleSearch
  }, [handleSearch])

  useEffect(() => {
    debouncedRunSearch()
  }, [
    exerciseFilter.searchValue,
    exerciseFilter.muscleGroupValue,
    exerciseFilter.equipmentValue,
    debouncedRunSearch,
  ])

  return (
    <Box
      className={`trainer-exercises-container ${prefs.isDarkMode ? 'dark-mode' : ''} ${prefs.favoriteColor}`}
    >
      <Typography
        variant='h4'
        className='bold-header'
      >
        Exercises
      </Typography>
      <ExercisesSearch
        exerciseFilter={exerciseFilter}
        onExerciseFilterChange={onExerciseFilterChange}
        placeholder='Search for exercises'
        className={`${prefs.favoriteColor}`}
        results={filteredExerciseResults}
        resultsMsg={
          !exerciseFilter.searchValue
            ? 'Most Popular Exercises'
            : `${filteredExerciseResults.length} exercises found`
        }
      />
    </Box>
  )
}
