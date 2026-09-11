import { afterEach, describe, expect, it, vi } from 'vitest'
import { weddingConfig } from '@/config/wedding'
import { createTencentMapUrl, createWeddingNavigationUrl, openWeddingNavigation } from './navigation'

const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) Mobile Safari'
const android = 'Mozilla/5.0 (Linux; Android 14) Chrome Mobile'
const mac = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Safari'

describe('coordinate navigation links', () => {
  it.each([
    [iphone, 0, 'iosamap:'],
    [android, 0, 'androidamap:'],
    ['Mozilla/5.0 (iPad) Mobile Safari', 0, 'iosamap:'],
    [mac, 5, 'iosamap:'],
  ])('opens the native navigation endpoint for %s', (userAgent, touches, protocol) => {
    const url = new URL(createWeddingNavigationUrl(weddingConfig.venue, userAgent, touches))
    expect(url.protocol).toBe(protocol)
    expect(url.hostname).toBe('navi')
    expect(url.searchParams.get('poiname')).toBe(weddingConfig.venue.name)
    expect(url.searchParams.get('lat')).toBe('32.390294')
    expect(url.searchParams.get('lon')).toBe('119.397407')
    expect(url.searchParams.get('dev')).toBe('0')
    expect(url.searchParams.get('style')).toBe('0')
    expect(url.searchParams.get('sourceApplication')).toBe('WeddingInvitation')
  })

  it.each([`${iphone} MicroMessenger/8.0`, `${android} MicroMessenger/8.0`, mac, 'Windows NT 10.0'])('uses the web map in %s', userAgent => {
    expect(createWeddingNavigationUrl(weddingConfig.venue, userAgent)).toBe(createTencentMapUrl(weddingConfig.venue))
  })

  it('keeps the hotel address and latitude-longitude order in the web fallback', () => {
    const url = new URL(createTencentMapUrl(weddingConfig.venue))
    expect(url.origin).toBe('https://apis.map.qq.com')
    expect(url.pathname).toBe('/uri/v1/marker')
    expect(url.searchParams.get('marker')).toBe(`coord:32.390294,119.397407;title:${weddingConfig.venue.name};addr:${weddingConfig.venue.address}`)
    expect(url.searchParams.get('coord_type')).toBe('2')
    expect(url.searchParams.get('referer')).toBe('WeddingInvitation')
  })

  it('encodes names without injecting URL parameters', () => {
    const venue = { ...weddingConfig.venue, name: '酒店 A&B #1' }
    const url = new URL(createWeddingNavigationUrl(venue, iphone))
    expect(url.searchParams.get('poiname')).toBe(venue.name)
    expect(url.hash).toBe('')
  })
})

describe('direct navigation and fallback', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  function mockBrowser(userAgent = iphone) {
    vi.useFakeTimers()
    const browser = Object.assign(new EventTarget(), {
      location: { href: 'https://invitation.example/' },
      setTimeout,
      clearTimeout,
    })
    const page = Object.assign(new EventTarget(), { visibilityState: 'visible' })
    vi.stubGlobal('window', browser)
    vi.stubGlobal('document', page)
    vi.stubGlobal('navigator', { userAgent, maxTouchPoints: 0 })
    return { browser, page }
  }

  it('navigates directly inside WeChat without scheduling an app launch', () => {
    const { browser } = mockBrowser(`${iphone} MicroMessenger/8.0`)
    openWeddingNavigation(weddingConfig.venue)
    expect(browser.location.href).toBe(createTencentMapUrl(weddingConfig.venue))
    expect(vi.getTimerCount()).toBe(0)
  })

  it('immediately requests the app and falls back when the page stays visible', () => {
    const { browser } = mockBrowser()
    openWeddingNavigation(weddingConfig.venue)
    expect(browser.location.href.startsWith('iosamap://navi?')).toBe(true)
    vi.advanceTimersByTime(2200)
    expect(browser.location.href).toBe(createTencentMapUrl(weddingConfig.venue))
  })

  it('does not redirect when returning from the map app', () => {
    const { browser, page } = mockBrowser()
    openWeddingNavigation(weddingConfig.venue)
    page.visibilityState = 'hidden'
    page.dispatchEvent(new Event('visibilitychange'))
    page.visibilityState = 'visible'
    vi.advanceTimersByTime(10000)
    expect(browser.location.href.startsWith('iosamap://navi?')).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('cancels pending navigation when the page is left', () => {
    const { browser } = mockBrowser()
    openWeddingNavigation(weddingConfig.venue)
    browser.dispatchEvent(new Event('pagehide'))
    vi.advanceTimersByTime(10000)
    expect(browser.location.href.startsWith('iosamap://navi?')).toBe(true)
  })

  it('allows the component to cancel a previous click or unmount', () => {
    const { browser } = mockBrowser()
    const cancel = openWeddingNavigation(weddingConfig.venue)
    cancel()
    vi.advanceTimersByTime(10000)
    expect(browser.location.href.startsWith('iosamap://navi?')).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
  })
})
