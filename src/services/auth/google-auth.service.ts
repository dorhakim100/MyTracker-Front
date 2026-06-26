import { httpService, getApiBaseUrl } from '../http.service'

export type GoogleAuthIntent = 'login' | 'connect'

export function getGoogleAuthStartUrl(
  intent: GoogleAuthIntent = 'login',
  returnTo?: string
): string {
  const baseUrl = getApiBaseUrl()
  const url = new URL('auth/google', baseUrl)
  url.searchParams.set('intent', intent)
  if (returnTo) {
    url.searchParams.set('returnTo', returnTo)
  }
  return url.toString()
}

export function startGoogleAuth(intent: GoogleAuthIntent = 'login') {
  window.location.assign(
    getGoogleAuthStartUrl(intent, window.location.pathname)
  )
}

export async function completeGoogleAuth(code: string) {
  try {
    const response = await httpService.post('auth/google/complete', { code })
    return response
  } catch (err) {
    throw err
  }
}
