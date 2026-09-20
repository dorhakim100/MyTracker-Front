import { httpService } from '../http.service'
import { SessionStatsRecap } from '../../types/stats/Stats'

const KEY = 'stats'

export const statsService = {
  openFrame,
  finish,
  getRecap,
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
