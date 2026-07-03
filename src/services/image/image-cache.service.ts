import { queryClient } from '../../lib/react-query/queryClient'
import { queryKeys } from '../../lib/react-query/queryKey'

export const imageCacheService = {
  loadImage,
  prefetchImage,
}

function loadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false)
      return
    }

    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

async function prefetchImage(url: string) {
  if (!url) return false

  return queryClient.fetchQuery({
    queryKey: queryKeys.image.byUrl(url),
    queryFn: () => loadImage(url),
  })
}
