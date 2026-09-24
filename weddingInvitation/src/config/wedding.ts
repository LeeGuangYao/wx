import type { WeddingConfig } from '@/types/wedding'

const defaultWeddingConfig: WeddingConfig = {
  couple: {
    groom: '李光耀',
    bride: '方紫薇',
  },
  dateISO: '2026-10-11',
  dateShort: '2026.10.11',
  dateSlash: '2026 / 10 / 11',
  dateLong: '2026年10月11日',
  weekday: '星期日',
  time: '中午 12:00',
  time24: '12:00',
  venue: {
    name: '扬州中青国际酒店(市政府店)',
    address: '江苏省扬州市邗江区邗江中路631号',
    room: '四楼怡和厅',
    // GCJ-02, checked against Amap's same-address hotel and Ctrip hotel 133540105.
    // Amap's record here is named 扬州天润华美达广场酒店, at 邗江中路631号.
    // https://www.amap.com/ssr/search/poi_detail?id=B0I36S88Z8
    latitude: 32.390294,
    longitude: 119.397407,
  },
  copy: {
    heroEyebrow: 'WEDDING INVITATION',
    invitationEyebrow: 'OUR WEDDING',
    invitationTitle: '我们结婚啦',
    heroDescription: '一封请柬，邀你共赴我们的幸福。',
    invitationLines: [
      '诚挚邀请您',
      '来见证我们的婚礼。',
    ],
    countdownEyebrow: 'Countdown',
    countdownTitle: '距离我们的婚礼',
    countdownPrefix: '还有',
    detailsEyebrow: 'Wedding Details',
    detailsTitle: '诚邀您来参加我们的回门宴',
    detailsDescription: '这一刻，想与你一同珍藏。',
    navigationLabel: '开始导航',
    closingTitle: '期待与你相见',
    closingEyebrow: 'SEE YOU AT OUR WEDDING',
  },
}

const shangshuiWeddingConfig: WeddingConfig = {
  ...defaultWeddingConfig,
  dateISO: '2026-10-02',
  dateShort: '2026.10.02',
  dateSlash: '2026 / 10 / 02',
  dateLong: '2026年10月2日',
  weekday: '星期五',
  time: '中午 12:00',
  time24: '12:00',
  venue: {
    name: '桑尼贝尔连锁酒店(商水富商路店)',
    address: '河南省周口市商水县富商路',
    // GCJ-02, converted from Ctrip's BD-09 hotelPositionInfo on 2026-09-14.
    // Original BD-09: longitude 114.612645, latitude 33.572104, mapType "bd".
    // https://hotels.ctrip.com/hotels/104721675.html
    latitude: 33.565783,
    longitude: 114.606259,
  },
  copy: {
    ...defaultWeddingConfig.copy,
    detailsTitle: '婚礼信息',
  },
}

export function getWeddingConfig(search: string): WeddingConfig {
  return new URLSearchParams(search).get('venue') === 'shangshui'
    ? shangshuiWeddingConfig
    : defaultWeddingConfig
}

export const weddingConfig = getWeddingConfig(typeof window === 'undefined' ? '' : window.location.search)
