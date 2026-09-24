const { getChapter } = require('../data/album')
const { ALBUM_ASSET_BASE_URL } = require('../config')

function getAlbumShareMessage(chapterId) {
  const chapter = getChapter(chapterId)
  const photo = chapter.photos[0]
  return {
    title: `${chapter.title}｜光的折页婚纱相册`,
    path: `/pages/album/index?chapterId=${encodeURIComponent(chapter.id)}`,
    imageUrl: photo ? photo.previewUrl : `${ALBUM_ASSET_BASE_URL}/Previews/DSCF0011.jpg`
  }
}

function getAlbumTimelineMessage(chapterId) {
  const share = getAlbumShareMessage(chapterId)
  return {
    title: share.title,
    query: `chapterId=${encodeURIComponent(getChapter(chapterId).id)}`,
    imageUrl: share.imageUrl
  }
}

function shareAlbumHome() {
  return {
    title: '光的折页｜我们的婚纱相册',
    path: '/pages/album/index',
    imageUrl: `${ALBUM_ASSET_BASE_URL}/Previews/DSCF0011.jpg`
  }
}

function createSaveError(message, detail) {
  const error = new Error(message)
  error.detail = detail
  return error
}

function saveDownloadedToAlbum(filePath, isActive = () => true, allowSettings = true) {
  return new Promise((resolve, reject) => {
    if (!isActive()) {
      reject(new Error('保存已取消'))
      return
    }
    wx.saveImageToPhotosAlbum({
      filePath,
      success: resolve,
      fail(error) {
        if (!isActive()) {
          reject(new Error('保存已取消'))
          return
        }
        const errMsg = error && error.errMsg || ''
        if (allowSettings && /auth|authorize|permission/i.test(errMsg) && !/privacy/i.test(errMsg)) {
          wx.showModal({
            title: '需要相册权限',
            content: '允许访问相册后，才能保存这张原图。',
            confirmText: '去设置',
            success(result) {
              if (!result.confirm || !isActive()) {
                reject(new Error('相册权限未开启'))
                return
              }
              wx.openSetting({
                success(settings) {
                  if (settings.authSetting && settings.authSetting['scope.writePhotosAlbum']) {
                    saveDownloadedToAlbum(filePath, isActive, false).then(resolve, reject)
                  } else {
                    reject(new Error('相册权限未开启'))
                  }
                },
                fail(detail) { reject(createSaveError('无法打开相册权限设置', detail)) }
              })
            },
            fail: () => reject(new Error('保存已取消'))
          })
          return
        }
        reject(createSaveError(/privacy/i.test(errMsg) ? '相册隐私授权尚未完成' : '保存失败，请稍后重试', error))
      }
    })
  })
}

module.exports = { getAlbumShareMessage, getAlbumTimelineMessage, shareAlbumHome, saveDownloadedToAlbum }
