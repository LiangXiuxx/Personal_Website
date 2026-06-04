import React, { useState, useEffect, useRef, useCallback } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Music from './components/Music'
import Manga from './components/Manga'
import Books from './components/Books'
import Contact from './components/Contact'
import Cursor from './components/Cursor'
import BootScreen from './components/BootScreen'
import CyberCity3D from './components/CyberCity3D'
import Blog from './components/Blog'
import BlogPost from './components/BlogPost'
import ScrollToTop from './components/ScrollToTop'
import PageTransition from './components/PageTransition'
import { setIntroPhase } from './utils/introState'
import Skills from './components/Skills'

function StaticCyberBackground() {
  return (
    <div
      className="static-cyber-background"
      style={{
        '--blog-bg-dim': `url('${import.meta.env.BASE_URL}images/blog-intro-4.png')`,
        '--blog-bg-bright': `url('${import.meta.env.BASE_URL}images/blog-intro-5.png')`,
      }}
      aria-hidden="true"
    />
  )
}

function RouteBackground() {
  const location = useLocation()
  const isBlogPage = location.pathname.startsWith('/blog')

  return isBlogPage ? <StaticCyberBackground /> : <CyberCity3D />
}

function BlogIntroSequence() {
  const location = useLocation()
  const isBlogPage = location.pathname.startsWith('/blog')
  const [visible, setVisible] = useState(false)
  const frames = [1, 2, 3, 4, 5].map((frame) => `${import.meta.env.BASE_URL}images/blog-intro-${frame}.png`)

  useEffect(() => {
    if (!isBlogPage) {
      setVisible(false)
      return
    }
    if (sessionStorage.getItem('blogIntroPlayed') === 'true') return

    setVisible(false)
    const showTimer = setTimeout(() => setVisible(true), 0)

    frames.forEach((src) => {
      const img = new Image()
      img.src = src
    })

    const hideTimer = setTimeout(() => {
      sessionStorage.setItem('blogIntroPlayed', 'true')
      setVisible(false)
    }, 4200)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [isBlogPage, location.pathname])

  if (!visible) return null

  return (
    <div className="blog-intro-sequence" aria-hidden="true">
      {frames.map((src, index) => (
        <img
          key={src}
          src={src}
          className={`blog-intro-frame blog-intro-frame-${index + 1}`}
          alt=""
        />
      ))}
      <div className="blog-intro-vignette" />
    </div>
  )
}

// 全局 reveal 观察器：自动为 .reveal 元素添加 .active
function RevealObserver() {
  const location = useLocation()

  const activateRevealElements = useCallback(() => {
    const els = document.querySelectorAll('.reveal:not(.active)')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    els.forEach((el) => observer.observe(el))
    return observer
  }, [])

  // 路由变化时立即激活视口内的元素
  useEffect(() => {
    // 短暂延迟确保 DOM 已渲染
    const timer = setTimeout(() => {
      // 直接激活所有 .reveal 元素（路由切换不需要滚动动画）
      document.querySelectorAll('.reveal:not(.active)').forEach((el) => {
        el.classList.add('active')
      })
    }, 50)
    return () => clearTimeout(timer)
  }, [location.pathname])

  // 初始挂载时设置 observer（用于首页滚动触发）
  useEffect(() => {
    const observer = activateRevealElements()
    return () => observer.disconnect()
  }, [activateRevealElements])

  return null
}

function HomePage({ audioEnabled, playClick, playSystemStart }) {
  return (
    <>
      <Hero />
      <Music />
      <Manga />
      <Books />
      <Skills />
      <Contact playClick={playClick} playSystemStart={playSystemStart} />
    </>
  )
}

function App() {
  const [audioEnabled, setAudioEnabled] = useState(false)
  const audioCtxRef = useRef(null)
  const introPlayedRef = useRef(false)

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
  }

  const toggleAudio = () => {
    initAudio()
    setAudioEnabled(!audioEnabled)
  }

  const playHover = () => {
    if (!audioEnabled || !audioCtxRef.current) return
    const osc = audioCtxRef.current.createOscillator()
    const gain = audioCtxRef.current.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, audioCtxRef.current.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtxRef.current.currentTime + 0.05)
    gain.gain.setValueAtTime(0.05, audioCtxRef.current.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.05)
    osc.connect(gain)
    gain.connect(audioCtxRef.current.destination)
    osc.start()
    osc.stop(audioCtxRef.current.currentTime + 0.05)
  }

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

  const playSystemStart = useCallback(() => {
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
  }, [audioEnabled])

  // 如果已启动过但 intro 还没播完（HMR 重渲染），直接推进
  useEffect(() => {
    if (sessionStorage.getItem('booted') && !introPlayedRef.current) {
      introPlayedRef.current = true
      setIntroPhase('bg')
      setTimeout(() => setIntroPhase('content'), 400)
      setTimeout(() => setIntroPhase('nav'), 1600)
    }
  }, [])

  const handleBootComplete = useCallback(() => {
    if (introPlayedRef.current) return
    introPlayedRef.current = true
    setIntroPhase('bg')
    setTimeout(() => setIntroPhase('content'), 400)
    setTimeout(() => setIntroPhase('nav'), 1600)
  }, [])

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
    <HashRouter>
      <div className="App">
        <div className="noise-overlay"></div>
        <RouteBackground />
        <BlogIntroSequence />
        <BootScreen
          onBootComplete={handleBootComplete}
          playSystemStart={playSystemStart}
        />
        <Cursor />
        <Navbar
          audioEnabled={audioEnabled}
          onToggleAudio={toggleAudio}
          playClick={playClick}
        />
        <ScrollToTop />
        <RevealObserver />
        <PageTransition>
          <Routes>
            <Route path="/" element={<HomePage audioEnabled={audioEnabled} playClick={playClick} playSystemStart={playSystemStart} />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
          </Routes>
        </PageTransition>
      </div>
    </HashRouter>
  )
}

export default App
