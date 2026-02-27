import React, { useEffect, useRef } from 'react'

const CyberCity = () => {
  const parallaxFarRef = useRef(null)
  const parallaxMidRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      // 计算鼠标偏离屏幕中心的比例 (-1 到 1)
      const xRatio = (e.clientX / window.innerWidth) - 0.5
      const yRatio = (e.clientY / window.innerHeight) - 0.5

      // 远景层移动得慢 (模拟真实物理距离)
      const farX = xRatio * -20
      const farY = yRatio * -10
      if (parallaxFarRef.current) {
        parallaxFarRef.current.style.transform = `translate(${farX}px, ${farY}px)`
      }

      // 中景层移动得快，产生强烈的 3D 错位感
      const midX = xRatio * -60
      const midY = yRatio * -25
      if (parallaxMidRef.current) {
        parallaxMidRef.current.style.transform = `translate(${midX}px, ${midY}px)`
      }
    }

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className="cyber-city-bg">
      {/* 远景：模糊的摩天大楼 */}
      <div className="city-layer layer-far" id="parallax-far" ref={parallaxFarRef}>
        <div className="building b-1"></div>
        <div className="building b-2"></div>
        <div className="building b-3"></div>
      </div>
      
      {/* 中景：清晰的建筑与霓虹灯牌 */}
      <div className="city-layer layer-mid" id="parallax-mid" ref={parallaxMidRef}>
        <div className="building b-4">
          <div className="vertical-sign pink">サイバー</div>
        </div>
        <div className="building b-5">
          <div className="horizontal-sign cyan">KAI.DEV_SYS</div>
        </div>
        <div className="building b-6">
          <div className="vertical-sign purple">電脳街</div>
        </div>
      </div>

      {/* 近景：穿梭的飞车流光 */}
      <div className="traffic-trails">
        <div className="trail tr-1"></div>
        <div className="trail tr-2"></div>
        <div className="trail tr-3"></div>
      </div>

      {/* 底部环境雾气：让城市与网页内容自然过渡 */}
      <div className="city-fog"></div>
    </div>
  )
}

export default CyberCity