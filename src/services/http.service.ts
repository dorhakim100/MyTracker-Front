import Axios from 'axios'
import { Capacitor } from '@capacitor/core'

// Get API URL from environment variables or use defaults
const getBaseUrl = (): string => {
  const isNative = Capacitor.isNativePlatform()
  const isProd = import.meta.env.PROD

  console.log(isNative)
  console.log(isProd)
  console.log(import.meta.env.VITE_API_URL)

  // Production: Use environment variable or default to relative path for web, full URL for native
  if (isProd) {
    const prodUrl =
      import.meta.env.VITE_API_URL ||
      (isNative
        ? 'https://interested-selia-dorhakim-444c2d8e.koyeb.app/'
        : '/api/')
    return prodUrl
  }

  // Development: Use environment variable or default based on platform
  const devUrl = import.meta.env.VITE_API_URL
  if (devUrl && isNative) {
    return devUrl
  }

  // Default dev URLs
  if (isNative) {
    // For native dev, you need to use your machine's IP address
    // Example: 'http://192.168.1.100:3030/api/'
    // You can set this via VITE_API_URL environment variable
    console.warn(
      '⚠️  Running on native platform in dev mode. Set VITE_API_URL environment variable with your dev machine IP address.\n' +
        'Example: VITE_API_URL=http://192.168.1.100:3030/api/ npm run dev'
    )
    // Fallback - you should set VITE_API_URL instead
    return 'http://localhost:3030/api/'
  }

  // Web dev default
  return '//localhost:3030/api/'
}

const BASE_URL = getBaseUrl()

console.log('BASE_URL', BASE_URL)

const axios = Axios.create({ withCredentials: true })

export const httpService = {
  get(endpoint: string, data: any) {
    return ajax(endpoint, 'GET', data)
  },
  post(endpoint: string, data: any) {
    return ajax(endpoint, 'POST', data)
  },
  put(endpoint: string, data: any) {
    return ajax(endpoint, 'PUT', data)
  },
  delete(endpoint: string, data: any) {
    return ajax(endpoint, 'DELETE', data)
  },
}

async function ajax(endpoint: string, method = 'GET', data = null) {
  const url = `${BASE_URL}${endpoint}`
  const params = method === 'GET' ? data : null

  const options = { url, method, data, params }

  try {
    const res = await axios(options)
    return res.data
  } catch (err: Error | any) {
    console.dir(err)
    if (err.response && err.response.status === 401) {
      sessionStorage.clear()
      window.location.assign('/')
    }
    throw err
  }
}
