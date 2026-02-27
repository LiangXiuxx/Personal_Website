import React, { useEffect, useRef } from 'react'

const CyberCity3D = () => {
  const cameraRef = useRef(null)

  useEffect(() => {
    const camera = cameraRef.current
    if (!camera) return

    let scrollProgress = 0
    let targetZ = 0 // 摄像机 Z 轴深度
    let currentZ = 0
    
    let targetRotateX = 0
    let targetRotateY = 0
    let currentRotateX = 0
    let currentRotateY = 0

    // 监听滚动条，计算摄像机应向 Z 轴深处推进的距离
    const handleScroll = () => {
      // 获取页面的总可滚动高度
      const maxScroll = document.body.scrollHeight - window.innerHeight
      scrollProgress = window.scrollY / maxScroll
      
      // 这里的 2500 是摄像机最大推进深度，数值越大滚到底时冲得越深
      targetZ = scrollProgress * 2500
    }

    // 监听鼠标移动，计算摄像机的 X/Y 轴旋转视角
    const handleMouseMove = (e) => {
      const xRatio = (e.clientX / window.innerWidth) - 0.5
      const yRatio = (e.clientY / window.innerHeight) - 0.5
      
      targetRotateY = xRatio * -15 // 左右看，最大 15 度
      targetRotateX = yRatio * 10  // 上下看，最大 10 度
    }

    // 使用 requestAnimationFrame 进行平滑插值运算 (缓动引擎)
    function renderCamera() {
      // 线性插值 (Lerp) 让动画变得像电影般顺滑，不生硬
      currentZ += (targetZ - currentZ) * 0.08
      currentRotateX += (targetRotateX - currentRotateX) * 0.05
      currentRotateY += (targetRotateY - currentRotateY) * 0.05

      // 将计算结果应用到 CSS transform 上
      camera.style.transform = `
        translateZ(${currentZ}px) 
        rotateX(${currentRotateX}deg) 
        rotateY(${currentRotateY}deg)
      `

      requestAnimationFrame(renderCamera)
    }

    // 事件监听
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousemove', handleMouseMove)

    // 启动摄像机渲染循环
    renderCamera()

    // 清理函数
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className="scene-container">
      <div id="camera" ref={cameraRef}>
        <div id="world">
          
          {/* 马路与发光车道线 */}
          <div className="road">
            <div className="road-lines"></div>
          </div>

          {/* 悬挂式红绿灯 */}
          <div className="traffic-pole">
            <div className="traffic-light">
              <div className="light green active"></div>
              <div className="light yellow"></div>
              <div className="light red"></div>
            </div>
          </div>

          {/* 左侧建筑群 (Z轴错落分布) */}
          <div className="b3d b-left" style={{ '--z': '-500px', '--h': '600px', '--bg': '#07070a' }}>
            <div className="sign neon-pink">漫画</div>
          </div>
          <div className="b3d b-left" style={{ '--z': '-1500px', '--h': '800px', '--bg': '#050508' }}>
            <div className="sign neon-cyan" style={{ top: '200px' }}>AUDIO</div>
          </div>
          <div className="b3d b-left" style={{ '--z': '-2800px', '--h': '500px', '--bg': '#0a0a0f' }}>
            <div className="sign neon-purple">AKIHABARA</div>
          </div>

          {/* 右侧建筑群 (Z轴错落分布) */}
          <div className="b3d b-right" style={{ '--z': '-800px', '--h': '700px', '--bg': '#030305' }}>
            <div className="sign neon-cyan horizontal">音楽</div>
          </div>
          <div className="b3d b-right" style={{ '--z': '-2000px', '--h': '900px', '--bg': '#060609' }}>
            <div className="sign neon-pink">文学</div>
          </div>
          <div className="b3d b-right" style={{ '--z': '-3200px', '--h': '600px', '--bg': '#08080c' }}>
            <div className="sign neon-gold horizontal" style={{ top: '300px' }}>ARCHIVE</div>
          </div>

          {/* 尽头的背景墙（防穿帮） */}
          <div className="sky-end"></div>
        </div>
      </div>
      {/* 城市雾气遮罩，确保前景文字清晰 */}
      <div className="fog-overlay"></div>
    </div>
  )
}

export default CyberCity3D