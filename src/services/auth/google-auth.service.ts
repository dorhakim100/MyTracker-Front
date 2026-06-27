import { Capacitor } from '@capacitor/core'
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in'
import { httpService, getApiBaseUrl } from '../http.service'
import { User } from '../../types/user/User'

export type GoogleAuthIntent = 'login' | 'connect'

export type GoogleNativeLoginResult = {
  user: User
  loginToken: string
}

export type GoogleNativeConnectResult = {
  connected: true
}

const GOOGLE_SIGN_IN_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly',
]

let googleSignInInitialized = false

function getGoogleWebClientId() {
  const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID
  if (!clientId) {
    throw new Error('VITE_GOOGLE_OAUTH_CLIENT_ID is not configured')
  }
  return clientId
}

async function ensureNativeGoogleSignInInitialized() {
  if (googleSignInInitialized) return

  await GoogleSignIn.initialize({
    clientId: getGoogleWebClientId(),
    scopes: GOOGLE_SIGN_IN_SCOPES,
  })

  googleSignInInitialized = true
}

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

async function runNativeGoogleSignIn(
  intent: GoogleAuthIntent,
  userId?: string
) {
  await ensureNativeGoogleSignInInitialized()

  const result = await GoogleSignIn.signIn()

  if (!result.serverAuthCode || !result.idToken) {
    throw new Error('Google Sign-In did not return authorization data')
  }

  return httpService.post('auth/google/native-exchange', {
    serverAuthCode: result.serverAuthCode,
    idToken: result.idToken,
    intent,
    userId,
  })
}

export async function startGoogleAuth(
  intent: GoogleAuthIntent = 'login'
): Promise<GoogleNativeLoginResult | void> {
  if (Capacitor.isNativePlatform()) {
    const result = await runNativeGoogleSignIn(intent)
    if (!result?.user || !result?.loginToken) {
      throw new Error('Google login did not return a session')
    }
    return result as GoogleNativeLoginResult
  }

  window.location.assign(
    getGoogleAuthStartUrl(intent, window.location.pathname)
  )
}

export async function startGoogleHealthConnect({
  userId,
  returnTo = '/',
}: {
  userId: string
  returnTo?: string
}): Promise<GoogleNativeConnectResult | void> {
  if (Capacitor.isNativePlatform()) {
    const result = await runNativeGoogleSignIn('connect', userId)
    if (!result?.connected) {
      throw new Error('Google Health connect did not complete')
    }
    return result as GoogleNativeConnectResult
  }

  try {
    const { url } = await httpService.post('auth/google/connect-url', {
      userId,
      returnTo,
    })
    window.location.assign(url)
  } catch (err) {
    throw err
  }
}

export async function completeGoogleAuth(code: string) {
  try {
    const response = await httpService.post('auth/google/complete', { code })
    return response
  } catch (err) {
    throw err
  }
}
