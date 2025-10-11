import axios from 'axios'

const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY
const PIXABAY_API_URL = 'https://pixabay.com/api/'

const NUMBER_OF_IMAGES = 40

export const imageService = {
  getImage,
  getSingleImage,
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
      q: query,
      image_type: 'photo',
      orientation: 'horizontal',
      per_page: searchCount,
      safesearch: true,
    },
  })
  return res.data
}
