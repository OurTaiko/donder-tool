import React, { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { HelpCircle, Drum } from 'lucide-react'
import { Toaster } from 'sonner'
import Detail from './components/Detail'
import About from './components/About'
import BackToTop from './components/BackToTop'
import { useAppContext } from './contexts/AppContext'
import './App.css'

const App: React.FC = () => {
  const location = useLocation()
  const { 
    detailVisible, 
    setDetailVisible, 
    detailSongId, 
    detailLevel,
    setDetailLevel,
    songData, 
    setScrollContainer 
  } = useAppContext()

  const [aboutVisible, setAboutVisible] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollContainerRef.current) {
      setScrollContainer(scrollContainerRef.current)
    }
  }, [setScrollContainer])

  if (!songData) {
    return null
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      {/* 背景 */}
      <div className="-z-1 fixed w-screen h-screen">
        <img className="absolute w-full h-full object-cover" src="/img/bg.webp" alt="" />
        <div className="absolute bg-gradient-to-b from-amber-400 to-transparent w-full h-50"></div>
      </div>
      {/* 内容 */}
      <div ref={scrollContainerRef} className="px-2 md:px-6 w-screen h-screen overflow-auto [scrollbar-gutter:stable_both-edges]">
        <div className="flex flex-col items-center mb-12 w-full h-50">
          <div className="flex justify-between items-center p-4 w-full max-w-screen-xl">
            <div className="flex space-x-2 text-amber-800">
              <Drum className="w-6" />
              <p>Donder 查分器</p>
            </div>
            <div className="flex space-x-2">
              <div 
                onClick={() => setAboutVisible(true)} 
                className="flex hover:bg-black/5 p-2 rounded-full w-10 h-10 text-amber-800 transition-colors cursor-pointer"
              >
                <HelpCircle className="m-auto" />
              </div>
            </div>
          </div>
          <div>
            <img className="w-80" src="/img/logo.webp" alt="" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-8 mx-auto my-8 w-full max-w-screen-xl text-dark">
          <div className="flex bg-white/25 border-2 border-white rounded-full ring-2 ring-amber-950">
            <Link
              to="/search"
              className={`rounded-full px-4 py-2 transition-colors ${
                location.pathname === '/search'
                  ? 'bg-gradient-to-b from-amber-200 to-amber-400 text-border text-white'
                  : ''
              }`}
            >
              曲目搜索
            </Link>
            <Link
              to="/score"
              className={`rounded-full px-4 py-2 transition-colors ${
                location.pathname === '/score'
                  ? 'bg-gradient-to-b from-amber-200 to-amber-400 text-border text-white'
                  : ''
              }`}
            >
              成绩查询
            </Link>
          </div>
        </div>
        <Outlet />
      </div>
      {detailVisible && detailSongId !== undefined && detailLevel !== undefined && (
        <Detail
          visible={detailVisible}
          onVisibleChange={setDetailVisible}
          songId={detailSongId}
          selectLevel={detailLevel}
          onSelectLevelChange={setDetailLevel}
        />
      )}
      {aboutVisible && (
        <About
          visible={aboutVisible}
          onVisibleChange={setAboutVisible}
        />
      )}
      <BackToTop />
    </>
  )
}

export default App
