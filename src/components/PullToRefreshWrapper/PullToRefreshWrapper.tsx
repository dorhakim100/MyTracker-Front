import React from 'react'
import PullToRefresh from 'react-simple-pull-to-refresh'
import { setIsLoading } from '../../store/actions/system.actions'
import { capacitorService } from '../../services/capacitor.service'
import { CircularProgress } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void>
  className?: string
  timeout?: number
}

export function PullToRefreshWrapper({ children, onRefresh, className }: PullToRefreshProps) {



  const handleRefresh = async () => {
      try {
        setIsLoading(true)
        capacitorService.vibrate('Heavy')

        await onRefresh?.()

  

    } catch (error) {
      console.error(error)
    }
  }

  return (<PullToRefresh onRefresh={handleRefresh} 
  
    pullingContent={<div />}
    refreshingContent={<RefreshingContent  />}
  
  className={`${className}`}>
    {children}
  </PullToRefresh>
  )
}

function RefreshingContent(){
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  return <CircularProgress aria-label="Loading…" className={`pull-loader ${prefs.favoriteColor || ''}`} />

}