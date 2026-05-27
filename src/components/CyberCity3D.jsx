import React, { useEffect, useRef, useState } from 'react'

const CyberCity3D = () => {
  const cameraRef = useRef(null)
  const canvasRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)

  // 1. 移动端检测
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // 2. 核心：Canvas 3D 粒子与光雨引擎
  useEffect(() => {
    if (isMobile) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    // 粒子配置
    const PARTICLE_COUNT = 300
    const particles = []
    const colors = ['#00f3ff', '#ff007f', '#9d00ff']

    // 初始化 3D 空间粒子 (X, Y, Z)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 3000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 3000,
        speed: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 2 + 1,
        isRain: Math.random() > 0.7,
        rainSpeed: Math.random() * 15 + 10
      })
    }

    // 屏幕尺寸适配
    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // 渲染循环
    const renderCanvas = () => {
      // 动态模糊拖尾效果
      ctx.fillStyle = 'rgba(4, 4, 10, 0.2)'
      ctx.fillRect(0, 0, width, height)

      const cx = width / 2
      const cy = height / 2
      const fov = 500

      particles.forEach((p) => {
        p.z -= p.speed

        if (p.isRain) {
          p.y += p.rainSpeed
        }

        if (p.z <= 0 || p.y > 1500) {
          p.z = 3000
          p.x = (Math.random() - 0.5) * 3000
          p.y = p.isRain ? -1000 : (Math.random() - 0.5) * 2000
        }

        const scale = fov / (fov + p.z)
        const screenX = cx + p.x * scale
        const screenY = cy + p.y * scale
        const radius = p.size * scale * 1.5

        if (screenX >= 0 && screenX <= width && screenY >= 0 && screenY <= height) {
          ctx.beginPath()

          if (p.isRain) {
            const lineLength = 40 * scale
            ctx.strokeStyle = p.color
            ctx.lineWidth = radius
            ctx.moveTo(screenX, screenY)
            ctx.lineTo(screenX, screenY + lineLength)
            ctx.stroke()
          } else {
            ctx.fillStyle = p.color
            ctx.arc(screenX, screenY, radius, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      })

      animationFrameId = requestAnimationFrame(renderCanvas)
    }

    renderCanvas()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isMobile])

  // 3. 桌面端：CSS 3D 摄像机逻辑
  useEffect(() => {
    if (isMobile) return
    const camera = cameraRef.current
    if (!camera) return

    let scrollProgress = 0, targetZ = 0, currentZ = 0
    let targetRotateX = 0, targetRotateY = 0
    let currentRotateX = 0, currentRotateY = 0

    const handleScroll = () => {
      const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight)
      scrollProgress = window.scrollY / maxScroll
      targetZ = scrollProgress * 3200
    }

    const handleMouseMove = (e) => {
      const xRatio = (e.clientX / window.innerWidth) - 0.5
      const yRatio = (e.clientY / window.innerHeight) - 0.5
      targetRotateY = xRatio * -12
      targetRotateX = yRatio * 8
    }

    let animationFrameId
    function renderCamera() {
      currentZ += (targetZ - currentZ) * 0.08
      currentRotateX += (targetRotateX - currentRotateX) * 0.05
      currentRotateY += (targetRotateY - currentRotateY) * 0.05

      camera.style.transform = `translateZ(${currentZ}px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`
      animationFrameId = requestAnimationFrame(renderCamera)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    renderCamera()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isMobile])

  if (isMobile) {
    return (
      <div className="scene-container" style={{
        background: 'radial-gradient(ellipse at 20% 80%, rgba(0,243,255,0.15), transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255,0,127,0.12), transparent 50%), #06060f'
      }} />
    )
  }

  return (
    <div className="scene-container">
      {/* Canvas 粒子星空层 */}
      <canvas ref={canvasRef} className="cyber-particles-canvas" />

      <div id="camera" ref={cameraRef}>
        <div id="world">

          {/* 能量网格路面 */}
          <div className="road">
            <div className="energy-grid"></div>
            <div className="road-lines"></div>
          </div>

          <div className="traffic-pole">
            <div className="traffic-light">
              <div className="light green active"></div>
              <div className="light yellow"></div>
              <div className="light red"></div>
            </div>
          </div>

          {/* 左侧建筑 */}
          <div className="b3d b-left" style={{ '--z': '-500px', '--h': '600px', '--bg': '#07070a' }}>
            <div className="sign neon-pink glass-panel glitch-text" data-text="漫画">漫画</div>
          </div>
          <div className="b3d b-left" style={{ '--z': '-1100px', '--h': '500px', '--bg': '#06060c' }}>
            <div className="sign neon-purple glass-panel">CREATIVE</div>
          </div>
          <div className="b3d b-left" style={{ '--z': '-1600px', '--h': '800px', '--bg': '#050508' }}>
            <div className="sign neon-cyan glass-panel" style={{ top: '200px' }}>AUDIO</div>
          </div>
          <div className="b3d b-left" style={{ '--z': '-2400px', '--h': '600px', '--bg': '#07070d' }}>
            <div className="sign neon-pink glass-panel horizontal">TECH</div>
          </div>
          <div className="b3d b-left" style={{ '--z': '-3200px', '--h': '750px', '--bg': '#0a0a0f' }}>
            <div className="sign neon-cyan glass-panel glitch-text" data-text="SYSTEM">SYSTEM</div>
          </div>

          {/* 右侧建筑 */}
          <div className="b3d b-right" style={{ '--z': '-700px', '--h': '700px', '--bg': '#030305' }}>
            <div className="sign neon-cyan horizontal glass-panel">音乐</div>
          </div>
          <div className="b3d b-right" style={{ '--z': '-1400px', '--h': '600px', '--bg': '#080810' }}>
            <div className="sign neon-gold glass-panel horizontal" style={{ top: '150px' }}>CODE</div>
          </div>
          <div className="b3d b-right" style={{ '--z': '-2100px', '--h': '900px', '--bg': '#030306' }}>
            <div className="sign neon-pink glass-panel glitch-text" data-text="文学">文学</div>
          </div>
          <div className="b3d b-right" style={{ '--z': '-2800px', '--h': '650px', '--bg': '#06060c' }}>
            <div className="sign neon-purple glass-panel" style={{ top: '320px' }}>DESIGN</div>
          </div>
          <div className="b3d b-right" style={{ '--z': '-3500px', '--h': '800px', '--bg': '#090912' }}>
            <div className="sign neon-gold glass-panel horizontal">ARCHIVE</div>
          </div>

          <div className="sky-end"></div>
        </div>
      </div>
      <div className="fog-overlay"></div>
    </div>
  )
}

export default CyberCity3D