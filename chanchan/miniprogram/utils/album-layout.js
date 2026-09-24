const BOXES = {
  landscapeStory: (aspects, count) => {
    if (count === 2 && aspects[0] > 1.1 && aspects[1] < 1) {
      return [[0, 0, 1, 0.52], [0.42, 0.53, 0.58, 0.47]]
    }
    if (count === 2 && aspects[1] > 1.1 && aspects[0] < 1) {
      return [[0.42, 0.53, 0.58, 0.47], [0, 0, 1, 0.52]]
    }
    if (aspects.slice(0, count).every((aspect) => aspect > 1)) {
      return count === 2 ? [[0, 0, 1, 0.48], [0.06, 0.52, 0.94, 0.48]] : []
    }
    return count === 1 ? [[0.04, 0.02, 0.92, 0.96]] : [[0, 0, 0.69, 0.60], [0.36, 0.42, 0.64, 0.58]]
  },
  landscapeSequence: () => [[0, 0, 1, 0.30], [0, 0.35, 1, 0.30], [0, 0.70, 1, 0.30]],
  palaceWindows: () => [[0.015, 0.01, 0.65, 0.63], [0.37, 0.43, 0.615, 0.56]],
  palaceFeature: (aspects, count) => {
    if (aspects[0] > 1) return [[0.015, 0.01, 0.97, 0.49], [0.15, 0.54, 0.82, 0.44]]
    if (count === 3) return [[0.015, 0.01, 0.65, 0.70], [0.53, 0.06, 0.455, 0.29], [0.26, 0.69, 0.725, 0.30]]
    return [[0.015, 0.01, 0.69, 0.69], [0.37, 0.62, 0.615, 0.37]]
  },
  whiteDiptych: () => [[0, 0.08, 0.76, 0.69], [0.35, 0.70, 0.65, 0.30]],
  whiteContact: () => [[0, 0, 0.77, 0.61], [0, 0.67, 0.48, 0.33], [0.52, 0.67, 0.48, 0.33]],
  goldenCollage: (_aspects, count) => count === 2
    ? [[0.035, 0.025, 0.73, 0.69], [0.36, 0.42, 0.59, 0.55]]
    : [[0.035, 0.025, 0.86, 0.53], [0.045, 0.52, 0.46, 0.45], [0.525, 0.54, 0.425, 0.43]],
  goldenFeature: () => [[0.02, 0.02, 0.82, 0.70], [0.30, 0.65, 0.68, 0.33]]
}

function layoutSpread(page, photosById, width, height) {
  if (!page || !Array.isArray(page.files) || width <= 0 || height <= 0) return []
  const photos = page.files.map((file) => photosById[file]).filter(Boolean).slice(0, 3)
  if (!photos.length) return []
  const count = photos.length
  const aspects = photos.map((photo) => Math.max(0.01, Number(photo.aspect) || 1))
  const wide = width > height * 1.15
  let boxes
  if (wide) {
    const gap = 0.035
    const boxWidth = (1 - gap * (count - 1)) / count
    boxes = photos.map((_, index) => {
      const stagger = (page.kind === 'goldenCollage' || page.kind === 'palaceWindows') && index % 2 ? 0.07 : 0
      return [index * (boxWidth + gap), stagger, boxWidth, 1 - stagger]
    })
  } else {
    boxes = (BOXES[page.kind] || BOXES.whiteDiptych)(aspects, count)
    if (count === 1) boxes = [[0.04, 0.02, 0.92, 0.96]]
  }

  const rotations = page.kind === 'goldenCollage'
    ? count === 2 ? [-2, 3] : [-1.5, -2.5, 2.5]
    : page.kind === 'goldenFeature' ? [0, 1.5] : [0, 0, 0]

  return photos.map((photo, index) => {
    const box = boxes[index] || [0.52, 0.68, 0.46, 0.30]
    const left = box[0] * width
    const top = box[1] * height
    const boxWidth = box[2] * width
    const boxHeight = box[3] * height
    const imageWidth = Math.min(boxWidth, boxHeight * aspects[index])
    const imageHeight = imageWidth / aspects[index]
    const x = left + (box[0] > 0.2 ? boxWidth - imageWidth : 0)
    const y = top + (box[1] > 0.35 ? boxHeight - imageHeight : 0)
    return {
      file: photo.file,
      left: `${x}px`,
      top: `${y}px`,
      width: `${imageWidth}px`,
      height: `${imageHeight}px`,
      rotation: wide ? 0 : rotations[index] || 0,
      zIndex: index + 1
    }
  })
}

module.exports = { layoutSpread }
