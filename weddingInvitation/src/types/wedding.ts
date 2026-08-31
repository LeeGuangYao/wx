export interface WeddingCouple {
  groom: string
  bride: string
}

export interface WeddingVenue {
  name: string
  address: string
}

export interface WeddingCopy {
  heroEyebrow: string
  invitationEyebrow: string
  invitationTitle: string
  invitationLines: string[]
  detailsEyebrow: string
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
