import { ImgHTMLAttributes, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { CustomSkeleton } from '../../CustomMui/CustomSkeleton/CustomSkeleton'
import { useCachedImage } from '../../hooks/useCachedImage'
import { RootState } from '../../store/store'

interface CachedImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  url: string
  fallback: string
  className?: string
}

export function CachedImage({
  url,
  fallback,
  className = '',
  alt = '',
  ...imgProps
}: CachedImageProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const { data: isUrlReachable } = useCachedImage(url)
  const [src, setSrc] = useState(url)
  const [hasUsedFallback, setHasUsedFallback] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoading) return

    if (!isUrlReachable) {
      setSrc(fallback)
      setHasUsedFallback(true)
      return
    }

    setSrc(url)
    setHasUsedFallback(false)
  }, [url, fallback, isUrlReachable, isLoading])

  const onLoad = () => {
    setIsLoading(false)
  }

  const onError = () => {
    if (hasUsedFallback) {
      setIsLoading(false)
      return
    }

    setHasUsedFallback(true)
    setSrc(fallback)
    setIsLoading(true)
  }

  return (
    <div className={`cached-image-container ${className}`.trim()}>
      {isLoading && (
        <CustomSkeleton
          variant='rectangular'
          className='cached-image-skeleton'
          isDarkMode={prefs.isDarkMode}
        />
      )}
      <img
        {...imgProps}
        src={src}
        alt={alt}
        className='cached-image'
        onLoad={onLoad}
        onError={onError}
        loading='lazy'
        decoding='async'
        style={{
          ...imgProps.style,
          opacity: isLoading ? 0 : 1,
        }}
      />
    </div>
  )
}
