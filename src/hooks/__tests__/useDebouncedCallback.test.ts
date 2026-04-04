import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDebouncedCallback } from '../useDebouncedCallback'

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounces the callback by the specified delay', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 500))

    act(() => {
      result.current.debouncedFn('a')
      result.current.debouncedFn('b')
      result.current.debouncedFn('c')
    })

    expect(callback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('c')
  })

  it('uses the default 500ms delay when none is provided', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback))

    act(() => {
      result.current.debouncedFn()
    })

    act(() => {
      vi.advanceTimersByTime(499)
    })
    expect(callback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('respects a custom delay', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 200))

    act(() => {
      result.current.debouncedFn()
    })

    act(() => {
      vi.advanceTimersByTime(199)
    })
    expect(callback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('flush() fires the pending callback immediately', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 500))

    act(() => {
      result.current.debouncedFn('flushed')
    })
    expect(callback).not.toHaveBeenCalled()

    act(() => {
      result.current.flush()
    })
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('flushed')
  })

  it('flush() is a no-op when nothing is pending', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 500))

    act(() => {
      result.current.flush()
    })
    expect(callback).not.toHaveBeenCalled()
  })

  it('cancel() discards the pending callback', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 500))

    act(() => {
      result.current.debouncedFn('cancelled')
    })

    act(() => {
      result.current.cancel()
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('flushes on unmount so no data is lost', () => {
    const callback = vi.fn()
    const { result, unmount } = renderHook(() =>
      useDebouncedCallback(callback, 500)
    )

    act(() => {
      result.current.debouncedFn('unmount-value')
    })
    expect(callback).not.toHaveBeenCalled()

    unmount()

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('unmount-value')
  })

  it('always calls the latest callback ref (no stale closures)', () => {
    let counter = 0
    const firstCallback = vi.fn(() => counter++)
    const secondCallback = vi.fn(() => (counter += 10))

    const { result, rerender } = renderHook(
      ({ cb }) => useDebouncedCallback(cb, 500),
      { initialProps: { cb: firstCallback } }
    )

    act(() => {
      result.current.debouncedFn()
    })

    rerender({ cb: secondCallback })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(firstCallback).not.toHaveBeenCalled()
    expect(secondCallback).toHaveBeenCalledTimes(1)
    expect(counter).toBe(10)
  })

  it('resets the debounce timer on subsequent calls', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 500))

    act(() => {
      result.current.debouncedFn('first')
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    act(() => {
      result.current.debouncedFn('second')
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(callback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('second')
  })
})
