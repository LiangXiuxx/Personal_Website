import React, { useState, useEffect, useRef } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
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

function HomePage({ audioEnabled, playClick, playSystemStart }) {
  return (
    <>
      <Hero />
      <Music />
      <Manga />
      <Books />
      <Contact playClick={playClick} playSystemStart={playSystemStart} />
    </>
  )
}

function App() {
  const [audioEnabled, setAudioEnabled] = useState(false)
  const audioCtxRef = useRef(null)

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
        <CyberCity3D />
        <BootScreen onBootComplete={() => console.log('Boot complete')} playSystemStart={playSystemStart} />
        <Cursor />
        <Navbar
          audioEnabled={audioEnabled}
          onToggleAudio={toggleAudio}
          playClick={playClick}
        />
        <Routes>
          <Route path="/" element={<HomePage audioEnabled={audioEnabled} playClick={playClick} playSystemStart={playSystemStart} />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
        </Routes>
      </div>
    </HashRouter>
  )
}

export default App
