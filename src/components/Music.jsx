import React, { useState, useRef, useEffect } from 'react'

const Music = () => {
  const [playingId, setPlayingId] = useState(null)
  const [progress, setProgress] = useState(0)
  const animationRef = useRef(null)

  const musicGenres = [
    {
      id: 'SYNTHWAVE',
      title: 'Midnight Skyline',
      description: '雨夜编码时的绝对首选。合成器的低频震荡与鼓机节拍，营造出驾驶飞行车穿梭于霓虹大厦间的沉浸感。推荐听 The Midnight 与 Perturbator。',
      color: 'var(--neon-cyan)',
      duration: '3:45',
      bpm: 120
    },
    {
      id: 'SHOEGAZE',
      title: 'Tokyo Distortion',
      description: '凛冽时雨 (Ling Tosite Sigure) 与 羊文学。充满失真吉他音墙和空灵人声的日系摇滚，这是撕裂平静表象的都市呐喊。',
      color: 'var(--neon-pink)',
      duration: '4:12',
      bpm: 140
    },
    {
      id: 'LO-FI',
      title: 'Neural Chillhop',
      description: '午夜三点，当系统负载过高时需要冷却。混合了老旧黑胶底噪、爵士钢琴切片与慵懒的鼓点，适合沉思与阅读。',
      color: 'var(--neon-purple)',
      duration: '2:58',
      bpm: 85
    }
  ]

  // 模拟播放进度
  useEffect(() => {
    if (playingId) {
      const startTime = Date.now()
      const duration = 30000 // 30秒模拟播放

      const animate = () => {
        const elapsed = Date.now() - startTime
        const newProgress = Math.min((elapsed / duration) * 100, 100)
        setProgress(newProgress)

        if (newProgress < 100) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          setPlayingId(null)
          setProgress(0)
        }
      }

      animationRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [playingId])

  const togglePlay = (id) => {
    if (playingId === id) {
      setPlayingId(null)
      setProgress(0)
    } else {
      setPlayingId(id)
      setProgress(0)
    }
  }

  return (
    <section className="section-padding" id="music">
      <div className="bg-text font-cyber" style={{ color: 'rgba(0,243,255,0.03)' }}>AUDIO</div>
      <h2 className="section-title font-cyber" style={{ color: 'var(--neon-cyan)' }}>01 // FREQUENCY_RECORDS</h2>
      <div className="skills-grid">
        {musicGenres.map((genre, index) => (
          <div
            key={genre.id}
            className="card reveal music-card"
            style={{ transitionDelay: `${index * 0.1}s` }}
          >
            <div className="music-header">
              <span className="card-id font-cyber" style={{ color: genre.color }}>GENRE: {genre.id}</span>
              <span className="music-bpm font-cyber">{genre.bpm} BPM</span>
            </div>
            <h3 className="font-cyber">{genre.title}</h3>
            <p>{genre.description}</p>

            {/* 音频播放器 */}
            <div className="music-player">
              <button
                className="play-btn"
                onClick={() => togglePlay(genre.id)}
                style={{
                  '--player-color': genre.color,
                  borderColor: genre.color
                }}
              >
                {playingId === genre.id ? (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                )}
              </button>

              <div className="progress-container">
                <div
                  className="progress-bar"
                  style={{
                    width: `${playingId === genre.id ? progress : 0}%`,
                    background: genre.color,
                    boxShadow: `0 0 10px ${genre.color}`
                  }}
                />
                <div className="progress-time font-cyber">
                  {playingId === genre.id
                    ? formatTime(progress, genre.duration)
                    : genre.duration
                  }
                </div>
              </div>

              {/* 可视化波形 */}
              <div className="waveform">
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    className="wave-bar"
                    style={{
                      '--delay': `${i * 0.05}s`,
                      '--color': genre.color,
                      animationPlayState: playingId === genre.id ? 'running' : 'paused'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// 格式化时间
function formatTime(progress, totalDuration) {
  const [minutes, seconds] = totalDuration.split(':').map(Number)
  const totalSeconds = minutes * 60 + seconds
  const currentSeconds = Math.floor((progress / 100) * totalSeconds)
  const currentMinutes = Math.floor(currentSeconds / 60)
  const remainingSeconds = currentSeconds % 60
  return `${currentMinutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export default Music