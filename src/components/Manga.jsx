import React from 'react'

const Manga = () => {
  const mangas = [
    {
      title: 'Attack on Titan (进击的巨人)',
      author: 'HAJIME ISAYAMA',
      description: '在高墙、巨人与自由意志之间展开的残酷叙事。它最吸引人的地方不是战斗本身，而是随着真相被一层层揭开，立场、历史与正义不断反转。',
      tags: ['DARK FANTASY', 'WAR', 'FREEDOM']
    },
    {
      title: 'Death Note (死亡笔记)',
      author: 'TSUGUMI OHBA / TAKESHI OBATA',
      description: '一场关于权力、审判与智力博弈的黑暗实验。夜神月与 L 的对抗把悬疑推理做成了高压心理战，也不断追问“正义”是否会被工具异化。',
      tags: ['PSYCHOLOGICAL', 'THRILLER', 'JUSTICE'],
      image: 'images/death-note.jpg'
    }
  ]

  return (
    <section className="section-padding" id="manga">
      <div className="bg-text font-cyber" style={{ color: 'rgba(255,0,127,0.02)', top: '150px' }}>VISUAL</div>
      <h2 className="section-title font-cyber" style={{ color: 'var(--neon-pink)' }}>02 // VISUAL_NARRATIVES</h2>
      
      <div className="project-wrapper">
        {mangas.map((manga, index) => (
          <div key={index} className="project reveal">
            <div className={`project-img ${manga.image ? 'has-image' : ''}`}>
              {manga.image && <img src={`${import.meta.env.BASE_URL}${manga.image}`} alt={manga.title} />}
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