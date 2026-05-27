import React, { useEffect, useRef } from 'react'

const ParticleBackground = () => {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const particlesRef = useRef([])
  const sparklesRef = useRef([])
  const trailsRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationId
    let time = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // 颜色配置
    const colors = {
      cyan: { r: 0, g: 243, b: 255 },
      pink: { r: 255, g: 0, b: 127 },
      purple: { r: 157, g: 0, b: 255 },
      gold: { r: 255, g: 190, b: 11 }
    }
    const colorKeys = Object.keys(colors)

    // 主粒子类
    class Particle {
      constructor(type = 'normal') {
        this.type = type
        this.reset()
      }

      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height

        if (this.type === 'normal') {
          this.size = Math.random() * 2 + 1
          this.speedX = (Math.random() - 0.5) * 0.3
          this.speedY = (Math.random() - 0.5) * 0.3
          this.life = 1
          this.maxLife = 1
        } else if (this.type === 'float') {
          this.size = Math.random() * 3 + 2
          this.speedX = (Math.random() - 0.5) * 0.2
          this.speedY = -Math.random() * 0.5 - 0.1
          this.life = Math.random() * 200 + 100
          this.maxLife = this.life
          this.wobble = Math.random() * Math.PI * 2
          this.wobbleSpeed = Math.random() * 0.02 + 0.01
        } else if (this.type === 'pulse') {
          this.size = Math.random() * 4 + 3
          this.speedX = 0
          this.speedY = 0
          this.life = Math.random() * 100 + 50
          this.maxLife = this.life
          this.pulseSpeed = Math.random() * 0.05 + 0.02
          this.pulsePhase = Math.random() * Math.PI * 2
        }

        const colorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)]
        this.color = colors[colorKey]
        this.opacity = Math.random() * 0.6 + 0.2
        this.trail = []
        this.trailLength = this.type === 'float' ? 8 : 3
      }

      update() {
        // 鼠标交互 - 吸引效果
        const dx = mouseRef.current.x - this.x
        const dy = mouseRef.current.y - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const mouseRadius = 200

        if (distance < mouseRadius) {
          const force = (mouseRadius - distance) / mouseRadius
          const angle = Math.atan2(dy, dx)
          // 轻微吸引
          this.speedX += Math.cos(angle) * force * 0.02
          this.speedY += Math.sin(angle) * force * 0.02
        }

        // 速度限制
        const maxSpeed = this.type === 'float' ? 1 : 1.5
        const speed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY)
        if (speed > maxSpeed) {
          this.speedX = (this.speedX / speed) * maxSpeed
          this.speedY = (this.speedY / speed) * maxSpeed
        }

        // 阻尼
        this.speedX *= 0.995
        this.speedY *= 0.995

        // 特殊运动
        if (this.type === 'float') {
          this.wobble += this.wobbleSpeed
          this.x += this.speedX + Math.sin(this.wobble) * 0.5
          this.y += this.speedY
        } else if (this.type === 'pulse') {
          // 脉冲粒子不移动
        } else {
          this.x += this.speedX
          this.y += this.speedY
        }

        // 记录轨迹
        this.trail.unshift({ x: this.x, y: this.y })
        if (this.trail.length > this.trailLength) {
          this.trail.pop()
        }

        // 生命周期
        if (this.type !== 'normal') {
          this.life--
          if (this.life <= 0) {
            this.reset()
          }
        }

        // 边界检测
        if (this.x < -50) this.x = canvas.width + 50
        if (this.x > canvas.width + 50) this.x = -50
        if (this.y < -50) this.y = canvas.height + 50
        if (this.y > canvas.height + 50) this.y = -50
      }

      draw() {
        const lifeRatio = this.life / this.maxLife
        let currentOpacity = this.opacity

        if (this.type === 'float') {
          currentOpacity *= Math.sin(lifeRatio * Math.PI)
        } else if (this.type === 'pulse') {
          const pulse = Math.sin(time * this.pulseSpeed + this.pulsePhase)
          currentOpacity *= 0.3 + pulse * 0.7
          this.size = (Math.random() * 4 + 3) * (0.8 + pulse * 0.2)
        }

        // 绘制轨迹
        if (this.trail.length > 1) {
          for (let i = 1; i < this.trail.length; i++) {
            const trailOpacity = currentOpacity * (1 - i / this.trail.length) * 0.3
            ctx.beginPath()
            ctx.arc(this.trail[i].x, this.trail[i].y, this.size * 0.5, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${trailOpacity})`
            ctx.fill()
          }
        }

        // 外层光晕
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 4
        )
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${currentOpacity * 0.5})`)
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`)

        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // 核心点
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${currentOpacity})`
        ctx.fill()

        // 中心高光
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.8})`
        ctx.fill()
      }
    }

    // 闪光粒子类
    class Sparkle {
      constructor() {
        this.reset()
      }

      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 1
        this.life = Math.random() * 30 + 10
        this.maxLife = this.life
        const colorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)]
        this.color = colors[colorKey]
      }

      update() {
        this.life--
        if (this.life <= 0) {
          this.reset()
        }
      }

      draw() {
        const lifeRatio = this.life / this.maxLife
        const opacity = Math.sin(lifeRatio * Math.PI)
        const currentSize = this.size * (1 + (1 - lifeRatio) * 2)

        // 十字闪光效果
        ctx.save()
        ctx.translate(this.x, this.y)

        // 横线
        ctx.beginPath()
        ctx.moveTo(-currentSize * 3, 0)
        ctx.lineTo(currentSize * 3, 0)
        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${opacity})`
        ctx.lineWidth = 1
        ctx.stroke()

        // 竖线
        ctx.beginPath()
        ctx.moveTo(0, -currentSize * 3)
        ctx.lineTo(0, currentSize * 3)
        ctx.stroke()

        // 中心点
        ctx.beginPath()
        ctx.arc(0, 0, currentSize, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${opacity})`
        ctx.fill()

        ctx.restore()
      }
    }

    // 创建粒子
    const particleCount = Math.min(60, Math.floor((canvas.width * canvas.height) / 20000))
    particlesRef.current = [
      ...Array.from({ length: particleCount }, () => new Particle('normal')),
      ...Array.from({ length: Math.floor(particleCount * 0.3) }, () => new Particle('float')),
      ...Array.from({ length: Math.floor(particleCount * 0.2) }, () => new Particle('pulse'))
    ]

    // 创建闪光
    sparklesRef.current = Array.from({ length: 15 }, () => new Sparkle())

    // 连线函数 - 渐变色连线
    const drawLines = () => {
      const maxDistance = 180
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i]
          const p2 = particlesRef.current[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.2

            // 创建渐变线
            const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
            gradient.addColorStop(0, `rgba(${p1.color.r}, ${p1.color.g}, ${p1.color.b}, ${opacity})`)
            gradient.addColorStop(1, `rgba(${p2.color.r}, ${p2.color.g}, ${p2.color.b}, ${opacity})`)

            ctx.beginPath()
            ctx.strokeStyle = gradient
            ctx.lineWidth = 0.8
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }
    }

    // 鼠标光晕效果
    const drawMouseGlow = () => {
      if (mouseRef.current.x < 0) return

      const gradient = ctx.createRadialGradient(
        mouseRef.current.x, mouseRef.current.y, 0,
        mouseRef.current.x, mouseRef.current.y, 150
      )
      gradient.addColorStop(0, 'rgba(0, 243, 255, 0.05)')
      gradient.addColorStop(0.5, 'rgba(157, 0, 255, 0.02)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.beginPath()
      ctx.arc(mouseRef.current.x, mouseRef.current.y, 150, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
    }

    // 动画循环
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      time++

      // 绘制鼠标光晕
      drawMouseGlow()

      // 更新并绘制粒子
      particlesRef.current.forEach(particle => {
        particle.update()
        particle.draw()
      })

      // 绘制连线
      drawLines()

      // 更新并绘制闪光
      sparklesRef.current.forEach(sparkle => {
        sparkle.update()
        sparkle.draw()
      })

      animationId = requestAnimationFrame(animate)
    }

    // 鼠标移动监听
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  )
}

export default ParticleBackground