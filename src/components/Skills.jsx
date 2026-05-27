import React, { useState, useEffect, useRef } from 'react'

const Skills = () => {
  const [activeCategory, setActiveCategory] = useState('ai')
  const [animatedSkills, setAnimatedSkills] = useState(new Set())
  const sectionRef = useRef(null)

  const categories = {
    ai: {
      title: 'AI & Machine Learning',
      color: 'var(--neon-cyan)',
      skills: [
        { name: 'PyTorch', level: 90, description: '深度学习框架' },
        { name: 'TensorFlow', level: 85, description: '机器学习平台' },
        { name: 'LangChain', level: 88, description: 'LLM应用开发' },
        { name: 'Hugging Face', level: 82, description: '模型库与工具' },
        { name: 'OpenAI API', level: 95, description: 'GPT模型集成' },
        { name: 'Computer Vision', level: 78, description: '图像识别与处理' }
      ]
    },
    frontend: {
      title: 'Frontend Development',
      color: 'var(--neon-pink)',
      skills: [
        { name: 'React', level: 92, description: 'UI组件开发' },
        { name: 'TypeScript', level: 88, description: '类型安全' },
        { name: 'Next.js', level: 85, description: '全栈框架' },
        { name: 'Tailwind CSS', level: 90, description: '样式系统' },
        { name: 'Three.js', level: 75, description: '3D可视化' },
        { name: 'WebGL', level: 70, description: '图形渲染' }
      ]
    },
    backend: {
      title: 'Backend & DevOps',
      color: 'var(--neon-purple)',
      skills: [
        { name: 'Python', level: 95, description: '主要开发语言' },
        { name: 'Node.js', level: 85, description: '服务端运行时' },
        { name: 'FastAPI', level: 88, description: 'API框架' },
        { name: 'Docker', level: 82, description: '容器化部署' },
        { name: 'AWS', level: 78, description: '云服务' },
        { name: 'PostgreSQL', level: 80, description: '数据库' }
      ]
    }
  }

  // 滚动动画观察器
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const skillName = entry.target.dataset.skill
            setAnimatedSkills((prev) => new Set([...prev, skillName]))
          }
        })
      },
      { threshold: 0.3 }
    )

    const skillElements = document.querySelectorAll('.skill-item')
    skillElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [activeCategory])

  const currentCategory = categories[activeCategory]

  return (
    <section className="section-padding" id="skills" ref={sectionRef}>
      <div className="bg-text font-cyber" style={{ color: 'rgba(157,0,255,0.03)' }}>SKILLS</div>
      <h2 className="section-title font-cyber" style={{ color: 'var(--neon-purple)' }}>
        05 // TECH_STACK_ANALYSIS
      </h2>

      {/* 分类切换 */}
      <div className="skills-categories">
        {Object.entries(categories).map(([key, category]) => (
          <button
            key={key}
            className={`category-btn font-cyber ${activeCategory === key ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory(key)
              setAnimatedSkills(new Set())
            }}
            style={{
              '--btn-color': category.color,
              borderColor: activeCategory === key ? category.color : 'var(--text-muted)',
              color: activeCategory === key ? category.color : 'var(--text-muted)'
            }}
          >
            {category.title}
          </button>
        ))}
      </div>

      {/* 技能列表 */}
      <div className="skills-container">
        <div className="skills-list">
          {currentCategory.skills.map((skill, index) => (
            <div
              key={skill.name}
              className="skill-item reveal"
              data-skill={skill.name}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <div className="skill-header">
                <span className="skill-name font-cyber">{skill.name}</span>
                <span className="skill-level" style={{ color: currentCategory.color }}>
                  {skill.level}%
                </span>
              </div>
              <p className="skill-description">{skill.description}</p>
              <div className="skill-bar-container">
                <div
                  className="skill-bar"
                  style={{
                    width: animatedSkills.has(skill.name) ? `${skill.level}%` : '0%',
                    background: `linear-gradient(90deg, ${currentCategory.color}, ${currentCategory.color}88)`,
                    boxShadow: animatedSkills.has(skill.name)
                      ? `0 0 10px ${currentCategory.color}50`
                      : 'none',
                    transition: `width 1s cubic-bezier(0.25, 1, 0.5, 1) ${index * 0.1}s`
                  }}
                />
                <div className="skill-bar-glow" style={{
                  width: animatedSkills.has(skill.name) ? `${skill.level}%` : '0%',
                  background: currentCategory.color,
                  transition: `width 1s cubic-bezier(0.25, 1, 0.5, 1) ${index * 0.1}s`
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* 技能雷达图 */}
        <div className="skills-radar">
          <div className="radar-container">
            <div className="radar-grid">
              {[100, 80, 60, 40, 20].map((level) => (
                <div key={level} className="radar-level" style={{ '--level': `${level}%` }}>
                  <span className="radar-label font-cyber">{level}</span>
                </div>
              ))}
            </div>
            <div className="radar-shape" style={{ '--color': currentCategory.color }}>
              {currentCategory.skills.map((skill, index) => {
                const angle = (index * 360) / currentCategory.skills.length - 90
                const radius = skill.level / 2
                const x = 50 + radius * Math.cos((angle * Math.PI) / 180)
                const y = 50 + radius * Math.sin((angle * Math.PI) / 180)
                return (
                  <div
                    key={skill.name}
                    className="radar-point"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      '--delay': `${index * 0.1}s`
                    }}
                  />
                )
              })}
            </div>
          </div>
          <div className="radar-legend">
            {currentCategory.skills.map((skill) => (
              <div key={skill.name} className="legend-item">
                <span className="legend-dot" style={{ background: currentCategory.color }} />
                <span className="legend-text font-cyber">{skill.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Skills