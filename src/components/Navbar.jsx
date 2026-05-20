import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Navbar = ({ audioEnabled, onToggleAudio, playClick }) => {
  const location = useLocation()

  const handleAudioToggle = () => {
    onToggleAudio()
    if (playClick) {
      playClick()
    }
  }

  return (
    <nav>
      <Link to="/" className="logo font-cyber" style={{ textDecoration: 'none', color: 'inherit' }}>
        KAI<span>.</span>DEV
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
