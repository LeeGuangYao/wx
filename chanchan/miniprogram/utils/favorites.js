// 本地收藏存储：以数组形式存放完整菜谱快照，便于离线浏览
const STORAGE_KEY = 'favorite_recipes_v1'

function readAll() {
  try {
    const list = wx.getStorageSync(STORAGE_KEY)
    return Array.isArray(list) ? list : []
  } catch (e) {
    return []
  }
}

function writeAll(list) {
  try {
    wx.setStorageSync(STORAGE_KEY, list)
  } catch (e) {}
}

function getFavorites() {
  return readAll()
}

function isFavorite(id) {
  if (id == null) return false
  return readAll().some((item) => String(item.id) === String(id))
}

function addFavorite(recipe) {
  if (!recipe || recipe.id == null) return false
  const list = readAll()
  if (list.some((item) => String(item.id) === String(recipe.id))) return false
  const snapshot = {
    id: recipe.id,
    cp_name: recipe.cp_name,
    type_name: recipe.type_name || '',
    texing: recipe.texing || '',
    yuanliao: recipe.yuanliao || '',
    tiaoliao: recipe.tiaoliao || '',
    savedAt: Date.now()
  }
  list.unshift(snapshot)
  writeAll(list)
  return true
}

function removeFavorite(id) {
  const list = readAll()
  const next = list.filter((item) => String(item.id) !== String(id))
  if (next.length === list.length) return false
  writeAll(next)
  return true
}

function toggleFavorite(recipe) {
  if (!recipe || recipe.id == null) return false
  if (isFavorite(recipe.id)) {
    removeFavorite(recipe.id)
    return false
  }
  addFavorite(recipe)
  return true
}

module.exports = {
  getFavorites,
  isFavorite,
  addFavorite,
  removeFavorite,
  toggleFavorite
}
