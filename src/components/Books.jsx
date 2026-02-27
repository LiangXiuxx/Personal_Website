import React from 'react'

const Books = () => {
  const books = [
    {
      id: 'NEUROMANCER',
      title: 'Neuromancer (神经漫游者)',
      year: '1984',
      description: '威廉·吉布森开创"赛博朋克"流派的奠基之作。黑客凯斯潜入矩阵（Matrix）的那一刻，定义了往后四十年的互联网幻想美学。'
    },
    {
      id: 'SNOWCRASH',
      title: 'Snow Crash (雪崩)',
      year: '1992',
      description: '尼尔·斯蒂芬森笔下的"元宇宙"发源地。披萨外卖员兼顶级黑客在虚拟与现实中穿梭，对抗能够通过视觉感染人脑的神秘病毒。'
    }
  ]

  return (
    <section className="section-padding" id="books">
      <div className="bg-text font-cyber" style={{ color: 'rgba(255,190,11,0.03)', top: '100px' }}>TEXT</div>
      <h2 className="section-title font-cyber" style={{ color: 'var(--neon-gold)' }}>03 // TEXTUAL_LOGS</h2>
      <div className="skills-grid">
        {books.map((book, index) => (
          <div 
            key={book.id} 
            className="card reveal"
            style={{ 
              transitionDelay: `${index * 0.1}s`,
              borderLeft: '2px solid var(--neon-gold)'
            }}
          >
            <span className="card-id font-cyber" style={{ color: 'var(--neon-gold)' }}>NOVEL // {book.year}</span>
            <h3>{book.title}</h3>
            <p>{book.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Books