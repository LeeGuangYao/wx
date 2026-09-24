const photoRows = [["DSCF0011.jpg","mountains",1,3509,4678],["DSCF0004.jpg","mountains",2,4678,3509],["DSCF0002.jpg","mountains",3,3509,4678],["DSCF0008.jpg","mountains",4,4678,3509],["DSCF0027.jpg","mountains",5,4678,1727],["DSCF0024.jpg","mountains",6,4678,1727],["DSCF0029.jpg","mountains",7,4678,1727],["DSCF0013.jpg","mountains",8,4678,3509],["DSCF0017.jpg","mountains",9,4678,3509],["DSCF0032.jpg","mountains",10,4678,3509],["DSCF0037.jpg","mountains",11,4678,3509],["DSCF0041.jpg","mountains",12,4678,2629],["DSCF0105.jpg","mountains",13,4678,3509],["DSCF0104.jpg","mountains",14,3509,4678],["DSCF0107.jpg","mountains",15,4678,3509],["DSCF0108.jpg","mountains",16,3509,4678],["DSCF0069.jpg","mountains",17,3509,4678],["DSCF0047.jpg","mountains",18,3509,4678],["DSCF0049.jpg","mountains",19,3509,4678],["DSCF0050.jpg","mountains",20,4678,3509],["DSCF0052.jpg","mountains",21,4678,3509],["DSCF0058.jpg","mountains",22,4678,2629],["DSCF0063.jpg","mountains",23,3509,4678],["DSCF0073.jpg","mountains",24,4678,3509],["DSCF0078.jpg","mountains",25,4678,3509],["DSCF0183.jpg","palace",1,3509,4678],["DSCF0140.jpg","palace",2,4678,3509],["DSCF0147.jpg","palace",3,3509,4678],["DSCF0130.jpg","palace",4,3509,4678],["DSCF0149.jpg","palace",5,4678,3509],["DSCF0159.jpg","palace",6,4678,3119],["DSCF0173.jpg","palace",7,3509,4678],["DSCF0164.jpg","palace",8,4678,3509],["DSCF0181.jpg","palace",9,4678,3509],["DSCF0188.jpg","palace",10,3509,4678],["DSCF0205.jpg","palace",11,3509,4678],["DSCF0190.jpg","palace",12,3509,4678],["DSCF0197.jpg","palace",13,3509,4678],["DSCF0213.jpg","palace",14,3509,4678],["DSCF0210.jpg","palace",15,4678,3119],["DSCF0212.jpg","palace",16,4678,3509],["DSCF0222.jpg","palace",17,3509,4678],["DSCF0227.jpg","palace",18,4678,3509],["DSCF0229.jpg","palace",19,3509,4678],["DSCF0236.jpg","palace",20,3509,4678],["DSCF0271.jpg","white",1,3509,4678],["DSCF0250.jpg","white",2,4678,3509],["DSCF0253.jpg","white",3,3509,4678],["DSCF0255.jpg","white",4,4678,3509],["DSCF0256.jpg","white",5,3509,4678],["DSCF0257.jpg","white",6,4678,3509],["DSCF0262.jpg","white",7,3509,4678],["DSCF0264.jpg","white",8,3509,4678],["DSCF0273.jpg","white",9,4678,3509],["DSCF0281.jpg","white",10,4678,3509],["DSCF0293.jpg","golden",1,3509,4678],["DSCF0286.jpg","golden",2,3509,4678],["DSCF0298.jpg","golden",3,4678,3509],["DSCF0328.jpg","golden",4,3509,4678],["DSCF0304.jpg","golden",5,4678,3509],["DSCF0308.jpg","golden",6,4678,3509],["DSCF0314.jpg","golden",7,3509,4678],["DSCF0347.jpg","golden",8,3509,4678],["DSCF0352.jpg","golden",9,4678,3509],["DSCF0340.jpg","golden",10,3509,4678],["DSCF0356.jpg","golden",11,3509,4678],["DSCF0357.jpg","golden",12,3509,4678],["DSCF0359.jpg","golden",13,4678,3509],["DSCF0363.jpg","golden",14,3509,4678],["DSCF0367.jpg","golden",15,3509,4678]]

const mountainCopy = [
  { header: '风经过的地方', lines: ['山川很远', '你在身边'] },
  { header: '把远方走成日常', lines: ['一路有风', '一路有你'] },
  { header: '山野寄来回信', lines: ['云落在山间', '你在我身边'] },
  { header: '沿着山路慢慢走', lines: ['风景在远方', '心安在身旁'] },
  { header: '和你去看山海', lines: ['走过许多路', '还是并肩最好'] }
]

