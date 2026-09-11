export type PageDirection = -1 | 0 | 1
export type PagePhase = 'sealed' | 'opening' | 'idle' | 'turning'

export class InvitationPager {
  index = 0
  previousIndex = 0
  opened = false
  phase: PagePhase = 'sealed'

  constructor(readonly total: number) {}

  beginOpening(): boolean {
    if (this.phase !== 'sealed') return false
    this.phase = 'opening'
    return true
  }

  finishOpening(): boolean {
    if (this.phase !== 'opening') return false
    this.opened = true
    this.phase = 'idle'
    return this.goTo(1)
  }

  goTo(index: number): boolean {
    if (!this.opened || this.phase !== 'idle' || !Number.isInteger(index)
      || index < 0 || index >= this.total || index === this.index) return false
    this.previousIndex = this.index
    this.index = index
    this.phase = 'turning'
    return true
  }

  settle(): void {
    if (this.phase === 'turning') this.phase = 'idle'
  }
}

export class WheelGesture {
  private lastTime = -Infinity
  private accumulated = 0
  private used = false

  feed(delta: number, now: number, consumed = false): PageDirection {
    if (now - this.lastTime > 220) {
      this.accumulated = 0
      this.used = false
    }
    this.lastTime = now
    if (consumed) this.used = true
    if (this.used || !Number.isFinite(delta)) return 0
    if (Math.sign(delta) !== Math.sign(this.accumulated)) this.accumulated = 0
    this.accumulated += delta
    if (Math.abs(this.accumulated) < 60) return 0
    this.used = true
    return this.accumulated > 0 ? 1 : -1
  }
}

export function canScrollWithin(top: number, height: number, visible: number, direction: number): boolean {
  if (height <= visible + 2) return false
  return direction > 0 ? top < height - visible - 2 : top > 2
}

export function swipeDirection(dx: number, dy: number): PageDirection {
  if (Math.abs(dy) < 45 || Math.abs(dy) < Math.abs(dx) * 1.3) return 0
  return dy < 0 ? 1 : -1
}
