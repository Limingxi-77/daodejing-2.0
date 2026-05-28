'use strict'

const VALID_STYLES = ['ink', 'cyber', 'abstract', 'zen', 'landscape', 'ink_splash', 'fantasy']

const STYLE_PROMPTS = {
  ink: '中国传统水墨画风格，宣纸质感，留白写意，墨色浓淡变化，山水意境，道家美学',
  cyber: '赛博朋克修仙风格，霓虹灯光，未来科技感，科幻与道家哲学融合，暗色调发光',
  abstract: '抽象写意风格，现代艺术，色彩流动，意境空灵，极简构图',
  zen: '禅意极简风格，大面积留白，淡墨晕染，枯山水意境，侘寂美学，静谧空灵',
  landscape: '中国山水画风格，青绿山水，云雾缭绕，层峦叠嶂，工笔细腻，宋代画风',
  ink_splash: '泼墨大写意风格，墨色飞溅，气韵生动，豪放洒脱，水墨交融，酣畅淋漓',
  fantasy: '仙侠奇幻风格，仙山楼阁，瑞气祥云，古风人物，缥缈意境，东方玄幻'
}

const STYLE_NEGATIVE = {
  ink: 'low quality, blurry, watermark, text, modern objects, realistic photo, cartoon',
  cyber: 'low quality, blurry, watermark, text, realistic photo, traditional style',
  abstract: 'low quality, blurry, watermark, text, realistic photo, cartoon, detailed objects',
  zen: 'low quality, blurry, watermark, text, realistic photo, colorful, complex, busy',
  landscape: 'low quality, blurry, watermark, text, modern buildings, cartoon, anime',
  ink_splash: 'low quality, blurry, watermark, text, realistic photo, cartoon, detailed',
  fantasy: 'low quality, blurry, watermark, text, realistic photo, modern, western style'
}

const DEFAULT_NEGATIVE = 'low quality, blurry, watermark, text overlay, distorted, deformed'

function validateStyle (style) {
  return VALID_STYLES.includes(style)
}

function buildArtPrompt (quote, style) {
  const styleDesc = STYLE_PROMPTS[style] || STYLE_PROMPTS.ink
  return `道家哲学意境画：「${quote}」，${styleDesc}，高质量，精细`
}

function buildNegativePrompt (style) {
  return STYLE_NEGATIVE[style] || DEFAULT_NEGATIVE
}

function getArtSize () {
  return '1024*1024'
}

module.exports = {
  VALID_STYLES,
  validateStyle,
  buildArtPrompt,
  buildNegativePrompt,
  getArtSize
}
