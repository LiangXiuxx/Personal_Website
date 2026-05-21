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

  // 桌面端：原有 3D 城市逻辑
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
      targetZ = scrollProgress * 2500
    }

    const handleMouseMove = (e) => {
      const xRatio = (e.clientX / window.innerWidth) - 0.5
      const yRatio = (e.clientY / window.innerHeight) - 0.5
      targetRotateY = xRatio * -15
      targetRotateX = yRatio * 10
    }

    function renderCamera() {
      currentZ += (targetZ - currentZ) * 0.08
      currentRotateX += (targetRotateX - currentRotateX) * 0.05
      currentRotateY += (targetRotateY - currentRotateY) * 0.05

      camera.style.transform = `
        translateZ(${currentZ}px)
        rotateX(${currentRotateX}deg)
        rotateY(${currentRotateY}deg)
      `
      requestAnimationFrame(renderCamera)
    }

    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousemove', handleMouseMove)
    renderCamera()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isMobile])

  // 移动端：轻量 CSS 霓虹渐变背景
  if (isMobile) {
    return <div className="scene-container scene-mobile-neon" />
  }

  // 桌面端：原有 3D 城市
  return (
    <div className="scene-container">
      <div id="camera" ref={cameraRef}>
        <div id="world">
          <div className="road">
            <div className="road-lines"></div>
          </div>
          <div className="traffic-pole">
            <div className="traffic-light">
              <div className="light green active"></div>
              <div className="light yellow"></div>
              <div className="light red"></div>
            </div>
          </div>
          <div className="b3d b-left" style={{ '--z': '-500px', '--h': '600px', '--bg': '#07070a' }}>
            <div className="sign neon-pink">漫画</div>
          </div>
          <div className="b3d b-left" style={{ '--z': '-1500px', '--h': '800px', '--bg': '#050508' }}>
            <div className="sign neon-cyan" style={{ top: '200px' }}>AUDIO</div>
          </div>
          <div className="b3d b-left" style={{ '--z': '-2800px', '--h': '500px', '--bg': '#0a0a0f' }}>
            <div className="sign neon-purple">AKIHABARA</div>
          </div>
          <div className="b3d b-right" style={{ '--z': '-800px', '--h': '700px', '--bg': '#030305' }}>
            <div className="sign neon-cyan horizontal">音楽</div>
          </div>
          <div className="b3d b-right" style={{ '--z': '-2000px', '--h': '900px', '--bg': '#060609' }}>
            <div className="sign neon-pink">文学</div>
          </div>
          <div className="b3d b-right" style={{ '--z': '-3200px', '--h': '600px', '--bg': '#08080c' }}>
            <div className="sign neon-gold horizontal" style={{ top: '300px' }}>ARCHIVE</div>
          </div>
          <div className="sky-end"></div>
        </div>
      </div>
      <div className="fog-overlay"></div>
    </div>
  )
}

export default CyberCity3D
