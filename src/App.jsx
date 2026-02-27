import React, { useState, useEffect, useRef } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Music from './components/Music'
import Manga from './components/Manga'
import Books from './components/Books'
import Contact from './components/Contact'
import Cursor from './components/Cursor'
import BootScreen from './components/BootScreen'
import CyberCity3D from './components/CyberCity3D'

function App() {
  const [audioEnabled, setAudioEnabled] = useState(false)
  const audioCtxRef = useRef(null)

  // 初始化音频上下文
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
  }

  // 切换音频状态
  const toggleAudio = () => {
    initAudio()
    setAudioEnabled(!audioEnabled)
  }

  // 生成 UI 悬停微弱滴答声 (Hover Tick)
  const playHover = () => {
    if (!audioEnabled || !audioCtxRef.current) return
    const osc = audioCtxRef.current.createOscillator()
    const gain = audioCtxRef.current.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, audioCtxRef.current.currentTime) // 频率
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtxRef.current.currentTime + 0.05)
    gain.gain.setValueAtTime(0.05, audioCtxRef.current.currentTime) // 音量极小
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.05)
    osc.connect(gain)
    gain.connect(audioCtxRef.current.destination)
    osc.start()
    osc.stop(audioCtxRef.current.currentTime + 0.05)
  }

  // 生成点击确认声 (Mechanical Click)
  const playClick = () => {
    if (!audioEnabled || !audioCtxRef.current) return
    const osc = audioCtxRef.current.createOscillator()
    const gain = audioCtxRef.current.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(150, audioCtxRef.current.currentTime)
    osc.frequency.exponentialRampToValueAtTime(40, audioCtxRef.current.currentTime + 0.1)
    gain.gain.setValueAtTime(0.1, audioCtxRef.current.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.1)
    osc.connect(gain)
    gain.connect(audioCtxRef.current.destination)
    osc.start()
    osc.stop(audioCtxRef.current.currentTime + 0.1)
  }

  // 生成系统启动提示音
  const playSystemStart = () => {
    if (!audioEnabled || !audioCtxRef.current) return
    const osc = audioCtxRef.current.createOscillator()
    const gain = audioCtxRef.current.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(200, audioCtxRef.current.currentTime)
    osc.frequency.linearRampToValueAtTime(800, audioCtxRef.current.currentTime + 0.3)
    gain.gain.setValueAtTime(0, audioCtxRef.current.currentTime)
    gain.gain.linearRampToValueAtTime(0.1, audioCtxRef.current.currentTime + 0.1)
    gain.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.5)
    osc.connect(gain)
    gain.connect(audioCtxRef.current.destination)
    osc.start()
    osc.stop(audioCtxRef.current.currentTime + 0.5)
  }

  // 给所有的卡片、按钮绑定悬停和点击音效
  useEffect(() => {
    const interactables = document.querySelectorAll('a, .btn-glitch, .card, .project')
    interactables.forEach(el => {
      el.addEventListener('mouseenter', playHover)
      el.addEventListener('click', playClick)
    })

    return () => {
      interactables.forEach(el => {
        el.removeEventListener('mouseenter', playHover)
        el.removeEventListener('click', playClick)
      })
    }
  }, [audioEnabled])

  return (
    <div className="App">
      <div className="noise-overlay"></div>
      <CyberCity3D />
      <BootScreen onBootComplete={() => console.log('Boot complete')} playSystemStart={playSystemStart} />
      <Cursor />
      <Navbar 
        audioEnabled={audioEnabled} 
        onToggleAudio={toggleAudio} 
        playClick={playClick} 
      />
      <Hero />
      <Music />
      <Manga />
      <Books />
      <Contact playClick={playClick} playSystemStart={playSystemStart} />
    </div>
  )
}

export default App