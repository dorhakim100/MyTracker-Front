import { PropsWithChildren, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
} from '@ionic/react'
import { RootState } from '../../store/store'

export type PullToRefreshPageProps = PropsWithChildren<{
  /** Called when user pulls to refresh; wrapper completes the refresher after this resolves. */
  onRefresh?: () => void | Promise<void>
  /** Classes merged onto `IonContent` (e.g. `page-container dashboard-container`). */
  className?: string
  /** Set false to hide pull-to-refresh (e.g. web). Default true. */
  pullToRefresh?: boolean
  /** Adds Ionic `ion-padding` utility. Default true. */
  ionPadding?: boolean
}>

export function PullToRefreshPage({
  children,
  onRefresh,
  className = '',
  pullToRefresh = true,
  ionPadding = true,
}: PullToRefreshPageProps) {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const themeClass = [
    'pull-to-refresh-page__content',
    ionPadding ? 'ion-padding' : '',
    prefs.isDarkMode ? 'dark-mode' : '',
    prefs.favoriteColor || '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const handleIonRefresh = useCallback(
    async (event: RefresherCustomEvent) => {
      try {
        await onRefresh?.()
      } finally {
        event.detail.complete()
      }
    },
    [onRefresh]
  )

  return (
    <IonContent className={themeClass}>
      {pullToRefresh && onRefresh ? (
        <IonRefresher
          slot='fixed'
          onIonRefresh={handleIonRefresh}
          className={prefs.favoriteColor || ''}
        >
          <IonRefresherContent />
        </IonRefresher>
      ) : null}
      {children}
    </IonContent>
  )
}
