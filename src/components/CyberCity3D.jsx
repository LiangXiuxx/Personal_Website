import React, { useEffect, useRef, useState } from 'react'

const SHOW_3D_CITY = true

const GlitchDataSky = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationFrameId, frame = 0, width = 0, height = 0, streams = []
    let lastDrawTime = 0
    const frameInterval = 1000 / 28
    const glyphCache = new Map()
    const cacheCanvas = document.createElement('canvas')
    const cacheCtx = cacheCanvas.getContext('2d')
    const glyphSize = 26
    const GLOW_GREEN = '#3cff6e'
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
      cacheCanvas.width = glyphSize; cacheCanvas.height = glyphSize
      cacheCtx.clearRect(0, 0, glyphSize, glyphSize)
      cacheCtx.font = `${fontWeight} ${fontSize}px Orbitron, Consolas, Courier New, monospace`
      cacheCtx.fillStyle = GLOW_GREEN; cacheCtx.textAlign = 'center'; cacheCtx.textBaseline = 'middle'
      cacheCtx.fillText(char, glyphSize / 2, glyphSize / 2)
      const img = document.createElement('canvas')
      img.width = glyphSize; img.height = glyphSize
      img.getContext('2d').drawImage(cacheCanvas, 0, 0)
      glyphCache.set(key, img)
      return img
    }

    const resize = () => {
      glyphCache.clear()
      width = window.innerWidth; height = window.innerHeight
      canvas.width = width; canvas.height = height
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`
      const columnGap = 28
      const columns = Math.floor(width / columnGap)
      streams = []
      for (let i = 0; i < columns; i++) {
        streams.push({
          x: i * columnGap,
          y: Math.random() * height * 0.8,
          speed: 0.4 + Math.random() * 0.95,
          fontSize: Math.random() > 0.72 ? 13 : 10,
          alpha: 0.28 + Math.random() * 0.36,
          phase: Math.random() * Math.PI * 2,
          glyphs: Array.from(pickFragment().replace(/\s+/g, ' '))
        })
      }
    }

    const draw = (time = 0) => {
      animationFrameId = requestAnimationFrame(draw)
      if (document.hidden || time - lastDrawTime < frameInterval) return
      lastDrawTime = time; frame++
      ctx.clearRect(0, 0, width, height)
      streams.forEach((s) => {
        if (frame % 140 === 0 && Math.random() > 0.88) s.glyphs = Array.from(pickFragment().replace(/\s+/g, ' '))
        const pulse = 0.82 + Math.sin(frame * 0.045 + s.phase) * 0.18
        const baseAlpha = Math.min(s.alpha * 1.25 * pulse, 0.9)
        const fw = s.fontSize > 11 ? '800' : '600'
        const headIdx = s.glyphs.length - 1
        s.glyphs.forEach((glyph, idx) => {
          const y = s.y - (headIdx - idx) * s.fontSize * 1.9
          if (y < -40 || y > height * 0.78) return
          const isHead = idx === headIdx
          const glitch = frame % 37 < 2 && Math.random() > 0.92 ? (Math.random() - 0.5) * 10 : 0
          const char = glyph === ' ' ? '·' : glyph
          ctx.globalAlpha = glyph === ' ' ? s.alpha * 0.18 : baseAlpha
          ctx.drawImage(getCachedGlyph(char, s.fontSize, isHead ? '800' : fw), s.x + glitch - glyphSize / 2, y - glyphSize / 2)
          if (isHead && Math.random() > 0.72) { ctx.globalAlpha = s.alpha * 0.45; ctx.fillStyle = '#26ff60'; ctx.fillRect(s.x - 2, y + 4, 10 + Math.random() * 22, 1) }
        })
        ctx.globalAlpha = 1
        s.y += s.speed
        if (s.y - s.glyphs.length * s.fontSize * 1.9 > height * 0.82) {
          s.y = -20 - Math.random() * height * 0.25; s.speed = 0.4 + Math.random() * 0.95
          s.alpha = 0.28 + Math.random() * 0.36; s.glyphs = Array.from(pickFragment().replace(/\s+/g, ' '))
        }
      })
      if (frame % 150 === 0 && Math.random() > 0.72) {
        const slices = 1 + Math.floor(Math.random() * 2)
        for (let i = 0; i < slices; i++) { const y = Math.random() * height * 0.58; const h = 6 + Math.random() * 28; const dx = (Math.random() - 0.5) * 86; ctx.drawImage(canvas, 0, y, width, h, dx, y, width, h); ctx.fillStyle = 'rgba(64, 255, 112, 0.34)'; ctx.fillRect(0, y, width, 1) }
      }
      if (Math.random() > 0.82) { const y = Math.random() * height * 0.6; const x = Math.random() * width; ctx.fillStyle = 'rgba(120, 255, 160, 0.32)'; ctx.fillRect(x, y, 28 + Math.random() * 84, 1); if (Math.random() > 0.72) ctx.fillRect(x, y, 1, 10 + Math.random() * 24) }
    }

    resize(); window.addEventListener('resize', resize); draw()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId) }
  }, [])

  return (
    <div className="glitch-sky-wrapper" aria-hidden="true">
      <canvas ref={canvasRef} className="glitch-sky-canvas" />
    </div>
  )
}

const CyberCity3D = () => {
  const cameraRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)

  // 检测移动端
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // 桌面端：3D 城市逻辑（优化了阻尼系数，让转动和滑动更丝滑）
  useEffect(() => {
    if (!SHOW_3D_CITY || isMobile) return

    const camera = cameraRef.current
    if (!camera) return

    let scrollProgress = 0
    let targetZ = 0
    let currentZ = 0
    let targetRotateX = 0
    let targetRotateY = 0
    let currentRotateX = 0
    let currentRotateY = 0

    const handleScroll = () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight
      scrollProgress = window.scrollY / maxScroll
      targetZ = scrollProgress * 3500 // 稍微拉大 Z 轴行程，增强纵深感
    }

    const handleMouseMove = (e) => {
      const xRatio = (e.clientX / window.innerWidth) - 0.5
      const yRatio = (e.clientY / window.innerHeight) - 0.5
      targetRotateY = xRatio * -12 // 降低剧烈晃动感，更显高级
      targetRotateX = yRatio * 8
      document.documentElement.style.setProperty('--sky-x', `${xRatio * -18}px`)
      document.documentElement.style.setProperty('--sky-y', `${yRatio * -10}px`)
    }

    let animationFrameId;
    function renderCamera() {
      currentZ += (targetZ - currentZ) * 0.06
      currentRotateX += (targetRotateX - currentRotateX) * 0.04
      currentRotateY += (targetRotateY - currentRotateY) * 0.04

      camera.style.transform = `
        translateZ(${currentZ}px)
        rotateX(${currentRotateX}deg)
        rotateY(${currentRotateY}deg)
      `
      animationFrameId = requestAnimationFrame(renderCamera)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    renderCamera()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousemove', handleMouseMove)
      document.documentElement.style.removeProperty('--sky-x')
      document.documentElement.style.removeProperty('--sky-y')
      cancelAnimationFrame(animationFrameId)
    }
  }, [isMobile])

  // 移动端：轻量 CSS 霓虹渐变背景（提升了色彩饱和度和融合度）
  if (isMobile) {
    return (
      <div className="scene-container" style={{
        background: 'radial-gradient(circle at 10% 20%, rgba(0, 243, 255, 0.18), transparent 45%), radial-gradient(circle at 90% 80%, rgba(255, 0, 127, 0.15), transparent 50%), radial-gradient(circle at 50% 50%, rgba(157, 0, 255, 0.08), transparent 60%), #04040a',
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1
      }} />
    )
  }

  if (!SHOW_3D_CITY) {
    return (
      <div className="scene-container city-hidden-background">
        <GlitchDataSky />
        <div className="cyber-aurora"></div>
        <div className="fog-overlay-top"></div>
        <div className="fog-overlay-bottom"></div>
      </div>
    )
  }

  // 桌面端：炫烂升级版 3D 城市
  return (
    <div className="scene-container">
      <GlitchDataSky />
      {/* 动态全屏霓虹氛围极光层 */}
      <div className="cyber-aurora"></div>

      <div id="camera" ref={cameraRef}>
        <div id="world">
          {/* 1. 升级版道路：含两侧光流粒子 */}
          <div className="road">
            <div className="road-lines"></div>
          </div>

          {/* 红绿灯组件 */}
          <div className="traffic-pole">
            <div className="traffic-light">
              <div className="light green active"></div>
              <div className="light yellow"></div>
              <div className="light red"></div>
            </div>
          </div>

          {/* 2. 密集化建筑群：交错排布，新增玻璃质感变量与霓虹呼吸光晕 */}
          {/* 左侧建筑链 */}
          <div className="b3d b-left" style={{ '--z': '-400px', '--h': '650px', '--bg': '#090911', '--neon': '#ff007f' }}>
            <div className="b3d-structure"></div>
            <div className="b3d-rooftop">
              <div className="b3d-antenna"></div>
              <div className="b3d-ac"></div>
            </div>
            <div className="sign neon-pink glow-animate">漫画</div>
          </div>

          <div className="b3d b-left" style={{ '--z': '-1100px', '--h': '500px', '--bg': '#06060c', '--neon': '#9d00ff' }}>
            <div className="b3d-structure"></div>
            <div className="b3d-rooftop">
              <div className="b3d-dish"></div>
              <div className="b3d-antenna a-short"></div>
            </div>
            <div className="sign neon-purple">CREATIVE</div>
          </div>

          <div className="b3d b-left" style={{ '--z': '-1800px', '--h': '850px', '--bg': '#040408', '--neon': '#00f3ff' }}>
            <div className="b3d-structure"></div>
            <div className="b3d-rooftop">
              <div className="b3d-antenna"></div>
              <div className="b3d-ac"></div>
              <div className="b3d-pipe"></div>
            </div>
            <div className="sign neon-cyan" style={{ top: '220px' }}>AUDIO</div>
          </div>

          <div className="b3d b-left" style={{ '--z': '-2600px', '--h': '600px', '--bg': '#07070d', '--neon': '#ff007f' }}>
            <div className="b3d-structure"></div>
            <div className="b3d-rooftop">
              <div className="b3d-billboard"></div>
            </div>
            <div className="sign neon-pink horizontal">TECH</div>
          </div>

          {/* 右侧建筑链 */}
          <div className="b3d b-right" style={{ '--z': '-700px', '--h': '700px', '--bg': '#05050a', '--neon': '#00f3ff' }}>
            <div className="b3d-structure"></div>
            <div className="b3d-rooftop">
              <div className="b3d-antenna"></div>
              <div className="b3d-dish"></div>
            </div>
            <div className="sign neon-cyan horizontal">音乐</div>
          </div>

          <div className="b3d b-right" style={{ '--z': '-1400px', '--h': '600px', '--bg': '#080810', '--neon': '#ffbc00' }}>
            <div className="b3d-structure"></div>
            <div className="b3d-rooftop">
              <div className="b3d-pipe"></div>
              <div className="b3d-antenna a-short"></div>
            </div>
            <div className="sign neon-gold horizontal" style={{ top: '150px' }}>CODE</div>
          </div>

          <div className="b3d b-right" style={{ '--z': '-2200px', '--h': '950px', '--bg': '#030306', '--neon': '#ff007f' }}>
            <div className="b3d-structure"></div>
            <div className="b3d-rooftop">
              <div className="b3d-antenna"></div>
              <div className="b3d-ac"></div>
              <div className="b3d-billboard bf-wide"></div>
            </div>
            <div className="sign neon-pink">文学</div>
          </div>

          <div className="b3d b-right" style={{ '--z': '-3000px', '--h': '650px', '--bg': '#06060c', '--neon': '#9d00ff' }}>
            <div className="b3d-structure"></div>
            <div className="b3d-rooftop">
              <div className="b3d-dish"></div>
              <div className="b3d-pipe"></div>
            </div>
            <div className="sign neon-purple" style={{ top: '320px' }}>DESIGN</div>
          </div>

        </div>
      </div>

      {/* 3. 升级版全局雾气：增加霓虹混色滤镜感 */}
      <div className="fog-overlay-top"></div>
      <div className="fog-overlay-bottom"></div>
    </div>
  )
}

export default CyberCity3D
