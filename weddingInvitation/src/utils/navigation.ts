import type { WeddingVenue } from '@/types/wedding'

const APP_OPEN_TIMEOUT = 2200

export function createTencentMapUrl(venue: WeddingVenue): string {
  // URI marker uses latitude,longitude and coord_type=2 for GCJ-02.
  // https://lbs.qq.com/webApi/uriV1/uriGuide/uriWebMarker
  const marker = `coord:${venue.latitude},${venue.longitude};title:${venue.name};addr:${venue.address}`
  return `https://apis.map.qq.com/uri/v1/marker?marker=${encodeURIComponent(marker)}&coord_type=2&referer=WeddingInvitation`
}

export function createWeddingNavigationUrl(venue: WeddingVenue, userAgent: string, maxTouchPoints = 0): string {
  // WeChat may block app schemes and Amap H5. Use Tencent's mobile location page.
  if (/MicroMessenger/i.test(userAgent)) return createTencentMapUrl(venue)

  const isIOS = /iPhone|iPad|iPod/i.test(userAgent)
    || (/Macintosh/i.test(userAgent) && maxTouchPoints > 1)
  const isAndroid = /Android/i.test(userAgent)
  if (!isIOS && !isAndroid) return createTencentMapUrl(venue)

  // Both platforms accept GCJ-02 with dev=0; the app obtains the starting point.
  // https://lbs.amap.com/api/amap-mobile/guide/ios/navi
  // https://lbs.amap.com/api/amap-mobile/guide/android/navigation
  const scheme = isIOS ? 'iosamap' : 'androidamap'
  return `${scheme}://navi?sourceApplication=WeddingInvitation&poiname=${encodeURIComponent(venue.name)}&lat=${venue.latitude}&lon=${venue.longitude}&dev=0&style=0`
}

export function openWeddingNavigation(venue: WeddingVenue): () => void {
  const url = createWeddingNavigationUrl(venue, navigator.userAgent, navigator.maxTouchPoints)
  const fallbackUrl = createTencentMapUrl(venue)
  if (url === fallbackUrl) {
    window.location.href = url
    return () => {}
  }

  // Stop the fallback as soon as the app opens or the user leaves this page.
  // Returning from a map app must not unexpectedly navigate away from the invitation.
  const cleanup = () => {
    window.clearTimeout(timer)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    window.removeEventListener('pagehide', cleanup)
  }
  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') cleanup()
  }
  const timer = window.setTimeout(() => {
    cleanup()
    if (document.visibilityState === 'visible') window.location.href = fallbackUrl
  }, APP_OPEN_TIMEOUT)
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('pagehide', cleanup)
  try {
    window.location.href = url
  } catch {
    cleanup()
    window.location.href = fallbackUrl
  }
  return cleanup
}
