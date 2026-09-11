export interface WeddingPhoto {
  src: string
  srcSet: string
  width: number
  height: number
  alt: string
  position?: string
}

export interface PhotoChapter {
  id: string
  eyebrow: string
  title: string
  description: string
  photos: readonly WeddingPhoto[]
}
