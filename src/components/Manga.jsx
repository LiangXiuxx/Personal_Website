import React from 'react'

const Manga = () => {
  const mangas = [
    {
      title: 'Ghost in the Shell (攻壳机动队)',
      author: 'MASAMUNE SHIROW',
      description: '"网络无限广阔。" 赛博朋克漫画的绝对圣经。探讨了在义体化和意识上传普及的未来，人类灵魂（Ghost）的定义边界究竟在何处。',
      tags: ['CYBERPUNK', 'PHILOSOPHY', 'SCI-FI']
    },
    {
      title: 'BLAME! (特工次世代)',
      author: 'TSUTOMU NIHEI',
      description: '废土建筑学的极致美学。在一个失控扩建、深不见底的"超构造体"都市中，主角雾亥手持重力子放射线射出装置，寻找着带有网络终端遗传因子的幸存者。',
      tags: ['POST-APOCALYPTIC', 'MEGAMACHINE']
    }
  ]

  return (
    <section className="section-padding" id="manga">
      <div className="bg-text font-cyber" style={{ color: 'rgba(255,0,127,0.02)', top: '150px' }}>VISUAL</div>
      <h2 className="section-title font-cyber" style={{ color: 'var(--neon-pink)' }}>02 // VISUAL_NARRATIVES</h2>
      
      <div className="project-wrapper">
        {mangas.map((manga, index) => (
          <div key={index} className="project reveal">
            <div className="project-img">
              <div className="overlay"></div>
            </div>
            <div className="project-info">
              <h3 className="font-cyber">{manga.title}</h3>
              <h4 className="font-cyber" style={{ color: 'var(--neon-pink)', marginBottom: '20px', fontWeight: '300' }}>AUTHOR: {manga.author}</h4>
              <p>{manga.description}</p>
              <div className="tags font-cyber">
                {manga.tags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Manga