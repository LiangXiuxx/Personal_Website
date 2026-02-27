import React, { useEffect, useRef, useState } from 'react'

const BootScreen = ({ onBootComplete, playSystemStart }) => {
  const bootTextRef = useRef(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // 检查是否已经启动过
    if (sessionStorage.getItem('booted')) {
      setIsVisible(false)
      if (onBootComplete) {
        onBootComplete()
      }
      return
    }

    const bootLines = [
      'INITIALIZING NEO_CULTURE.db...',
      'MOUNTING AUDIO FREQUENCIES... <span class="boot-success">[OK]</span>',
      'DECRYPTING MANGA ARCHIVES... <span class="boot-success">[OK]</span>',
      'PARSING TEXTUAL RECORDS... <span class="boot-success">[OK]</span>',
      'ESTABLISHING SECURE CONNECTION TO NEO_TOKYO_NODE...',
      'SYSTEM ONLINE. WELCOME, OTAKU.'
    ]

    let lineIndex = 0

    function printLine() {
      if (lineIndex < bootLines.length && bootTextRef.current) {
        const p = document.createElement('div')
        p.className = 'boot-line'
        p.innerHTML = bootLines[lineIndex]
        bootTextRef.current.appendChild(p)
        
        // 随机延迟，模拟真实加载感
        const delay = Math.random() * 300 + 200
        lineIndex++
        setTimeout(printLine, delay)
      } else {
        // 启动完成，播放故障闪烁并消失
        setTimeout(() => {
          setIsVisible(false)
          sessionStorage.setItem('booted', 'true')
          // 触发进入主页的提示音
          if (playSystemStart) {
            playSystemStart()
          }
          if (onBootComplete) {
            onBootComplete()
          }
        }, 800)
      }
    }

    setTimeout(printLine, 500) // 初始延迟

  }, [onBootComplete, playSystemStart])

  if (!isVisible) {
    return null
  }

  return (
    <div id="boot-screen" className={!isVisible ? 'hidden' : ''}>
      <div className="terminal-content">
        <div id="boot-text" ref={bootTextRef}></div>
        <div className="cursor-block"></div>
      </div>
    </div>
  )
}

export default BootScreen