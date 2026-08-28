import type { ComponentType } from 'react'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import SvgIcon from '@mui/material/SvgIcon'
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded'
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded'
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded'
import MonitorHeartRoundedIcon from '@mui/icons-material/MonitorHeartRounded'
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded'

export type GlyphSize = 's' | 'm' | 'l' | 'xl'

const glyphSizeRem: Record<GlyphSize, string> = {
  s: '1.1rem',
  m: '1.5rem',
  l: '1.75rem',
  xl: '2rem',
}

export type GlyphProps = SvgIconProps & { size?: GlyphSize }

function GlyphIcon({ size, sx, ...props }: GlyphProps) {
  const rem = size ? glyphSizeRem[size] : undefined

  return (
    <SvgIcon
      viewBox='0 0 24 24'
      {...props}
      sx={[
        rem ? { fontSize: rem, width: rem, height: rem } : null,
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  )
}

export type CustomIconName =
  | 'workout'
  | 'meals'
  | 'goals'
  | 'favorites'
  | 'bmr'
  | 'health'
  | 'preferences'
  | 'trainees'
  | 'instructions'
  | 'macros'
  | 'scale'
  | 'steps'
  | 'burnedCalories'
  | 'distance'
  | 'floors'
  | 'calories'
  | 'distribution'

function GoalsGlyph(props: GlyphProps) {
  return (
    <GlyphIcon {...props}>
      <circle
        cx='12'
        cy='12'
        r='8.75'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.7'
      />
      <circle
        cx='12'
        cy='12'
        r='5.2'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.7'
      />
      <circle
        cx='12'
        cy='12'
        r='1.85'
        fill='currentColor'
      />
    </GlyphIcon>
  )
}

function CaloriesGlyph(props: GlyphProps) {
  return (
    <GlyphIcon {...props}>
      <path
        fill='none'
        stroke='currentColor'
        strokeWidth='1.55'
        strokeLinecap='round'
        d='M8.1 4.15c.28 1.2-.52 1.75-.48 2.9.05 1.05.82 1.5.78 2.55'
      />
      <path
        fill='none'
        stroke='currentColor'
        strokeWidth='1.55'
        strokeLinecap='round'
        d='M12 3.1c.3 1.35-.58 1.95-.52 3.25.06 1.15.92 1.65.86 2.85'
      />
      <path
        fill='none'
        stroke='currentColor'
        strokeWidth='1.55'
        strokeLinecap='round'
        d='M15.8 4.35c.26 1.12-.5 1.68-.46 2.78.05 1 .78 1.42.74 2.42'
      />
      <path d='M3.9 13.15h16.2a1 1 0 0 1 0 2h-.18C19.25 19.35 16 21.4 12 21.4S4.75 19.35 4.08 15.15H3.9a1 1 0 1 1 0-2Z' />
    </GlyphIcon>
  )
}

function MacrosGlyph(props: GlyphProps) {
  return (
    <GlyphIcon {...props}>
      <rect
        x='3.8'
        y='11'
        width='4.5'
        height='9.5'
        rx='1.15'
        opacity='0.4'
      />
      <rect
        x='9.75'
        y='5'
        width='4.5'
        height='15.5'
        rx='1.15'
      />
      <rect
        x='15.7'
        y='8.2'
        width='4.5'
        height='12.3'
        rx='1.15'
        opacity='0.68'
      />
    </GlyphIcon>
  )
}

export function FloorsGlyph(props: GlyphProps) {
  return (
    <GlyphIcon {...props}>
      <path d='M4 20V13.5h4V10h4V6.5h4V3h4v17H4z' />
    </GlyphIcon>
  )
}

function DistributionGlyph(props: GlyphProps) {
  return (
    <GlyphIcon {...props}>
      <path d='M12 6.75 L 12 2 A 10 10 0 0 1 19.88 18.157 L 16.137 15.232 A 5.25 5.25 0 0 0 12 6.75 Z' />
      <path
        d='M16.137 15.232 L 19.88 18.157 A 10 10 0 0 1 4.12 18.157 L 7.863 15.232 A 5.25 5.25 0 0 0 16.137 15.232 Z'
        opacity='0.62'
      />
      <path
        d='M7.863 15.232 L 4.12 18.157 A 10 10 0 0 1 12 2 L 12 6.75 A 5.25 5.25 0 0 0 7.863 15.232 Z'
        opacity='0.34'
      />
    </GlyphIcon>
  )
}

function ScaleGlyph(props: GlyphProps) {
  return (
    <GlyphIcon {...props}>
      <path
        fillRule='evenodd'
        d='M7 4.6h10A3.4 3.4 0 0 1 20.4 8v10A3.4 3.4 0 0 1 17 21.4H7A3.4 3.4 0 0 1 3.6 18V8A3.4 3.4 0 0 1 7 4.6Zm1.55 2.35h6.9c.64 0 1.15.51 1.15 1.15v2.75c0 .64-.51 1.15-1.15 1.15h-6.9c-.64 0-1.15-.51-1.15-1.15V8.1c0-.64.51-1.15 1.15-1.15Z'
      />
      <path d='M12 13.95c.34 0 .65.18.82.47l1.9 3.22a.8.8 0 1 1-1.38.81L12 16.15l-1.34 2.3a.8.8 0 1 1-1.38-.81l1.9-3.22a.95.95 0 0 1 .82-.47Z' />
    </GlyphIcon>
  )
}

export function StepsGlyph(props: GlyphProps) {
  return (
    <GlyphIcon {...props}>
      <g transform='translate(6.35 14.7) rotate(-22)'>
        <ellipse
          cx='0'
          cy='2.4'
          rx='2.2'
          ry='3.2'
        />
        <ellipse
          cx='0.35'
          cy='-2.1'
          rx='1.8'
          ry='2.4'
        />
      </g>
      <g transform='translate(15.7 8) rotate(16)'>
        <ellipse
          cx='0'
          cy='2.4'
          rx='2.2'
          ry='3.2'
        />
        <ellipse
          cx='0.35'
          cy='-2.1'
          rx='1.8'
          ry='2.4'
        />
      </g>
    </GlyphIcon>
  )
}

export function DistanceGlyph(props: GlyphProps) {
  return (
    <GlyphIcon {...props}>
      <path
        fill='none'
        stroke='currentColor'
        strokeWidth='1.7'
        strokeLinecap='round'
        d='M3.7 18.35c2.7-5 4.35-4.35 7.05-2.15 2.55 2.05 4.2 1.15 6.35-2.7'
      />
      <path
        fillRule='evenodd'
        d='M17.15 2.45c-2.5 0-4.5 1.95-4.5 4.4 0 3.3 4.5 7.85 4.5 7.85s4.5-4.55 4.5-7.85c0-2.45-2-4.4-4.5-4.4Zm0 6a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z'
      />
    </GlyphIcon>
  )
}

export function BurnedCaloriesGlyph({ size, sx, ...props }: GlyphProps) {
  const rem = size ? glyphSizeRem[size] : undefined

  return (
    <LocalFireDepartmentRoundedIcon
      {...props}
      sx={[
        rem ? { fontSize: rem, width: rem, height: rem } : null,
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  )
}

export const customIconGlyphs: Record<CustomIconName, ComponentType<GlyphProps>> =
  {
    workout: FitnessCenterRoundedIcon,
    meals: RestaurantMenuRoundedIcon,
    goals: GoalsGlyph,
    favorites: FavoriteRoundedIcon,
    bmr: CalculateRoundedIcon,
    health: MonitorHeartRoundedIcon,
    preferences: SettingsRoundedIcon,
    trainees: PersonAddRoundedIcon,
    instructions: AutoStoriesRoundedIcon,
    macros: MacrosGlyph,
    scale: ScaleGlyph,
    steps: StepsGlyph,
    burnedCalories: BurnedCaloriesGlyph,
    distance: DistanceGlyph,
    floors: FloorsGlyph,
    calories: CaloriesGlyph,
    distribution: DistributionGlyph,
  }
