import axios from 'axios'

const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY
const PIXABAY_API_URL = 'https://pixabay.com/api/'

const IMAGE_SIZE = '250x250'
const NUMBER_OF_IMAGES = 40

export const imageService = {
  getImage,
  getSingleImage,
}

async function getImage(query: string) {
  query = query.toLocaleLowerCase()
  //   const dashedQuery = query.replace(/ /g, '-')

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
  const res = await fetchPixabay(query, 1)
  const { hits } = res
  return hits[0]?.webformatURL
}

function getImageByNumber(results: string[], imageNumber: number = 0) {
  return `https://spoonacular.com/cdn/ingredients_${IMAGE_SIZE}/${results[imageNumber].image}`
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
