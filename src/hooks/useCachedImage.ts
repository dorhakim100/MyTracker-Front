import { useQuery } from '@tanstack/react-query'
import { imageCacheService } from '../services/image/image-cache.service'
import { queryKeys } from '../lib/react-query/queryKey'

export function useCachedImage(url: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.image.byUrl(url),
    queryFn: () => imageCacheService.loadImage(url),
    enabled: enabled && Boolean(url),
    staleTime: Infinity,
  })
}
