import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { DifficultyChartSection } from '../types/DifficultyChart'

interface QuickNavOfDifficultyChartProps {
  sections: DifficultyChartSection[]
  selectedSectionIndex: number | null
  onSectionClick: (index: number) => void
  exporting: boolean
}

const QuickNavOfDifficultyChart: React.FC<QuickNavOfDifficultyChartProps> = ({
  sections,
  selectedSectionIndex,
  onSectionClick,
  exporting,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleSectionClick = (index: number) => {
    onSectionClick(index)
    setIsSidebarOpen(false)
  }

  if (exporting || sections.length === 0) return null

  return (
    <>
      {/* 移动端浮动按钮 */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden top-24 left-4 z-50 fixed flex justify-center items-center bg-amber-500 hover:bg-amber-600 shadow-lg rounded-full w-12 h-12 active:scale-95 transition-all"
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Menu className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`top-24 left-4 z-40 fixed bg-white/80 shadow-lg backdrop-blur-md p-4 rounded-2xl w-48 max-h-[calc(100vh-120px)] overflow-y-auto transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-64 lg:translate-x-0'
        }`}
      >
        <h3 className="mb-3 font-bold text-amber-900 text-sm">快速导航</h3>
        <div className="flex flex-col gap-2">
          {sections.map((section, idx) => (
            <button
              key={idx}
              onClick={() => handleSectionClick(idx)}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                selectedSectionIndex === idx
                  ? 'bg-amber-500 text-white font-medium'
                  : 'bg-white/50 text-gray-700 hover:bg-amber-100'
              }`}
            >
              {section.name}
            </button>
          ))}
        </div>
      </div>

      {/* 移动端遮罩层 */}
      {isSidebarOpen && (
        <div
          className="lg:hidden top-0 left-0 z-30 fixed bg-black/30 w-full h-full"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  )
}

export default QuickNavOfDifficultyChart
