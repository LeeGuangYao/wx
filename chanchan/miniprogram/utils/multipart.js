// 手动拼 multipart/form-data（wx.uploadFile 单次只能上传一个文件，
// 接口要求同一条记录携带多张图片，所以用 wx.request + ArrayBuffer 发）

function utf8Encode(str) {
  const bytes = []
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i)
    if (c < 0x80) {
      bytes.push(c)
    } else if (c < 0x800) {
      bytes.push(0xC0 | (c >> 6), 0x80 | (c & 0x3F))
    } else if (c < 0xD800 || c >= 0xE000) {
      bytes.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F))
    } else {
      i++
      const c2 = str.charCodeAt(i)
      const cp = 0x10000 + (((c & 0x3FF) << 10) | (c2 & 0x3FF))
      bytes.push(
        0xF0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3F),
        0x80 | ((cp >> 6) & 0x3F),
        0x80 | (cp & 0x3F)
      )
    }
  }
  return new Uint8Array(bytes)
}

function mimeFromPath(p) {
  const m = /\.([a-zA-Z0-9]+)(?:\?|$)/.exec(p || '')
  const ext = m ? m[1].toLowerCase() : ''
  switch (ext) {
    case 'jpg':
    case 'jpeg': return 'image/jpeg'
    case 'png': return 'image/png'
    case 'gif': return 'image/gif'
    case 'webp': return 'image/webp'
    default: return 'application/octet-stream'
  }
}

function basename(p) {
  const s = String(p || '')
  const i = Math.max(s.lastIndexOf('/'), s.lastIndexOf('\\'))
  return i >= 0 ? s.slice(i + 1) : s
}

// fields: { key: stringValue }
// files:  [{ name, filePath, filename?, contentType? }]
// 返回：{ body: ArrayBuffer, contentType: string }
function buildMultipart(fields, files) {
  const fsm = wx.getFileSystemManager()
  const boundary = '----WXFormBoundary' + Math.random().toString(16).slice(2)
  const chunks = []

  Object.keys(fields || {}).forEach((name) => {
    const value = fields[name] == null ? '' : String(fields[name])
    const head =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${name}"\r\n\r\n`
    chunks.push(utf8Encode(head))
    chunks.push(utf8Encode(value + '\r\n'))
  })

  ;(files || []).forEach((f) => {
    const buf = fsm.readFileSync(f.filePath)
    const filename = f.filename || basename(f.filePath)
    const contentType = f.contentType || mimeFromPath(filename)
    const head =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${f.name}"; filename="${filename}"\r\n` +
      `Content-Type: ${contentType}\r\n\r\n`
    chunks.push(utf8Encode(head))
    chunks.push(new Uint8Array(buf))
    chunks.push(utf8Encode('\r\n'))
  })

  chunks.push(utf8Encode(`--${boundary}--\r\n`))

  let total = 0
  for (const c of chunks) total += c.length
  const out = new Uint8Array(total)
  let offset = 0
  for (const c of chunks) {
    out.set(c, offset)
    offset += c.length
  }

  return {
    body: out.buffer,
    contentType: `multipart/form-data; boundary=${boundary}`
  }
}

module.exports = { buildMultipart }
