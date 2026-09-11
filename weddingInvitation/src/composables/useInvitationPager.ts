import { nextTick, onBeforeUnmount, onMounted, reactive, ref, type Ref } from 'vue'
import { InvitationPager, WheelGesture, canScrollWithin, swipeDirection } from '@/utils/paging'

const TURN_MS = 620
const OPEN_MS = 950

export function useInvitationPager(viewport: Ref<HTMLElement | null>, ids: readonly string[]) {
  const pager = reactive(new InvitationPager(ids.length))
  const height = ref(window.innerHeight)
  const wheel = new WheelGesture()
  let turnTimer: ReturnType<typeof setTimeout> | undefined
  let openTimer: ReturnType<typeof setTimeout> | undefined
  let resizeObserver: ResizeObserver | undefined
  let previousRestoration: ScrollRestoration = 'auto'
  let motion: MediaQueryList | undefined
  let focusAfterTurn = false
  let touch: { x: number; y: number; dx: number; dy: number; owner: 'pending' | 'page' | 'content' | 'ignore'; top: number; content: HTMLElement | null; blocked: boolean } | undefined

  const activePanel = () => viewport.value?.querySelector<HTMLElement>(`[data-panel="${pager.index}"]`)
  const contentScroller = () => activePanel()?.querySelector<HTMLElement>('[data-page-scroll]') ?? null
  const zoomed = () => (window.visualViewport?.scale ?? 1) > 1.01

  function syncHash(): void {
    history.replaceState(history.state, '', `${location.pathname}${location.search}#${ids[pager.index]}`)
  }

  function updateOverflow(): void {
    viewport.value?.querySelectorAll<HTMLElement>('[data-page-scroll]').forEach(element => {
      element.classList.toggle('has-overflow', element.scrollHeight > element.clientHeight + 2)
    })
  }

  function settle(): void {
    clearTimeout(turnTimer)
    pager.settle()
    void nextTick(() => {
      updateOverflow()
      if (focusAfterTurn) activePanel()?.querySelector<HTMLElement>('[data-page-title]')?.focus({ preventScroll: true })
      focusAfterTurn = false
    })
  }

  function afterTurn(focus: boolean): void {
    focusAfterTurn = focus
    syncHash()
    const focused = document.activeElement
    if (focused instanceof HTMLElement && viewport.value?.contains(focused)) focused.blur()
    const scroller = contentScroller()
    if (scroller) scroller.scrollTop = 0
    if (motion?.matches) settle()
    else turnTimer = setTimeout(settle, TURN_MS)
  }

  function goTo(index: number, focus = false): void {
    if (pager.goTo(index)) afterTurn(focus)
  }

  function openEnvelope(): void {
    if (!pager.beginOpening()) return
    const finish = () => {
      if (pager.finishOpening()) afterTurn(true)
    }
    if (motion?.matches) finish()
    else openTimer = setTimeout(finish, OPEN_MS)
  }

  function updateHeight(): void {
    // Pinch zoom must not resize/reflow the invitation beneath the user's fingers.
    if (zoomed()) return
    height.value = Math.round(window.visualViewport?.height ?? window.innerHeight)
    if (pager.phase === 'turning') settle()
    void nextTick(updateOverflow)
  }

  function onWheel(event: WheelEvent): void {
    if (event.ctrlKey || event.metaKey || zoomed() || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height.value : 1)
    const scroller = contentScroller()
    const innerScroll = (pager.phase === 'sealed' || pager.phase === 'idle') && scroller
      && canScrollWithin(scroller.scrollTop, scroller.scrollHeight, scroller.clientHeight, delta)
    const direction = wheel.feed(delta, performance.now(), Boolean(innerScroll) || pager.phase !== 'idle')
    if (innerScroll) {
      // Scroll the current page even when the pointer is over its header/footer.
      event.preventDefault()
      scroller.scrollTop += delta
      return
    }
    event.preventDefault()
    if (direction) goTo(pager.index + direction)
  }

  function onTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1 || zoomed()) { touch = undefined; return }
    const point = event.touches[0]!
    const content = contentScroller()
    touch = { x: point.clientX, y: point.clientY, dx: 0, dy: 0, owner: 'pending', top: content?.scrollTop ?? 0, content, blocked: pager.phase !== 'idle' }
  }

  function onTouchMove(event: TouchEvent): void {
    if (!touch) return
    if (event.touches.length !== 1 || zoomed()) { touch = undefined; return }
    const point = event.touches[0]!
    touch.dx = point.clientX - touch.x
    touch.dy = point.clientY - touch.y
    if (touch.owner === 'pending' && Math.max(Math.abs(touch.dx), Math.abs(touch.dy)) > 8) {
      if (Math.abs(touch.dx) > Math.abs(touch.dy)) touch.owner = 'ignore'
      else if (touch.content && canScrollWithin(touch.top, touch.content.scrollHeight, touch.content.clientHeight, -touch.dy)) touch.owner = 'content'
      else touch.owner = 'page'
    }
    if (touch.owner === 'page' || touch.owner === 'content') {
      if (event.cancelable) event.preventDefault()
      if (touch.owner === 'content' && touch.content) touch.content.scrollTop = touch.top - touch.dy
    }
  }

  function onTouchEnd(): void {
    const gesture = touch
    touch = undefined
    if (!gesture || gesture.blocked || gesture.owner !== 'page') return
    const direction = swipeDirection(gesture.dx, gesture.dy)
    if (direction) goTo(pager.index + direction)
  }

  function onTouchCancel(): void { touch = undefined }

  function onKey(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey || zoomed()) return
    const target = event.target as HTMLElement | null
    if (target?.closest('input, textarea, select, [contenteditable="true"], button, a') && event.key === ' ') return
    if (target?.closest('input, textarea, select, [contenteditable="true"]')) return
    const directions: Record<string, number> = { ArrowDown: 1, PageDown: 1, ' ': event.shiftKey ? -1 : 1, ArrowUp: -1, PageUp: -1 }
    const direction = directions[event.key]
    if (direction === undefined && event.key !== 'Home' && event.key !== 'End') return
    event.preventDefault()
    if (event.repeat) return
    const scroller = contentScroller()
    if ((pager.phase === 'sealed' || pager.phase === 'idle') && direction && scroller && canScrollWithin(scroller.scrollTop, scroller.scrollHeight, scroller.clientHeight, direction)) {
      scroller.scrollTop += direction * (event.key.startsWith('Arrow') ? 60 : scroller.clientHeight * .8)
      return
    }
    if (pager.phase !== 'idle') return
    goTo(event.key === 'Home' ? 0 : event.key === 'End' ? ids.length - 1 : pager.index + direction!, true)
  }

  function indexForHash(hash: string): number {
    if (hash === '#countdown' || hash === '#navigation') return ids.length - 1
    return ids.indexOf(hash.replace(/^#/, ''))
  }

  function onLinkClick(event: MouseEvent): void {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
    if (!anchor) return
    event.preventDefault()
    goTo(indexForHash(anchor.hash), true)
  }

  function onHashChange(): void {
    const target = indexForHash(location.hash)
    goTo(target)
    syncHash()
    // Fragment navigation must never physically scroll the translated track.
    if (viewport.value) viewport.value.scrollTop = 0
    window.scrollTo(0, 0)
  }

  function onMotionChange(): void {
    if (!motion?.matches) return
    if (pager.phase === 'opening') {
      clearTimeout(openTimer)
      if (pager.finishOpening()) afterTurn(true)
    } else if (pager.phase === 'turning') settle()
  }

  onMounted(() => {
    previousRestoration = history.scrollRestoration
    history.scrollRestoration = 'manual'
    syncHash()
    window.scrollTo(0, 0)
    updateHeight()
    motion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (motion?.addEventListener) motion.addEventListener('change', onMotionChange)
    else motion?.addListener(onMotionChange)
    const element = viewport.value
    element?.addEventListener('wheel', onWheel, { passive: false })
    element?.addEventListener('touchstart', onTouchStart, { passive: true })
    element?.addEventListener('touchmove', onTouchMove, { passive: false })
    element?.addEventListener('touchend', onTouchEnd)
    element?.addEventListener('touchcancel', onTouchCancel)
    window.addEventListener('keydown', onKey)
    window.addEventListener('hashchange', onHashChange)
    window.addEventListener('resize', updateHeight)
    window.visualViewport?.addEventListener('resize', updateHeight)
    if ('ResizeObserver' in window && element) {
      resizeObserver = new ResizeObserver(updateOverflow)
      element.querySelectorAll('[data-page-scroll]').forEach(node => resizeObserver?.observe(node))
    }
  })

  onBeforeUnmount(() => {
    clearTimeout(turnTimer)
    clearTimeout(openTimer)
    resizeObserver?.disconnect()
    history.scrollRestoration = previousRestoration
    const element = viewport.value
    element?.removeEventListener('wheel', onWheel)
    element?.removeEventListener('touchstart', onTouchStart)
    element?.removeEventListener('touchmove', onTouchMove)
    element?.removeEventListener('touchend', onTouchEnd)
    element?.removeEventListener('touchcancel', onTouchCancel)
    window.removeEventListener('keydown', onKey)
    window.removeEventListener('hashchange', onHashChange)
    window.removeEventListener('resize', updateHeight)
    window.visualViewport?.removeEventListener('resize', updateHeight)
    if (motion?.removeEventListener) motion.removeEventListener('change', onMotionChange)
    else motion?.removeListener(onMotionChange)
  })

  return { pager, height, openEnvelope, goTo, onLinkClick }
}
