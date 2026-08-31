import type { WeddingVenue } from '@/types/wedding'

const AMAP_SEARCH_ENDPOINT = 'https://uri.amap.com/search'

export function createAmapSearchUrl(venue: WeddingVenue): string {
  const params = new URLSearchParams({
    keyword: `${venue.name} ${venue.address}`,
    view: 'map',
    src: 'wedding-invitation',
    callnative: '1',
  })

  return `${AMAP_SEARCH_ENDPOINT}?${params.toString()}`
}

export function openWeddingNavigation(venue: WeddingVenue): void {
  window.location.href = createAmapSearchUrl(venue)
}
