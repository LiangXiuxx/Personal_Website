import React, { useState, useRef } from 'react'

const Contact = ({ playClick, playSystemStart }) => {
  const [btnText, setBtnText] = useState("TRANSMIT TO DATABASE")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const btnTextRef = useRef(null)

  // 黑客乱码字符库
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=<>?'

  // 文本乱码器函数
  const scrambleText = (finalString, duration = 1500) => {
    let startTime = Date.now()
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      if (elapsed > duration) {
        clearInterval(interval)
        setBtnText(finalString)
        return
      }
      
      let scrambled = ''
      for(let i = 0; i < finalString.length; i++) {
        // 随着时间推移，渐渐锁定正确字符
        if (Math.random() < elapsed / duration) {
          scrambled += finalString[i]
        } else {
          scrambled += chars[Math.floor(Math.random() * chars.length)]
        }
      }
      setBtnText(scrambled)
    }, 50)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // 播放按键音
    if (playClick) {
      playClick()
    }
    
    setIsSubmitting(true)
    
    // 开始乱码动画，目标字符串："ENCRYPTING..."
    scrambleText("ENCRYPTING_DATA...", 1500)
    
    // 模拟网络请求完成
    setTimeout(() => {
      scrambleText("DATA_LOGGED_SUCCESSFULLY", 800)
      // 播放成功提示音
      if (playSystemStart) {
        playSystemStart()
      }
      
      // 清空表单
      setTimeout(() => {
        e.target.reset()
        setBtnText("TRANSMIT TO DATABASE")
        setIsSubmitting(false)
      }, 3000)
      
    }, 2000)
  }

  return (
    <section className="section-padding" id="contact">
      <h2 className="section-title font-cyber" style={{ color: '#fff' }}>04 // SHARE_ARTIFACT</h2>
      
      <div className="contact-terminal reveal">
        <div className="terminal-header font-cyber">
          <span>GUEST_UPLINK_v1.0</span>
          <span style={{ animation: 'blink 2s infinite' }}>STATUS: AWAITING_RECOMMENDATION</span>
        </div>
        <form id="cyber-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input type="text" required placeholder="[ YOUR_ALIAS / 访客代号 ]" />
          </div>
          <div className="input-group">
            <input type="text" required placeholder="[ CATEGORY: Music / Manga / Book ]" />
          </div>
          <div className="input-group">
            <textarea rows="4" required placeholder="[ INJECT_YOUR_RECOMMENDATION_HERE / 输入你强烈推荐的作品及理由 ]"></textarea>
          </div>
          <button 
            type="submit" 
            id="transmit-btn" 
            className="font-cyber"
            disabled={isSubmitting}
            style={{
              pointerEvents: isSubmitting ? 'none' : 'auto',
              background: isSubmitting ? 'var(--neon-pink)' : 'transparent',
              color: isSubmitting ? '#000' : 'var(--neon-cyan)',
              borderColor: isSubmitting ? 'var(--neon-pink)' : 'var(--neon-cyan)',
              boxShadow: isSubmitting ? '0 0 20px var(--neon-pink)' : 'none'
            }}
          >
            <span className="btn-text" ref={btnTextRef}>{btnText}</span>
          </button>
        </form>
      </div>
    </section>
  )
}

export default Contact