import { describe, expect, it } from 'vitest'
import { albumPages } from './albumPages'
import { albumChapters } from './album'
import { weddingPhotos } from './photos'

describe('compact wedding album', () => {
  it('fits all existing album photos into three pages without duplicates or omissions', () => {
    const originals = [...weddingPhotos.countdown, ...albumChapters.flatMap(chapter => [...chapter.photos])]
    const displayed = albumPages.flatMap(page => [...page.photos])
    expect(albumPages).toHaveLength(3)
    expect(albumPages.every(page => page.photos.length === 6)).toBe(true)
    expect(displayed.map(photo => photo.src).sort()).toEqual(originals.map(photo => photo.src).sort())
    expect(new Set(displayed.map(photo => photo.src)).size).toBe(18)
    expect(albumPages.every(page => page.title && page.description)).toBe(true)
    expect(new Set(albumPages.map(page => page.id)).size).toBe(3)
  })
})
