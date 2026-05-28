const test = require('node:test')
const assert = require('node:assert/strict')
const { parseAvatarDataUrl } = require('../lib/avatar-utils')

test('parseAvatarDataUrl accepts png data url', () => {
  const input = `data:image/png;base64,${Buffer.from('png-bytes').toString('base64')}`
  const result = parseAvatarDataUrl(input, 1024)

  assert.equal(result.mime, 'image/png')
  assert.equal(result.ext, 'png')
  assert.equal(result.size, 9)
  assert.equal(result.buffer.toString(), 'png-bytes')
})

test('parseAvatarDataUrl accepts jpeg and webp data urls', () => {
  const jpeg = parseAvatarDataUrl(`data:image/jpeg;base64,${Buffer.from('jpg').toString('base64')}`, 1024)
  const webp = parseAvatarDataUrl(`data:image/webp;base64,${Buffer.from('webp').toString('base64')}`, 1024)

  assert.equal(jpeg.ext, 'jpg')
  assert.equal(webp.ext, 'webp')
})

test('parseAvatarDataUrl rejects unsupported mime types', () => {
  assert.throws(
    () => parseAvatarDataUrl(`data:image/gif;base64,${Buffer.from('gif').toString('base64')}`, 1024),
    /仅支持 JPG、PNG、WebP/
  )
})

test('parseAvatarDataUrl rejects malformed data urls', () => {
  assert.throws(
    () => parseAvatarDataUrl('not-a-data-url', 1024),
    /头像数据格式无效/
  )
})

test('parseAvatarDataUrl rejects oversized images', () => {
  const input = `data:image/png;base64,${Buffer.from('too-big').toString('base64')}`

  assert.throws(
    () => parseAvatarDataUrl(input, 3),
    /头像图片不能超过/
  )
})