const chapterHeaders = {
  palace: ['光落在你身上', '花影向你而来', '廊下并肩慢行', '把晴天留给你', '在光里相逢'],
  white: ['just us.', 'only us.', 'stay close.', 'you & me.', 'near you.'],
  golden: ['把这一刻留下', '光停在肩上', '晚风收好余晖', '日落时和你', '把温柔留在此刻']
}

const chapterRows = [
  { id: 'mountains', number: '01', title: '山野来信', subtitle: '把风景，留给我们', accent: '#E5D9C9', foreground: '#F5F2ED', secondary: '#D8D1C8', background: '#343230', header: '风经过的地方', english: 'FIELD NOTES', count: 25, plan: [['landscapeStory', 2], ['landscapeStory', 2], ['landscapeSequence', 3], ['landscapeStory', 2], ['landscapeStory', 2], ['landscapeStory', 2], ['landscapeStory', 2], ['landscapeStory', 2], ['landscapeStory', 2], ['landscapeStory', 2], ['landscapeStory', 2], ['landscapeStory', 2]] },
  { id: 'palace', number: '02', title: '花影长廊', subtitle: '光落下来，你在身旁', accent: '#8D7354', foreground: '#3E362D', secondary: '#76634D', background: '#E9DECC', header: '光落在你身上', english: 'THROUGH THE QUIET WINDOWS', count: 20, plan: [['palaceWindows', 2], ['palaceWindows', 2], ['palaceFeature', 2], ['palaceFeature', 3], ['palaceWindows', 2], ['palaceWindows', 2], ['palaceFeature', 3], ['palaceFeature', 2], ['palaceWindows', 2]] },
  { id: 'white', number: '03', title: '纯白对白', subtitle: '简单一点，靠近一点', accent: '#82907C', foreground: '#242722', secondary: '#626A61', background: '#F8F9F7', header: 'just us.', english: 'TWO, TOGETHER', count: 10, plan: [['whiteDiptych', 2], ['whiteContact', 3], ['whiteDiptych', 2], ['whiteContact', 3]] },
  { id: 'golden', number: '04', title: '光的余温', subtitle: '把每束光，留在这一页', accent: '#C7A976', foreground: '#F1E8D8', secondary: '#CDBAA4', background: '#24211F', header: '把这一刻留下', english: 'THE LIGHT WE KEEP', count: 15, plan: [['goldenCollage', 2], ['goldenFeature', 2], ['goldenCollage', 3], ['goldenFeature', 2], ['goldenCollage', 3], ['goldenCollage', 3]] }
]

const { ALBUM_ASSET_BASE_URL } = require('../config')

const photosById = Object.create(null)
photoRows.forEach((row) => {
  const [file, chapterId, order, width, height] = row
  photosById[file] = {
    file,
    chapterId,
    order,
    width,
    height,
    aspect: width / height,
    thumbnailUrl: `${ALBUM_ASSET_BASE_URL}/Thumbnails/${file}`,
    previewUrl: `${ALBUM_ASSET_BASE_URL}/Previews/${file}`,
    originalUrl: `${ALBUM_ASSET_BASE_URL}/Originals/${file}`
  }
})

const chapters = chapterRows.map((row) => {
  const photos = Object.keys(photosById)
    .map((file) => photosById[file])
    .filter((photo) => photo.chapterId === row.id)
    .sort((a, b) => a.order - b.order)
  let cursor = 0
  let mountainStoryIndex = 0
  const pages = row.plan.map(([kind, count], index) => {
    const files = photos.slice(cursor, cursor + count).map((photo) => photo.file)
    cursor += count
    const page = { id: `${row.id}-${index + 1}`, number: index + 1, kind, files }
    if (row.id === 'mountains' && kind === 'landscapeStory') {
      page.copy = mountainCopy[mountainStoryIndex % mountainCopy.length]
      mountainStoryIndex++
    } else if (chapterHeaders[row.id]) {
      const headers = chapterHeaders[row.id]
      page.copy = { header: headers[index % headers.length] }
    }
    return page
  })
  return { ...row, photos, pages }
})

const chaptersById = Object.create(null)
chapters.forEach((chapter) => { chaptersById[chapter.id] = chapter })

function getChapter(id) {
  return chaptersById[id] || chapters[0]
}

function getPhoto(file) {
  return photosById[file] || null
}

function getPhotoPageIndex(chapterId, file) {
  const chapter = getChapter(chapterId)
  return chapter.pages.findIndex((page) => page.files.includes(file))
}

module.exports = { chapters, chaptersById, photosById, getChapter, getPhoto, getPhotoPageIndex }
