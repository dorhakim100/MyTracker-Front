import { LoggedToday } from '../../types/loggedToday/LoggedToday'
import { Macros } from '../../types/macros/Macros'

export interface DayProgressMacros {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export type BeyondGoalWarningKey = 'beyondCalories' | 'beyondMacros'

export interface DayProgressPreview {
  goals: DayProgressMacros
  baseline: DayProgressMacros
  diff: DayProgressMacros
  projected: DayProgressMacros
  isBeyondMacros: boolean
  /** i18n key under `macros.*`, or null when under goals. */
  beyondWarningKey: BeyondGoalWarningKey | null
  /** Pale ring segment basis (goal or projected grams). */
  ring: DayProgressMacros
  /** Denominator for fill/blink clamping so shrink wedges still fit. */
  fillDenom: DayProgressMacros
  calorieDelta: number
  hasPendingChange: boolean
}

function sumDayMacros(day: LoggedToday): DayProgressMacros {
  const logs = day.logs || []
  return {
    calories: day.calories ?? logs.reduce((acc, log) => acc + log.macros.calories, 0),
    protein: logs.reduce((acc, log) => acc + log.macros.protein, 0),
    carbs: logs.reduce((acc, log) => acc + log.macros.carbs, 0),
    fat: logs.reduce((acc, log) => acc + log.macros.fat, 0),
  }
}

function addMacros(a: DayProgressMacros, b: DayProgressMacros): DayProgressMacros {
  return {
    calories: a.calories + b.calories,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
  }
}

function subtractMacros(
  a: DayProgressMacros,
  b: DayProgressMacros
): DayProgressMacros {
  return {
    calories: a.calories - b.calories,
    protein: a.protein - b.protein,
    carbs: a.carbs - b.carbs,
    fat: a.fat - b.fat,
  }
}

function toDayProgressMacros(macros: Macros): DayProgressMacros {
  return {
    calories: macros.calories || 0,
    protein: macros.protein || 0,
    carbs: macros.carbs || 0,
    fat: macros.fat || 0,
  }
}

function maxMacros(a: DayProgressMacros, b: DayProgressMacros): DayProgressMacros {
  return {
    calories: Math.max(a.calories, b.calories),
    protein: Math.max(a.protein, b.protein),
    carbs: Math.max(a.carbs, b.carbs),
    fat: Math.max(a.fat, b.fat),
  }
}

function isBeyondMacros(
  projected: DayProgressMacros,
  goals: DayProgressMacros
): boolean {
  return (
    projected.protein > goals.protein ||
    projected.carbs > goals.carbs ||
    projected.fat > goals.fat
  )
}

function isBeyondCalories(
  projected: DayProgressMacros,
  goals: DayProgressMacros
): boolean {
  return projected.calories > goals.calories
}

function isBeyond(
  projected: DayProgressMacros,
  goals: DayProgressMacros
): boolean {
  return isBeyondCalories(projected, goals) || isBeyondMacros(projected, goals)
}

/** Calories overshoot wins when both macros and calories are past goal. */
export function getBeyondGoalWarningKey(
  projected: DayProgressMacros,
  goals: DayProgressMacros
): BeyondGoalWarningKey | null {
  if (isBeyondCalories(projected, goals)) return 'beyondCalories'
  if (isBeyondMacros(projected, goals)) return 'beyondMacros'
  return null
}

/**
 * Pure preview of how an item add/edit changes selected-day macro progress.
 * Never mutates goals — ring/projected values are UI-only.
 */
export function getItemDetailsDayProgressPreview(params: {
  selectedDay: LoggedToday
  goals: DayProgressMacros
  editedMacros: Macros
  /** Original macros when editing an existing log; omit for add. */
  originalMacros?: Macros | null
}): DayProgressPreview {
  const { selectedDay, goals, editedMacros, originalMacros } = params
  const baseline = sumDayMacros(selectedDay)
  const edited = toDayProgressMacros(editedMacros)

  const diff = originalMacros
    ? subtractMacros(edited, toDayProgressMacros(originalMacros))
    : edited

  const projected = addMacros(baseline, diff)
  const beyond = isBeyond(projected, goals)
  const ring = beyond ? projected : goals
  const fillDenom = beyond ? maxMacros(baseline, projected) : goals
  const calorieDelta = Math.round(diff.calories)
  const hasPendingChange =
    Math.round(diff.calories) !== 0 ||
    Math.round(diff.protein) !== 0 ||
    Math.round(diff.carbs) !== 0 ||
    Math.round(diff.fat) !== 0

  return {
    goals,
    baseline,
    diff,
    projected,
    isBeyondMacros: beyond,
    beyondWarningKey: getBeyondGoalWarningKey(projected, goals),
    ring,
    fillDenom,
    calorieDelta,
    hasPendingChange,
  }
}
