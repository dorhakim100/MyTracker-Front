import { useCallback, useEffect, useRef, useState } from 'react'
// import { DateRangeController } from '../../../components/DateRangeController/DateRangeController'
import { debounce } from '../../../services/util.service'
// import {getDateFromISO} from '../../../services/util.service'
// import { MONTH_IN_MS } from '../../../assets/config/times'
import { CustomInput } from '../../../CustomMui/CustomInput/CustomInput'
import { showErrorMsg } from '../../../services/event-bus.service'
import { messages } from '../../../assets/config/messages'
import { exerciseSearch } from '../../../services/exersice-search/exersice-search'
import { Exercise } from '../../../types/exercise/Exercise'
import { setIsLoading } from '../../../store/actions/system.actions'
import SearchIcon from '@mui/icons-material/Search'
import { CustomList } from '../../../CustomMui/CustomList/CustomList'
// import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'
import { Divider } from '@mui/material'
import { capitalizeFirstLetter } from '../../../services/util.service'
import { SlideDialog } from '../../../components/SlideDialog/SlideDialog'
import { ExerciseDetails } from '../../../components/ExerciseDetails/ExerciseDetails'

type slideOptions = {
  open: boolean
  type: 'exercise' | null
  exercise: Exercise | null
}

export function Progress() {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  // const [selectedPastDate, setSelectedPastDate] = useState({
  //   from: getDateFromISO(
  //     new Date(new Date().getTime() - MONTH_IN_MS).toISOString()
  //   ),
  //   to: getDateFromISO(new Date().toISOString()),
  // })

  const [slideOptions, setSlideOptions] = useState<slideOptions>({
    open: false,
    type: null,
    exercise: null,
  })

  const [searchValue, setSearchValue] = useState('')
  const [exerciseResults, setExerciseResults] = useState<Exercise[]>([])

  const handleSearch = useCallback(async () => {
    try {
      if (!searchValue) {
        setExerciseResults([])
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      const results = await exerciseSearch(searchValue)
      setExerciseResults(results)
    } catch (err) {
      showErrorMsg(messages.error.search)
      setExerciseResults([])
    } finally {
      setIsLoading(false)
    }
  }, [searchValue])

  const latestHandleSearchRef = useRef(handleSearch)
  const debouncedRunSearch = useRef(
    debounce(() => latestHandleSearchRef.current(), 300)
  ).current

  useEffect(() => {
    latestHandleSearchRef.current = handleSearch
  }, [handleSearch])

  useEffect(() => {
    debouncedRunSearch()
  }, [searchValue, debouncedRunSearch])

  // const onDateChange = (dates: { from: string; to: string }) => {
  //   setSelectedPastDate(dates)
  // }

  return (
    <>
      <div className='page-container progress-container'>
        <div className='filters-container'>
          <CustomInput
            value={searchValue}
            onChange={setSearchValue}
            placeholder='Search exercises...'
            startIconFn={() => <SearchIcon />}
            isRemoveIcon={true}
            className={`${prefs.favoriteColor}`}
          />
          {/* <DateRangeController
          selectedPastDate={selectedPastDate}
          onDateChange={onDateChange}
          /> */}
        </div>
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        <CustomList
          items={exerciseResults}
          renderPrimaryText={(exercise) => capitalizeFirstLetter(exercise.name)}
          renderSecondaryText={(exercise) =>
            capitalizeFirstLetter(exercise.muscleGroups.join(', '))
          }
          renderLeft={(exercise) => (
            <img src={exercise.image} alt={exercise.name} />
          )}
          getKey={(exercise) => exercise.exerciseId}
          className={`search-exercise-list ${
            prefs.isDarkMode ? 'dark-mode' : ''
          }`}
          onItemClick={(exercise) =>
            setSlideOptions({ open: true, type: 'exercise', exercise })
          }
        />
      </div>
      <SlideDialog
        open={slideOptions.open}
        onClose={() =>
          setSlideOptions({ open: false, type: null, exercise: null })
        }
        component={<ExerciseDetails exercise={slideOptions.exercise} />}
        title={capitalizeFirstLetter(slideOptions.exercise?.name || '')}
        type='full'
      />
    </>
  )
}
