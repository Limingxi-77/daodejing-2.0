const MIME_TO_EXT = Object.freeze({
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp'
})

function parseAvatarDataUrl(imageData, maxBytes = 2 * 1024 * 1024) {
  if (typeof imageData !== 'string') {
    throw new Error('头像数据格式无效')
  }

  const match = imageData.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/)
  if (!match) {
    throw new Error('头像数据格式无效')
  }

  const mime = match[1].toLowerCase()
  const ext = MIME_TO_EXT[mime]
  if (!ext) {
    throw new Error('仅支持 JPG、PNG、WebP 头像')
  }

  const normalizedBase64 = match[2].replace(/\s/g, '')
  const buffer = Buffer.from(normalizedBase64, 'base64')
  if (buffer.length === 0 || buffer.toString('base64').replace(/=+$/, '') !== normalizedBase64.replace(/=+$/, '')) {
    throw new Error('头像数据格式无效')
  }

  if (buffer.length > maxBytes) {
    throw new Error(`头像图片不能超过 ${Math.round(maxBytes / 1024 / 1024)}MB`)
  }

  return {
    buffer,
    mime,
    ext,
    size: buffer.length
  }
}

module.exports = {
  MIME_TO_EXT,
  parseAvatarDataUrl
}
