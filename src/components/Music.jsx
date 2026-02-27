import React from 'react'

const Music = () => {
  const musicGenres = [
    {
      id: 'SYNTHWAVE',
      title: 'Midnight Skyline',
      description: '雨夜编码时的绝对首选。合成器的低频震荡与鼓机节拍，营造出驾驶飞行车穿梭于霓虹大厦间的沉浸感。推荐听 The Midnight 与 Perturbator。',
      color: 'var(--neon-cyan)'
    },
    {
      id: 'SHOEGAZE',
      title: 'Tokyo Distortion',
      description: '凛冽时雨 (Ling Tosite Sigure) 与 羊文学。充满失真吉他音墙和空灵人声的日系摇滚，这是撕裂平静表象的都市呐喊。',
      color: 'var(--neon-pink)'
    },
    {
      id: 'LO-FI',
      title: 'Neural Chillhop',
      description: '午夜三点，当系统负载过高时需要冷却。混合了老旧黑胶底噪、爵士钢琴切片与慵懒的鼓点，适合沉思与阅读。',
      color: 'var(--neon-purple)'
    }
  ]

  return (
    <section className="section-padding" id="music">
      <div className="bg-text font-cyber" style={{ color: 'rgba(0,243,255,0.03)' }}>AUDIO</div>
      <h2 className="section-title font-cyber" style={{ color: 'var(--neon-cyan)' }}>01 // FREQUENCY_RECORDS</h2>
      <div className="skills-grid">
        {musicGenres.map((genre, index) => (
          <div 
            key={genre.id} 
            className="card reveal"
            style={{ transitionDelay: `${index * 0.1}s` }}
          >
            <span className="card-id font-cyber" style={{ color: genre.color }}>GENRE: {genre.id}</span>
            <h3 className="font-cyber">{genre.title}</h3>
            <p>{genre.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Music