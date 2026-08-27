export function isBarcodeSearchId(searchId?: string) {
  if (!searchId) return false
  return /^\d{8,14}$/.test(searchId)
}

export const itemIdService = {
  isBarcodeSearchId,
}
