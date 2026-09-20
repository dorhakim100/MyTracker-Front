import { Macros } from '../macros/Macros'
import { Item } from '../item/Item'

export type AiLogMode = 'meal' | 'custom' | 'cant_figure'

export interface AiLogPer100g {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface AiLogLine {
  name: string
  gramsMin: number
  gramsMax: number
  per100g: AiLogPer100g
  source: 'catalog' | 'custom' | 'oil'
  item?: Item
}

export interface AiLogEstimateRequest {
  imageUrl?: string
  text?: string
}

export interface AiLogEstimate {
  mode: AiLogMode
  name: string
  imageUrl?: string
  items: AiLogLine[]
}

export function averageGrams(gramsMin: number, gramsMax: number) {
  return Math.max(1, Math.round((gramsMin + gramsMax) / 2))
}

export function servingsFromGrams(grams: number) {
  return Math.max(0.1, Math.round(grams / 10) / 10)
}

export function scaleMacros(per100g: Macros, grams: number): Macros {
  const factor = grams / 100
  return {
    calories: Math.round(per100g.calories * factor),
    protein: Math.round(per100g.protein * factor),
    carbs: Math.round(per100g.carbs * factor),
    fat: Math.round(per100g.fat * factor),
  }
}

export function toPer100gMacros(totals: Macros, grams: number): Macros {
  const amount = grams || 100
  return {
    calories: Math.round((totals.calories * 100) / amount),
    protein: Math.round((totals.protein * 100) / amount),
    carbs: Math.round((totals.carbs * 100) / amount),
    fat: Math.round((totals.fat * 100) / amount),
  }
}

export function toDisplayedMacros(
  per100g: Macros,
  servingSize: number,
  numberOfServings: number
): Macros {
  return scaleMacros(per100g, (servingSize || 100) * (numberOfServings || 1))
}

export function macrosBand(per100g: Macros, gramsMin: number, gramsMax: number) {
  return {
    min: scaleMacros(per100g, gramsMin),
    max: scaleMacros(per100g, gramsMax),
  }
}
