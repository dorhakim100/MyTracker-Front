import type { ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import {
  customIconGlyphs,
  type CustomIconName,
  type GlyphSize,
} from './glyphs'

export type { CustomIconName }
export type CustomIconSize = GlyphSize
export type CustomIconVariant = 'subtle' | 'medium' | 'strong'

interface CustomIconProps {
  name?: CustomIconName
  icon?: ReactNode
  children?: ReactNode
  size?: CustomIconSize
  variant?: CustomIconVariant
  padded?: boolean
  className?: string
}

export function CustomIcon({
  name,
  icon,
  children,
  size = 'm',
  variant = 'medium',
  padded = true,
  className = '',
}: CustomIconProps) {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const Glyph = name ? customIconGlyphs[name] : null
  const content =
    icon ??
    children ??
    (Glyph ? (
      <Glyph
        color='inherit'
        size={padded ? undefined : size}
      />
    ) : null)

  if (!content) return null

  if (!padded) {
    return (
      <span
        className={`custom-icon-bare ${prefs.favoriteColor} ${className}`.trim()}
        aria-hidden='true'
      >
        {content}
      </span>
    )
  }

  return (
    <div
      className={`custom-icon-container size-${size} variant-${variant} ${prefs.favoriteColor} ${className}`.trim()}
      aria-hidden='true'
    >
      {content}
    </div>
  )
}
