export interface WeddingCouple {
  groom: string
  bride: string
}

export interface WeddingVenue {
  name: string
  address: string
  latitude: number
  longitude: number
}

export interface WeddingCopy {
  heroEyebrow: string
  invitationEyebrow: string
  invitationTitle: string
  invitationLines: string[]
  countdownEyebrow: string
  countdownTitle: string
  countdownPrefix: string
  detailsEyebrow: string
  detailsTitle: string
  navigationLabel: string
  closingTitle: string
  closingEyebrow: string
}

export interface WeddingConfig {
  couple: WeddingCouple
  dateISO: string
  dateShort: string
  dateSlash: string
  dateLong: string
  weekday: string
  time: string
  time24: string
  venue: WeddingVenue
  copy: WeddingCopy
}
