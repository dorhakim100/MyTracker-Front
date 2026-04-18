import { ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

interface NativeOnlyProps {
  children: ReactNode
  className?: string
}

export function NativeOnly({ children, className }: NativeOnlyProps) {
  const isNative = useSelector((state: RootState) => state.systemModule.isNative)
  if (!isNative) return null
  return <div className={className}>{children}</div>
}
