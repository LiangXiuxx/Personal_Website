import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getIntroPhase, onIntroPhaseChange } from '../utils/introState'

const Hero = () => {
  const [showContent, setShowContent] = useState(false)
  const animatedRef = useRef(false)

  useEffect(() => {
    // 检查当前状态（可能在 Hero 挂载前就已经是 content/nav 了）
    const current = getIntroPhase()
    if (!animatedRef.current && (current === 'content' || current === 'nav')) {
      animatedRef.current = true
      setShowContent(true)
      return
    }
    // 订阅后续变化
    return onIntroPhaseChange((p) => {
      if (animatedRef.current) return
      if (p === 'content' || p === 'nav') {
        animatedRef.current = true
        setShowContent(true)
      }
    })
  }, [])

  const contentClass = showContent ? 'intro-animate' : 'intro-hidden'

  return (
    <header className="hero">
      <div className={`hero-content ${contentClass}`}>
        <h1 className="font-cyber">Memory<br/><span>Archives</span></h1>
        <p>这里是 2026 年新东京地下数据库。<br />收录了 AI 开发实践笔记与项目实战记录。欢迎接入神经网络，扫描技术遗物。</p>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <a href="#music" className="btn-glitch font-cyber">Mount Frequencies</a>
          <Link to="/blog" className="btn-glitch font-cyber" style={{ borderColor: 'var(--neon-pink)', color: 'var(--neon-pink)' }}>
            Neural Log &gt;&gt;
          </Link>
        </div>
      </div>
      <div className={`vertical-text ${contentClass}`}>AI開発記録 // 技術の断片</div>
    </header>
  )
}

export default Hero
