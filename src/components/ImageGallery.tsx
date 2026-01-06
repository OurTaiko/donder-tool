import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
  visible: boolean
  onClose: () => void
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, visible, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLDivElement>(null)
  const lastTouchDistance = useRef<number>(0)

  // 重置缩放和位置
  const resetTransform = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  // 切换图片时重置变换
  useEffect(() => {
    resetTransform()
  }, [currentIndex])

  if (!visible || images.length === 0) return null

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  // 鼠标滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.min(Math.max(scale * delta, 0.5), 5)
    setScale(newScale)
  }

  // 触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 双指触摸
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      lastTouchDistance.current = distance
    } else if (e.touches.length === 1 && scale > 1) {
      // 单指拖动（仅当缩放时）
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      })
    }
  }

  // 触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 双指缩放
      e.preventDefault()
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      if (lastTouchDistance.current > 0) {
        const delta = distance / lastTouchDistance.current
        const newScale = Math.min(Math.max(scale * delta, 0.5), 5)
        setScale(newScale)
      }
      
      lastTouchDistance.current = distance
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      // 拖动图片
      e.preventDefault()
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      })
    }
  }

  // 触摸结束
  const handleTouchEnd = () => {
    setIsDragging(false)
    lastTouchDistance.current = 0
  }

  // 鼠标拖动开始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }

  // 鼠标拖动
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  // 鼠标拖动结束
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPrevious()
    } else if (e.key === 'ArrowRight') {
      goToNext()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      className="z-50 fixed inset-0 flex bg-black/90 m-0 p-0 w-full h-full"
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
      onTouchEnd={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* 关闭按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        onTouchEnd={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onClose()
        }}
        className="top-4 right-4 z-10 absolute hover:bg-white/20 p-2 rounded-full transition-colors"
      >
        <X className="w-8 h-8 text-white" />
      </button>

      {/* 左箭头 */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            goToPrevious()
          }}
          className="top-1/2 left-4 z-10 absolute hover:bg-white/20 p-3 rounded-full transition-colors -translate-y-1/2"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
      )}

      {/* 图片 */}
      <div
        ref={imageRef}
        className="flex justify-center items-center m-auto w-full h-full"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          src={images[currentIndex]}
          alt={`预览 ${currentIndex + 1}`}
          className="max-w-[90%] max-h-[90%] object-contain transition-transform select-none"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transformOrigin: 'center',
          }}
          draggable={false}
        />
      </div>

      {/* 右箭头 */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            goToNext()
          }}
          className="top-1/2 right-4 z-10 absolute hover:bg-white/20 p-3 rounded-full transition-colors -translate-y-1/2"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      )}

      {/* 指示器 */}
      {images.length > 1 && (
        <div className="bottom-4 left-1/2 absolute flex space-x-2 -translate-x-1/2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(index)
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* 计数器和缩放提示 */}
      <div className="top-4 left-1/2 absolute flex flex-col items-center space-y-2 -translate-x-1/2">
        {images.length > 1 && (
          <div className="bg-black/50 px-4 py-2 rounded-full text-white">
            {currentIndex + 1} / {images.length}
          </div>
        )}
        {scale !== 1 && (
          <div className="flex items-center space-x-2 bg-black/50 px-4 py-2 rounded-full text-white text-sm">
            <span>{Math.round(scale * 100)}%</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                resetTransform()
              }}
              className="hover:bg-white/20 px-2 py-0.5 rounded transition-colors"
            >
              重置
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageGallery
