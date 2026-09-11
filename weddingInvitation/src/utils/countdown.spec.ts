import { describe, expect, it } from 'vitest'
import { getCountdown } from './countdown'

const target = Date.parse('2026-10-11T20:00:00+08:00')

describe('getCountdown', () => {
  it.each([
    ['2026-10-10T18:57:56+08:00', { days: '1', hours: '01', minutes: '02', seconds: '04' }],
    ['2026-10-10T20:00:00+08:00', { days: '1', hours: '00', minutes: '00', seconds: '00' }],
    ['2026-10-10T20:00:01+08:00', { days: '0', hours: '23', minutes: '59', seconds: '59' }],
    ['2026-10-11T11:59:59Z', { days: '0', hours: '00', minutes: '00', seconds: '01' }],
    ['2026-10-11T20:00:00+08:00', { days: '0', hours: '00', minutes: '00', seconds: '00' }],
    ['2026-10-12T20:00:00+08:00', { days: '0', hours: '00', minutes: '00', seconds: '00' }],
  ])('calculates the remaining time at %s', (now, expected) => {
    expect(getCountdown(target, Date.parse(now))).toEqual(expected)
  })
})
