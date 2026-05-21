import React, { useEffect, useRef, useState } from 'react'

const Cursor = () => {
  const cursorDotRef = useRef(null)
  const cursorRingRef = useRef(null)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const isNarrow = window.innerWidth <= 768
    if (hasTouch || isNarrow) {
      setIsTouch(true)
    }
  }, [])

  useEffect(() => {
    if (isTouch) return

    const cursorDot = cursorDotRef.current
    const cursorRing = cursorRingRef.current
    let mouseX = 0, mouseY = 0
    let ringX = 0, ringY = 0

    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      if (cursorDot) {
        cursorDot.style.left = `${mouseX}px`
        cursorDot.style.top = `${mouseY}px`
      }
    }

    const animateCursor = () => {
      if (cursorRing) {
        ringX += (mouseX - ringX) * 0.2
        ringY += (mouseY - ringY) * 0.2
        cursorRing.style.left = `${ringX}px`
        cursorRing.style.top = `${ringY}px`
      }
      requestAnimationFrame(animateCursor)
    }

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
          cursorRing.style.borderColor = '#ff007f'
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

    const cards = document.querySelectorAll('.card')
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect()
        card.style.setProperty('--x', `${e.clientX - rect.left}px`)
        card.style.setProperty('--y', `${e.clientY - rect.top}px`)
      })
    })

    const reveals = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active')
        }
      })
    }, { threshold: 0.15 })
    reveals.forEach(reveal => observer.observe(reveal))

    document.addEventListener('mousemove', handleMouseMove)
    animateCursor()

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      reveals.forEach(reveal => observer.unobserve(reveal))
    }
  }, [isTouch])

  if (isTouch) return null

  return (
    <>
      <div className="cursor-dot" ref={cursorDotRef}></div>
      <div className="cursor-ring" ref={cursorRingRef}></div>
    </>
  )
}

export default Cursor
