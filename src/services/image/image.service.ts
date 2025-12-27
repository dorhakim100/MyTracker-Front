import axios from 'axios'
import { searchUrls } from '../../assets/config/search.urls'
import { translateService } from '../translate/translate.service'
import { Item } from '../../types/item/Item'
import { searchService } from '../search/search-service'
import { Exercise } from '../../types/exercise/Exercise'
import { exerciseImage } from '../../assets/config/exercise-image'
import { ExerciseInstructions } from '../../types/exercise/ExerciseInstructions'

const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY
const PIXABAY_API_URL = 'https://pixabay.com/api/'

const NUMBER_OF_IMAGES = 40

export const imageService = {
  getImage,
  getSingleImage,
  fetchOnError,
  renderErrorExerciseImage,
  getFormattedExercise,
}

async function getImage(query: string) {
  query = query.toLocaleLowerCase()

  let res
  try {
    res = await fetchPixabay(query)

    const { hits } = res

    if (hits.length > 0) return hits

    return []
  } catch (err) {
    console.log(err)
  }
}

async function getSingleImage(query: string) {
  if (!query) return null

  try {
    // trim and normalize query
    query = query.toLowerCase().trim()

    const res = await fetchPixabay(query, 3)

    const { hits } = res

    if (hits?.length > 0) return hits[0].webformatURL

    const firstWord = query.split(/[^a-zA-Z]+/)[0]

    // optional fallback: try first word if multi-word search failed
    if (firstWord !== query) {
      const retryRes = await fetchPixabay(firstWord, 3)
      const { hits: retryHits } = retryRes
      if (retryHits?.length > 0) return retryHits[0].webformatURL
    }

    return null
  } catch (err) {
    console.error('Pixabay image error:', err)
    return null
  }
}

async function fetchPixabay(
  query: string,
  searchCount: number = NUMBER_OF_IMAGES
) {
  const res = await axios.get(PIXABAY_API_URL, {
    params: {
      key: PIXABAY_API_KEY,
      q: `${query} food`,
      image_type: 'photo',
      orientation: 'horizontal',
      per_page: searchCount,
      safesearch: true,
      category: 'food',
    },
  })
  return res.data
}

async function fetchOnError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  item: Item
) {
  const itemName = item.name
  const img = e.currentTarget
  // prevent infinite loops on this element
  if (img.dataset.errored === '1') {
    img.src = searchUrls.DEFAULT_IMAGE
    return
  }
  img.dataset.errored = '1'

  try {
    const isEnglish = translateService.isEnglishWord(itemName)
    const query = isEnglish
      ? itemName
      : await translateService.translate(itemName)

    const next = await imageService.getSingleImage(query)

    // Force a fresh request (avoid cached failures)
    const busted = next + (next.includes('?') ? '&' : '?') + 't=' + Date.now()
    img.src = busted

    const newItem = { ...item, image: next }

    await searchService.handleImageError(newItem)

    return newItem
  } catch {
    img.src = searchUrls.DEFAULT_IMAGE
  }
}

function renderErrorExerciseImage(
  exercise: Exercise,
  exerciseResults: Exercise[],
  renderExercises: (exercises: Exercise[]) => void
) {
  const newExerciseResults = exerciseResults.map((e) =>
    e.exerciseId === exercise.exerciseId ? getFormattedExercise(e) : e
  )
  renderExercises(newExerciseResults as Exercise[])
}

function getFormattedExercise(exercise: Exercise | ExerciseInstructions) {
  return {
    ...exercise,
    image: exerciseImage.ERROR_IMAGE,
  }
}

function getImageFromQuery(query: string) {
  return 'https://www.licious.in/blog/wp-content/uploads/2022/01/eggs-1.jpg'
}
