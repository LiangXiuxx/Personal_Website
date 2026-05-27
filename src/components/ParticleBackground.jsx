import React, { useEffect, useRef } from 'react'

const ParticleBackground = () => {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const particlesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationId

    // 设置canvas尺寸
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // 粒子类
    class Particle {
      constructor() {
        this.reset()
      }

      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 0.5
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.opacity = Math.random() * 0.5 + 0.1
        // 随机霓虹色
        const colors = [
          'rgba(0, 243, 255,',   // cyan
          'rgba(255, 0, 127,',   // pink
          'rgba(157, 0, 255,',   // purple
          'rgba(255, 190, 11,'   // gold
        ]
        this.color = colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        // 鼠标交互
        const dx = mouseRef.current.x - this.x
        const dy = mouseRef.current.y - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 100) {
          const force = (100 - distance) / 100
          this.speedX += dx * force * 0.001
          this.speedY += dy * force * 0.001
        }

        // 速度限制
        const maxSpeed = 1.5
        const speed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY)
        if (speed > maxSpeed) {
          this.speedX = (this.speedX / speed) * maxSpeed
          this.speedY = (this.speedY / speed) * maxSpeed
        }

        // 阻尼
        this.speedX *= 0.99
        this.speedY *= 0.99

        this.x += this.speedX
        this.y += this.speedY

        // 边界检测
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1
      }

      draw() {
        // 发光效果
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 3
        )
        gradient.addColorStop(0, this.color + '0.8)')
        gradient.addColorStop(1, this.color + '0)')

        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // 核心点
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color + this.opacity + ')'
        ctx.fill()
      }
    }

    // 创建粒子
    const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000))
    particlesRef.current = Array.from({ length: particleCount }, () => new Particle())

    // 连线函数
    const drawLines = () => {
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const dx = particlesRef.current[i].x - particlesRef.current[j].x
          const dy = particlesRef.current[i].y - particlesRef.current[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            const opacity = (1 - distance / 150) * 0.15
            ctx.beginPath()
            ctx.strokeStyle = `rgba(0, 243, 255, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y)
            ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y)
            ctx.stroke()
          }
        }
      }
    }

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach(particle => {
        particle.update()
        particle.draw()
      })

      drawLines()

      animationId = requestAnimationFrame(animate)
    }

    // 鼠标移动监听
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
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
        pointerEvents: 'none',
        opacity: 0.6
      }}
    />
  )
}

export default ParticleBackground