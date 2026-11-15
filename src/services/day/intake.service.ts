import { httpService } from '../http.service'
import type { ActivityFrame, ActivityPage } from '../../types/health/Activity'

export const intakeService = {
  getPage,
}

function getPage(userId: string, frame: ActivityFrame, end?: string) {
  return httpService.get('day/intake', {
    userId,
    frame,
    ...(end ? { end } : {}),
  }) as Promise<ActivityPage>
}
