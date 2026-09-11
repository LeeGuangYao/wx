import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useInvitationPager } from './useInvitationPager'

const hooks = vi.hoisted(() => ({ mount: [] as (() => void)[], unmount: [] as (() => void)[] }))
vi.mock('vue', async importOriginal => ({
  ...await importOriginal<typeof import('vue')>(),
  onMounted: (callback: () => void) => hooks.mount.push(callback),
  onBeforeUnmount: (callback: () => void) => hooks.unmount.push(callback),
}))

// Event-target harness: exercise the real input listeners without a browser dependency.
class ElementHarness extends EventTarget {
  scrollTop = 0
  scrollHeight = 950
  clientHeight = 300
  classList = { toggle: vi.fn() }
  focus = vi.fn()
  blur = vi.fn()
  querySelector = vi.fn()
  querySelectorAll = vi.fn(() => [])
  contains = vi.fn(() => false)
  closest = vi.fn(() => null)
}

let viewport: ElementHarness
let content: ElementHarness
let browser: EventTarget & { innerHeight: number; matchMedia: () => unknown; scrollTo: () => void }
let reduce = false

function setup() {
  const result = useInvitationPager(ref(viewport as unknown as HTMLElement), ['cover', 'our-album', 'our-days', 'our-forever', 'wedding-day'])
  hooks.mount.forEach(callback => callback())
  return result
}

function dispatch(target: EventTarget, type: string, properties: Record<string, unknown>) {
  const event = Object.assign(new Event(type, { cancelable: true }), properties)
  if (type === 'keydown') Object.defineProperty(event, 'target', { value: viewport })
  target.dispatchEvent(event)
  return event
}

beforeEach(() => {
  vi.useFakeTimers()
  hooks.mount.length = 0
  hooks.unmount.length = 0
  reduce = false
  content = new ElementHarness()
  const panel = new ElementHarness()
  panel.querySelector.mockReturnValue(content)
  viewport = new ElementHarness()
  viewport.querySelector.mockReturnValue(panel)
  browser = Object.assign(new EventTarget(), {
    innerHeight: 568,
    matchMedia: () => ({ matches: reduce, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    scrollTo: vi.fn(),
  })
  vi.stubGlobal('window', browser)
  vi.stubGlobal('HTMLElement', ElementHarness)
  vi.stubGlobal('document', { activeElement: null })
  vi.stubGlobal('history', { state: null, scrollRestoration: 'auto', replaceState: vi.fn() })
  vi.stubGlobal('location', { pathname: '/wedding/', search: '', hash: '#wedding-day' })
})

afterEach(() => {
  hooks.unmount.forEach(callback => callback())
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('invitation input integration', () => {
  it('starts sealed at cover despite an old hash and allows wheel scrolling inside an overflowing cover', () => {
    const { pager } = setup()
    expect(history.replaceState).toHaveBeenCalledWith(null, '', '/wedding/#cover')
    dispatch(viewport, 'wheel', { deltaY: 120, deltaX: 0, deltaMode: 0 })
    expect(content.scrollTop).toBe(120)
    expect(pager.index).toBe(0)
    expect(pager.opened).toBe(false)
  })

  it('allows keyboard reading of a short sealed cover without unlocking another page', () => {
    const { pager } = setup()
    dispatch(browser, 'keydown', { key: 'PageDown' })
    expect(content.scrollTop).toBe(240)
    content.scrollTop = 650
    dispatch(browser, 'keydown', { key: 'PageDown' })
    dispatch(browser, 'keydown', { key: 'End' })
    expect(pager.index).toBe(0)
    expect(pager.opened).toBe(false)
  })

  it('waits for opening, then starts one turn and ignores duplicate clicks', () => {
    const { pager, openEnvelope } = setup()
    openEnvelope()
    openEnvelope()
    vi.advanceTimersByTime(949)
    expect(pager.index).toBe(0)
    vi.advanceTimersByTime(1)
    expect(pager.index).toBe(1)
    expect(pager.phase).toBe('turning')
    vi.advanceTimersByTime(620)
    expect(pager.phase).toBe('idle')
  })

  it('opens and turns immediately with reduced motion', () => {
    reduce = true
    const { pager, openEnvelope, goTo } = setup()
    openEnvelope()
    expect(pager.index).toBe(1)
    expect(pager.phase).toBe('idle')
    goTo(2)
    expect(pager.index).toBe(2)
    expect(pager.phase).toBe('idle')
  })

  it('keeps a content swipe on its page and uses a fresh edge swipe for the next page', () => {
    reduce = true
    const { pager, openEnvelope } = setup()
    openEnvelope()
    dispatch(viewport, 'touchstart', { touches: [{ clientX: 100, clientY: 500 }] })
    dispatch(viewport, 'touchmove', { touches: [{ clientX: 102, clientY: 100 }] })
    dispatch(viewport, 'touchend', {})
    expect(content.scrollTop).toBe(400)
    expect(pager.index).toBe(1)
    content.scrollTop = 650
    dispatch(viewport, 'touchstart', { touches: [{ clientX: 100, clientY: 500 }] })
    dispatch(viewport, 'touchmove', { touches: [{ clientX: 102, clientY: 100 }] })
    dispatch(viewport, 'touchend', {})
    expect(pager.index).toBe(2)
  })

  it('does not interpret a pinch as a page swipe', () => {
    reduce = true
    const { pager, openEnvelope } = setup()
    openEnvelope()
    content.scrollHeight = content.clientHeight
    dispatch(viewport, 'touchstart', { touches: [{ clientX: 100, clientY: 500 }] })
    dispatch(viewport, 'touchmove', { touches: [{ clientX: 100, clientY: 200 }, { clientX: 220, clientY: 250 }] })
    dispatch(viewport, 'touchend', {})
    expect(pager.index).toBe(1)
  })
})
