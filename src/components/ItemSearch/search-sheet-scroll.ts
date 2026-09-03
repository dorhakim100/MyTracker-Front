// Anything with overflowing content, including `overflow: hidden` boxes such as
// the sheet itself.
function collectScrollables(from: HTMLElement | null) {
  const found: HTMLElement[] = []
  let node: HTMLElement | null = from
  while (node) {
    if (node.scrollHeight > node.clientHeight + 1) found.push(node)
    node = node.parentElement
  }
  return found
}

export function scrollSheetToTop(from: HTMLElement | null) {
  for (const el of collectScrollables(from)) {
    el.scrollTop = 0
  }
}
