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
    let animationFrameId

    const setCursorActive = (active) => {
      if (cursorDot) {
        cursorDot.style.width = active ? '15px' : '8px'
        cursorDot.style.height = active ? '15px' : '8px'
      }
      if (cursorRing) {
        cursorRing.style.width = active ? '60px' : '40px'
        cursorRing.style.height = active ? '60px' : '40px'
        cursorRing.style.borderColor = active ? '#ff007f' : 'rgba(0, 243, 255, 0.5)'
      }
    }

    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      if (cursorDot) {
        cursorDot.style.left = `${mouseX}px`
        cursorDot.style.top = `${mouseY}px`
      }

      const card = e.target.closest?.('.card')
      if (card) {
        const rect = card.getBoundingClientRect()
        card.style.setProperty('--x', `${e.clientX - rect.left}px`)
        card.style.setProperty('--y', `${e.clientY - rect.top}px`)
      }
    }

    const handleMouseOver = (e) => {
      const target = e.target.closest?.('a, .card, .project')
      if (!target || target.contains(e.relatedTarget)) return
      setCursorActive(true)
    }

    const handleMouseOut = (e) => {
      const target = e.target.closest?.('a, .card, .project')
      if (!target || target.contains(e.relatedTarget)) return
      setCursorActive(false)
    }

    const animateCursor = () => {
      if (cursorRing) {
        ringX += (mouseX - ringX) * 0.2
        ringY += (mouseY - ringY) * 0.2
        cursorRing.style.left = `${ringX}px`
        cursorRing.style.top = `${ringY}px`
      }
      animationFrameId = requestAnimationFrame(animateCursor)
    }

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
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)
    animateCursor()

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
      cancelAnimationFrame(animationFrameId)
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
