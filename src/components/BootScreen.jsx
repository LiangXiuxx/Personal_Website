import React, { useEffect, useRef, useState } from 'react'

const BootScreen = ({ onBootComplete, playSystemStart }) => {
  const bootTextRef = useRef(null)
  const [phase, setPhase] = useState('visible') // 'visible' | 'glitch' | 'gone'

  useEffect(() => {
    // 检查是否已经启动过
    if (sessionStorage.getItem('booted')) {
      setPhase('gone')
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
        // 启动完成，播放故障闪烁过渡
        setTimeout(() => {
          setPhase('glitch')
          sessionStorage.setItem('booted', 'true')
          if (playSystemStart) {
            playSystemStart()
          }
          // 故障动画结束后移除
          setTimeout(() => {
            setPhase('gone')
            if (onBootComplete) {
              onBootComplete()
            }
          }, 600)
        }, 800)
      }
    }

    setTimeout(printLine, 500) // 初始延迟

  }, [onBootComplete, playSystemStart])

  if (phase === 'gone') {
    return null
  }

  return (
    <div id="boot-screen" className={phase === 'glitch' ? 'glitch-exit' : ''}>
      <div className="terminal-content">
        <div id="boot-text" ref={bootTextRef}></div>
        <div className="cursor-block"></div>
      </div>
    </div>
  )
}

export default BootScreen
