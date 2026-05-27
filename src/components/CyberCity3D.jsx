import React, { useEffect, useRef, useState } from 'react'

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
    if (isMobile) return

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

  // 桌面端：炫烂升级版 3D 城市
  return (
    <div className="scene-container">
      {/* 动态全屏霓虹氛围极光层 */}
      <div className="cyber-aurora"></div>

      <div id="camera" ref={cameraRef}>
        <div id="world">

          {/* 1. 升级版道路：含两侧光流粒子 */}
          <div className="road">
            <div className="road-lines"></div>
            <div className="light-stream stream-cyan-1"></div>
            <div className="light-stream stream-pink-1"></div>
            <div className="light-stream stream-cyan-2"></div>
            <div className="light-stream stream-purple-1"></div>
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
            <div className="sign neon-pink glow-animate">漫画</div>
          </div>

          <div className="b3d b-left" style={{ '--z': '-1100px', '--h': '500px', '--bg': '#06060c', '--neon': '#9d00ff' }}>
            <div className="sign neon-purple">CREATIVE</div>
          </div>

          <div className="b3d b-left" style={{ '--z': '-1800px', '--h': '850px', '--bg': '#040408', '--neon': '#00f3ff' }}>
            <div className="sign neon-cyan" style={{ top: '220px' }}>AUDIO</div>
          </div>

          <div className="b3d b-left" style={{ '--z': '-2600px', '--h': '600px', '--bg': '#07070d', '--neon': '#ff007f' }}>
            <div className="sign neon-pink horizontal">TECH</div>
          </div>

          <div className="b3d b-left" style={{ '--z': '-3400px', '--h': '750px', '--bg': '#0a0a14', '--neon': '#00f3ff' }}>
            <div className="sign neon-cyan">AKIHABARA</div>
          </div>

          {/* 右侧建筑链 */}
          <div className="b3d b-right" style={{ '--z': '-700px', '--h': '700px', '--bg': '#05050a', '--neon': '#00f3ff' }}>
            <div className="sign neon-cyan horizontal">音乐</div>
          </div>

          <div className="b3d b-right" style={{ '--z': '-1400px', '--h': '600px', '--bg': '#080810', '--neon': '#ffbc00' }}>
            <div className="sign neon-gold horizontal" style={{ top: '150px' }}>CODE</div>
          </div>

          <div className="b3d b-right" style={{ '--z': '-2200px', '--h': '950px', '--bg': '#030306', '--neon': '#ff007f' }}>
            <div className="sign neon-pink">文学</div>
          </div>

          <div className="b3d b-right" style={{ '--z': '-3000px', '--h': '650px', '--bg': '#06060c', '--neon': '#9d00ff' }}>
            <div className="sign neon-purple" style={{ top: '320px' }}>DESIGN</div>
          </div>

          <div className="b3d b-right" style={{ '--z': '-3800px', '--h': '800px', '--bg': '#090912', '--neon': '#ffbc00' }}>
            <div className="sign neon-gold horizontal">ARCHIVE</div>
          </div>

          {/* 远景数字天际线（增加层次落差） */}
          <div className="sky-end">
            <div className="distant-glow"></div>
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