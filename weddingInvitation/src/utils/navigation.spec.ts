import { describe, expect, it } from 'vitest'
import { weddingConfig } from '@/config/wedding'
import { createAmapSearchUrl } from './navigation'

describe('createAmapSearchUrl', () => {
  it('builds the documented Amap search request', () => {
    const url = new URL(createAmapSearchUrl(weddingConfig.venue))

    expect(url.origin).toBe('https://uri.amap.com')
    expect(url.pathname).toBe('/search')
    expect(url.searchParams.get('keyword')).toBe(
      '扬州中青国际酒店(市政府店) 江苏省扬州市邗江区邗江中路631号',
    )
    expect(url.searchParams.get('view')).toBe('map')
    expect(url.searchParams.get('src')).toBe('wedding-invitation')
    expect(url.searchParams.get('callnative')).toBe('1')
  })
})
