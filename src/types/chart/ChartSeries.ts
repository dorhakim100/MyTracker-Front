import type { LineChartRangeKey } from '../../components/LineChart/LineChartControls'
import type { ExerciseViewBy } from '../../services/set/set.helpers'

export interface ChartSeries {
  labels: string[]
  data: (number | null)[]
}

export interface WeightChartSeries extends ChartSeries {
  movingAverage: (number | null)[]
  previousAverage: number | null
}

export interface SetChartSeries extends ChartSeries {
  secondary: (number | null)[]
}

export interface WeightChartFilter {
  userId?: string
  range: LineChartRangeKey
}

export interface SetChartFilter {
  userId?: string
  exerciseId?: string
  range: LineChartRangeKey
  viewBy: ExerciseViewBy
}
