import Axios from 'axios'
import type { AxiosError } from 'axios'
import { Capacitor, CapacitorHttp } from '@capacitor/core'

const ENV_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined
const ENV_BASE_URL_WEB = import.meta.env.VITE_API_BASE_URL_WEB as
  | string
  | undefined
const ENV_BASE_URL_IOS = import.meta.env.VITE_API_BASE_URL_IOS as
  | string
  | undefined
const ENV_BASE_URL_ANDROID = import.meta.env.VITE_API_BASE_URL_ANDROID as
  | string
  | undefined

function resolveBaseUrl(): string {
  const platform = Capacitor.getPlatform() // 'ios' | 'android' | 'web'
  let platformEnv: string | undefined = undefined

  console.log('platform', platform)
  console.log('ENV_BASE_URL', ENV_BASE_URL)
  console.log('ENV_BASE_URL_WEB', ENV_BASE_URL_WEB)
  console.log('ENV_BASE_URL_IOS', ENV_BASE_URL_IOS)
  console.log('ENV_BASE_URL_ANDROID', ENV_BASE_URL_ANDROID)

  switch (platform) {
    case 'ios':
      platformEnv = ENV_BASE_URL_IOS
      break
    case 'android':
      platformEnv = ENV_BASE_URL_ANDROID
      break
    case 'web':
      platformEnv = ENV_BASE_URL_WEB
      break
    default:
      platformEnv = ENV_BASE_URL
  }

  let resolved = platformEnv || ENV_BASE_URL
  if (!resolved) {
    resolved = import.meta.env.PROD ? '/api/' : '//localhost:3030/api/'
  }
  return resolved
}

const axios = Axios.create({ withCredentials: true })

// Persist native cookie between requests when using CapacitorHttp
let nativeCookie: string | null = null

export const httpService = {
  get(endpoint: string, data?: unknown) {
    return ajax(endpoint, 'GET', data)
  },
  post(endpoint: string, data?: unknown) {
    return ajax(endpoint, 'POST', data)
  },
  put(endpoint: string, data?: unknown) {
    return ajax(endpoint, 'PUT', data)
  },
  delete(endpoint: string, data?: unknown) {
    return ajax(endpoint, 'DELETE', data)
  },
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData
}

function toCapacitorParams(
  params?: Record<string, unknown>
): Record<string, string | string[]> | undefined {
  if (!params) return undefined
  const out: Record<string, string> = {}
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    out[key] = String(value)
  })
  return out
}

async function ajax(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data: unknown = null
) {
  const url = `${resolveBaseUrl()}${endpoint}`
  const params = method === 'GET' && isPlainObject(data) ? data : undefined

  const options = { url, method, data, params }

  try {
    const isNative = Capacitor.getPlatform() !== 'web'
    const hasNativeHttp = Capacitor.isPluginAvailable('CapacitorHttp')

    if (isNative && hasNativeHttp) {
      const headers: Record<string, string> = {
        Accept: 'application/json, text/plain, */*',
      }
      if (nativeCookie) headers['Cookie'] = nativeCookie
      if (method !== 'GET' && !isFormData(data) && isPlainObject(data)) {
        headers['Content-Type'] = 'application/json'
      }

      const capRes = await CapacitorHttp.request({
        url,
        method,
        params: toCapacitorParams(params),
        data:
          method !== 'GET'
            ? isFormData(data)
              ? (data as unknown as Record<string, unknown>)
              : isPlainObject(data)
              ? (data as Record<string, unknown>)
              : (data as Record<string, unknown> | undefined)
            : undefined,
        headers,
      })

      // Capture Set-Cookie from backend and reuse on subsequent native calls
      const setCookieHeader =
        (capRes.headers &&
          ((capRes.headers as Record<string, string>)['set-cookie'] ||
            (capRes.headers as Record<string, string>)['Set-Cookie'])) ||
        null
      if (setCookieHeader && typeof setCookieHeader === 'string') {
        nativeCookie = setCookieHeader.split(';')[0]
      }

      return capRes.data
    }

    const res = await axios(options)
    return res.data
  } catch (err: unknown) {
    // console.log(
    //   `Had Issues ${method}ing to the backend, endpoint: ${endpoint}, with data: `,
    //   data
    // )
    console.dir(err)
    const axErr = err as AxiosError
    if (axErr.response && axErr.response.status === 401) {
      sessionStorage.clear()
      const isNative = Capacitor.getPlatform() !== 'web'
      if (!isNative) window.location.assign('/')
    }
    throw err
  }
}
