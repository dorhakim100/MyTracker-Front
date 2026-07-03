import type { Socket } from 'socket.io-client'
import {
  isHealthSocketPayload,
  type HealthSocketPayload,
} from './health-socket.types'
import { applyHealthSnapshot } from '../../store/actions/health.actions'
import { healthService } from '../health/health.service'

const HEALTH_UPDATE_EVENT = 'health:update'
const HEALTH_SNAPSHOT_EVENT = 'health:snapshot'

async function handleHealthPayload(payload: unknown) {
  if (!healthService.isGoogleHealthPlatform()) {
    return
  }

  if (!isHealthSocketPayload(payload)) {
    return
  }

  await applyHealthSnapshot(payload)
}

export function registerHealthSocketHandlers(socket: Socket) {
  socket.on(HEALTH_UPDATE_EVENT, handleHealthPayload)
  socket.on(HEALTH_SNAPSHOT_EVENT, handleHealthPayload)
}

export function unregisterHealthSocketHandlers(socket: Socket) {
  socket.off(HEALTH_UPDATE_EVENT, handleHealthPayload)
  socket.off(HEALTH_SNAPSHOT_EVENT, handleHealthPayload)
}

export type { HealthSocketPayload }
