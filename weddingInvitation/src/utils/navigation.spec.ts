import { describe, expect, it } from 'vitest'
import { weddingConfig } from '@/config/wedding'
import { createAmapSearchUrl } from './navigation'

describe('createAmapSearchUrl', () => {
  it('builds the documented Amap search request', () => {
    const url = new URL(createAmapSearchUrl(weddingConfig.venue))

    expect(url.origin).toBe('https://uri.amap.com')
    expect(url.pathname).toBe('/search')
    expect(url.searchParams.get('keyword')).toBe(
      '扬州狮子楼（瘦西湖店） 扬州市广陵区柳湖路 8 号（扬师院东门内，近瘦西湖南门）',
    )
    expect(url.searchParams.get('view')).toBe('map')
    expect(url.searchParams.get('src')).toBe('wedding-invitation')
    expect(url.searchParams.get('callnative')).toBe('1')
  })
})
