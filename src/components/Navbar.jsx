import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getIntroPhase, onIntroPhaseChange } from '../utils/introState'

const Navbar = ({ audioEnabled, onToggleAudio, playClick }) => {
  const location = useLocation()
  const [navVisible, setNavVisible] = useState(false)
  const animatedRef = useRef(false)

  useEffect(() => {
    const current = getIntroPhase()
    if (!animatedRef.current && current === 'nav') {
      animatedRef.current = true
      setNavVisible(true)
      return
    }
    return onIntroPhaseChange((p) => {
      if (animatedRef.current) return
      if (p === 'nav') {
        animatedRef.current = true
        setNavVisible(true)
      }
    })
  }, [])

  const handleAudioToggle = () => {
    onToggleAudio()
    if (playClick) {
      playClick()
    }
  }

  return (
    <nav className={navVisible ? 'intro-visible' : 'intro-hidden'}>
      <Link to="/" className="logo font-cyber" style={{ textDecoration: 'none', color: 'inherit' }}>
        LiangXiu
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div className="nav-links font-cyber">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            HOME
          </Link>
          <Link
            to="/blog"
            className={`nav-link ${location.pathname.startsWith('/blog') ? 'active' : ''}`}
          >
            BLOG
          </Link>
        </div>
        <div className="status-indicator font-cyber">
          <div className="blink-dot"></div>
          System Active
        </div>
        <div
          className="audio-toggle font-cyber"
          id="audio-btn"
          onClick={handleAudioToggle}
        >
          [ AUDIO: <span id="audio-status" style={{ color: audioEnabled ? 'var(--neon-cyan)' : 'var(--text-muted)' }}>
            {audioEnabled ? 'ON' : 'OFF'}
          </span> ]
        </div>
      </div>
    </nav>
  )
}

export default Navbar
