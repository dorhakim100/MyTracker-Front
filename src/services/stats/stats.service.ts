import { httpService } from '../http.service'
import { SessionStatsRecap } from '../../types/stats/Stats'
import {
  DistributionSummary,
  DistributionTimeframe,
  WeekMode,
  WeekSummary,
} from '../../types/stats/WorkoutStats'

const KEY = 'stats'

export const statsService = {
  openFrame,
  finish,
  getRecap,
  getWeek,
  getDistribution,
}

async function openFrame(sessionId: string) {
  return httpService.post(`${KEY}/session/${sessionId}/frame/open`, {})
}

async function finish(sessionId: string): Promise<SessionStatsRecap> {
  return httpService.post(
    `${KEY}/session/${sessionId}/finish`,
    {}
  ) as Promise<SessionStatsRecap>
}

async function getRecap(sessionId: string): Promise<SessionStatsRecap> {
  return httpService.get(
    `${KEY}/session/${sessionId}`,
    {}
  ) as Promise<SessionStatsRecap>
}

async function getWeek(forUserId: string, mode: WeekMode) {
  return httpService.get(`${KEY}/week`, {
    forUserId,
    mode,
  }) as Promise<WeekSummary>
}

async function getDistribution(
  forUserId: string,
  timeframe: DistributionTimeframe
) {
  return httpService.get(`${KEY}/distribution`, {
    forUserId,
    timeframe,
    includePrevious: false,
  }) as Promise<DistributionSummary>
}
