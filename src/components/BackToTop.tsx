import React, { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'
import { useAppContext } from '../contexts/AppContext'

const BackToTop: React.FC = () => {
  const { scrollContainer } = useAppContext()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible((scrollContainer?.scrollTop ?? 0) > 0)
    }

    scrollContainer?.addEventListener('scroll', handleScroll)
    return () => scrollContainer?.removeEventListener('scroll', handleScroll)
  }, [scrollContainer])

  const scrollToTop = () => {
    scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div
      className={`fixed right-10 bottom-5 flex justify-center cursor-pointer transition-opacity touch-none ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={scrollToTop}
    >
      <div className="absolute flex flex-col items-center mt-1">
        <ChevronUp className="h-4" />
        <p className="text-sm">返回</p>
      </div>
      <img className="w-15" src="/img/logo-bg.png" alt="" />
    </div>
  )
}

export default BackToTop
