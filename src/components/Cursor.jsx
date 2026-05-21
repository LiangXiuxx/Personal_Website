import React, { useEffect, useRef, useState } from 'react'

const Cursor = () => {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    // 触屏设备跳过自定义光标
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const isNarrow = window.innerWidth <= 768
    if (hasTouch || isNarrow) {
      setIsTouch(true)
      return
    }
  }, [])

  if (isTouch) return null
  const cursorDotRef = useRef(null)
  const cursorRingRef = useRef(null)
  let mouseX = 0, mouseY = 0
  let ringX = 0, ringY = 0

  useEffect(() => {
    const cursorDot = cursorDotRef.current
    const cursorRing = cursorRingRef.current

    // 鼠标移动事件
    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      // 中心点无延迟跟随
      if (cursorDot) {
        cursorDot.style.left = `${mouseX}px`
        cursorDot.style.top = `${mouseY}px`
      }
    }

    // 动画循环让外环平滑跟随
    const animateCursor = () => {
      if (cursorRing) {
        ringX += (mouseX - ringX) * 0.2 // 缓动系数
        ringY += (mouseY - ringY) * 0.2
        cursorRing.style.left = `${ringX}px`
        cursorRing.style.top = `${ringY}px`
      }
      requestAnimationFrame(animateCursor)
    }

    // 悬停在交互元素上时光标的反馈
    const interactables = document.querySelectorAll('a, .card, .project')
    interactables.forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (cursorDot) {
          cursorDot.style.width = '15px'
          cursorDot.style.height = '15px'
        }
        if (cursorRing) {
          cursorRing.style.width = '60px'
          cursorRing.style.height = '60px'
          cursorRing.style.borderColor = '#ff007f' // 变粉色
        }
      })
      el.addEventListener('mouseleave', () => {
        if (cursorDot) {
          cursorDot.style.width = '8px'
          cursorDot.style.height = '8px'
        }
        if (cursorRing) {
          cursorRing.style.width = '40px'
          cursorRing.style.height = '40px'
          cursorRing.style.borderColor = 'rgba(0, 243, 255, 0.5)'
        }
      })
    })

    // 卡片随动发光特效
    const cards = document.querySelectorAll('.card')
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left // 获取相对卡片的 X 坐标
        const y = e.clientY - rect.top  // 获取相对卡片的 Y 坐标
        // 通过 CSS 变量将坐标传递给伪元素
        card.style.setProperty('--x', `${x}px`)
        card.style.setProperty('--y', `${y}px`)
      })
    })

    // 滚动进入视口时的出现动画
    const reveals = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active')
        }
      })
    }, { threshold: 0.15 })

    reveals.forEach(reveal => {
      observer.observe(reveal)
    })

    // 事件监听
    document.addEventListener('mousemove', handleMouseMove)
    animateCursor()

    // 清理函数
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      reveals.forEach(reveal => {
        observer.unobserve(reveal)
      })
    }
  }, [])

  return (
    <>
      <div className="cursor-dot" ref={cursorDotRef}></div>
      <div className="cursor-ring" ref={cursorRingRef}></div>
    </>
  )
}

export default Cursor