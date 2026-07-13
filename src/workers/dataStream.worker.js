// dataStream.worker.js — 在 Worker 线程中绘制数据流 canvas
let ctx, width, height, streams, frame, glyphCache

const GLYPH_SIZE = 26
const GLOW_GREEN = '#3cff6e'
const FRAME_INTERVAL = 1000 / 20

const fragments = [
  '人間だから堕ちるのであり、生きているから堕ちるだけだ。',
  '生きる理由を失ったとき、人は初めて自由になる。',
  '人生は一行のボオドレエルにも若かない。',
  '僕の将来に対する唯ぼんやりした不安。',
  '真まことに人間の命なぞは、如露亦如電にょろやくにょでんに違いございません。',
  'Совесть есть самое страшное наказание.',
  'Au milieu de l’hiver, j’apprenais enfin qu’il y avait en moi un été invincible.',
  'Aujourd’hui, maman est morte. Ou peut-être hier, je ne sais pas.',
  'Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su.'
]

const pickFragment = () => fragments[Math.floor(Math.random() * fragments.length)]

function getCachedGlyph(char, fontSize, fontWeight) {
  const key = `${char}_${fontSize}_${fontWeight}`
  if (glyphCache.has(key)) return glyphCache.get(key)

  const c = new OffscreenCanvas(GLYPH_SIZE, GLYPH_SIZE)
  const cCtx = c.getContext('2d')
  cCtx.font = `${fontWeight} ${fontSize}px Orbitron, Consolas, Courier New, monospace`
  cCtx.fillStyle = GLOW_GREEN
  cCtx.textAlign = 'center'
  cCtx.textBaseline = 'middle'
  cCtx.fillText(char, GLYPH_SIZE / 2, GLYPH_SIZE / 2)
  glyphCache.set(key, c)
  return c
}

function initStreams() {
  const columnGap = 28
  const columns = Math.floor(width / columnGap)
  streams = Array.from({ length: columns }, (_, i) => {
    const text = pickFragment()
    return {
      x: i * columnGap,
      y: Math.random() * height * 0.8,
      speed: 0.4 + Math.random() * 0.95,
      fontSize: Math.random() > 0.72 ? 13 : 10,
      alpha: 0.28 + Math.random() * 0.36,
      phase: Math.random() * Math.PI * 2,
      glyphs: Array.from(text.replace(/\s+/g, ' '))
    }
  })
}

function draw(time) {
  requestAnimationFrame(draw)
  if (time - lastDrawTime < FRAME_INTERVAL) return
  lastDrawTime = time

  frame++
  ctx.clearRect(0, 0, width, height)

  streams.forEach((s) => {
    if (frame % 140 === 0 && Math.random() > 0.88) {
      s.glyphs = Array.from(pickFragment().replace(/\s+/g, ' '))
    }

    const pulse = 0.82 + Math.sin(frame * 0.045 + s.phase) * 0.18
    const baseAlpha = Math.min(s.alpha * 1.25 * pulse, 0.9)
    const fw = s.fontSize > 11 ? '800' : '600'
    const headIdx = s.glyphs.length - 1

    s.glyphs.forEach((glyph, idx) => {
      const y = s.y - (headIdx - idx) * s.fontSize * 1.9
      if (y < -40 || y > height * 0.78) return

      const isHead = idx === headIdx
      const glitch = frame % 37 < 2 && Math.random() > 0.92
        ? (Math.random() - 0.5) * 10 : 0
      const char = glyph === ' ' ? '·' : glyph
      ctx.globalAlpha = glyph === ' ' ? s.alpha * 0.18 : baseAlpha
      const img = getCachedGlyph(char, s.fontSize, isHead ? '800' : fw)
      ctx.drawImage(img, s.x + glitch - GLYPH_SIZE / 2, y - GLYPH_SIZE / 2)

      if (isHead && Math.random() > 0.72) {
        ctx.globalAlpha = s.alpha * 0.45
        ctx.fillStyle = '#26ff60'
        ctx.fillRect(s.x - 2, y + 4, 10 + Math.random() * 22, 1)
      }
    })
    ctx.globalAlpha = 1

    s.y += s.speed
    if (s.y - s.glyphs.length * s.fontSize * 1.9 > height * 0.82) {
      s.y = -20 - Math.random() * height * 0.25
      s.speed = 0.4 + Math.random() * 0.95
      s.alpha = 0.28 + Math.random() * 0.36
      s.glyphs = Array.from(pickFragment().replace(/\s+/g, ' '))
    }
  })

  if (frame % 150 === 0 && Math.random() > 0.72) {
    const slices = 1 + Math.floor(Math.random() * 2)
    for (let i = 0; i < slices; i++) {
      const y = Math.random() * height * 0.58
      const h = 6 + Math.random() * 28
      const dx = (Math.random() - 0.5) * 86
      ctx.drawImage(ctx.canvas, 0, y, width, h, dx, y, width, h)
      ctx.fillStyle = 'rgba(64, 255, 112, 0.34)'
      ctx.fillRect(0, y, width, 1)
    }
  }

  if (Math.random() > 0.82) {
    const y = Math.random() * height * 0.6
    const x = Math.random() * width
    ctx.fillStyle = 'rgba(120, 255, 160, 0.32)'
    ctx.fillRect(x, y, 28 + Math.random() * 84, 1)
    if (Math.random() > 0.72) {
      ctx.fillRect(x, y, 1, 10 + Math.random() * 24)
    }
  }
}

let lastDrawTime = 0

self.onmessage = (e) => {
  const { type, canvas, w, h } = e.data
  if (type === 'init') {
    ctx = canvas.getContext('2d')
    canvas.width = w
    canvas.height = h
    width = w
    height = h
    frame = 0
    glyphCache = new Map()
    initStreams()
    requestAnimationFrame(draw)
  } else if (type === 'resize') {
    width = w
    height = h
    ctx.canvas.width = w
    ctx.canvas.height = h
    glyphCache.clear()
    initStreams()
  }
}
