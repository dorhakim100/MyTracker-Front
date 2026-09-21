const sheetZStack: number[] = []

export function pushSlideDialogZIndex(zIndex: number) {
  sheetZStack.push(zIndex)
}

export function popSlideDialogZIndex(zIndex: number) {
  const index = sheetZStack.lastIndexOf(zIndex)
  if (index >= 0) {
    sheetZStack.splice(index, 1)
  }
}

export function getTopSlideDialogZIndex() {
  return sheetZStack[sheetZStack.length - 1] ?? 0
}
