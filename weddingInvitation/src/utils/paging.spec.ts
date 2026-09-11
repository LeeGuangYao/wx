import { describe, expect, it } from 'vitest'
import { InvitationPager, WheelGesture, canScrollWithin, swipeDirection } from './paging'

describe('invitation opening and paging', () => {
  it('cannot leave the cover until the envelope finishes opening', () => {
    const pager = new InvitationPager(5)
    expect(pager.goTo(4)).toBe(false)
    expect(pager.finishOpening()).toBe(false)
    expect(pager.beginOpening()).toBe(true)
    expect(pager.beginOpening()).toBe(false)
    expect(pager.goTo(1)).toBe(false)
    expect(pager.index).toBe(0)
    expect(pager.finishOpening()).toBe(true)
    expect(pager.index).toBe(1)
    expect(pager.opened).toBe(true)
  })

  it('ignores repeated input during a turn and allows a new turn afterwards', () => {
    const pager = new InvitationPager(5)
    pager.beginOpening()
    pager.finishOpening()
    expect(pager.goTo(2)).toBe(false)
    pager.settle()
    expect(pager.goTo(2)).toBe(true)
    expect(pager.previousIndex).toBe(1)
    expect(pager.goTo(3)).toBe(false)
    pager.settle()
    expect(pager.goTo(0)).toBe(true)
    pager.settle()
    expect(pager.opened).toBe(true)
    expect(pager.goTo(1)).toBe(true)
  })

  it('rejects invalid targets and creates a sealed state on a fresh visit', () => {
    const pager = new InvitationPager(5)
    pager.beginOpening()
    pager.finishOpening()
    pager.settle()
    for (const index of [-1, 5, 1.5, NaN, 1]) expect(pager.goTo(index)).toBe(false)
    expect(new InvitationPager(5)).toMatchObject({ index: 0, opened: false, phase: 'sealed' })
  })
})

describe('one page per wheel gesture', () => {
  it('accumulates small deltas, suppresses inertia and allows the next gesture', () => {
    const wheel = new WheelGesture()
    expect(wheel.feed(25, 0)).toBe(0)
    expect(wheel.feed(40, 30)).toBe(1)
    for (let time = 60; time <= 1200; time += 30) expect(wheel.feed(100, time)).toBe(0)
    expect(wheel.feed(-70, 1500)).toBe(-1)
  })

  it('never carries a locked or inner-scroll gesture over into a page turn', () => {
    const wheel = new WheelGesture()
    expect(wheel.feed(100, 0, true)).toBe(0)
    expect(wheel.feed(100, 50)).toBe(0)
    expect(wheel.feed(100, 400)).toBe(1)
  })
})

describe('touch and overflow ownership', () => {
  it('only turns for a deliberate vertical swipe', () => {
    expect(swipeDirection(5, -90)).toBe(1)
    expect(swipeDirection(0, 80)).toBe(-1)
    expect(swipeDirection(110, 70)).toBe(0)
    expect(swipeDirection(0, 25)).toBe(0)
  })

  it('allows text to scroll before leaving a short panel', () => {
    expect(canScrollWithin(0, 900, 500, 1)).toBe(true)
    expect(canScrollWithin(0, 900, 500, -1)).toBe(false)
    expect(canScrollWithin(200, 900, 500, -1)).toBe(true)
    expect(canScrollWithin(400, 900, 500, 1)).toBe(false)
    expect(canScrollWithin(0, 500, 500, 1)).toBe(false)
  })
})
