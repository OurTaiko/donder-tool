import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface AboutProps {
  visible: boolean
  onVisibleChange: (visible: boolean) => void
}

const About: React.FC<AboutProps> = ({ visible, onVisibleChange }) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (visible && dialogRef.current) {
      dialogRef.current.showModal()
    } else if (!visible && dialogRef.current && dialogRef.current.open) {
      dialogRef.current.close()
    }
  }, [visible])

  const closeDialog = () => {
    onVisibleChange(false)
  }

  return (
    <dialog ref={dialogRef} onClick={closeDialog} className="top-0 z-50 fixed flex bg-black/50 w-full h-full">
      <div onClick={(e) => e.stopPropagation()} className="relative flex flex-col bg-white shadow-xl m-auto rounded-xl w-120 max-w-[90%] max-h-[calc(100%-4rem)] overflow-hidden dialog-content">
        <div className="top-4 right-4 z-10 absolute">
          <button onClick={closeDialog} className="hover:bg-gray-200 p-2 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto overscroll-contain">
          <h2 className="mb-4 text-amber-900 text-2xl">关于 Donder 查分器</h2>

          <div className="space-y-1 mb-4 text-gray-700">
            <p>源代码 <a href="https://github.com/kirisamevanilla/donder-tool" target="_blank" rel="noreferrer" className="text-blue">kirisamevanilla/donder-tool</a></p>
            <p>图片素材 <a href="https://www.spriters-resource.com/arcade/taikonotatsujin2020version/" target="_blank" rel="noreferrer" className="text-blue">spriters-resource.com</a></p>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <p>这是一个非官方的太鼓达人查分工具，旨在帮助玩家更方便地查询和管理自己的游戏成绩。</p>
            
            <h3 className="text-amber-800 text-lg">功能介绍</h3>
            <ul className="space-y-1 ml-2 list-disc list-inside">
              <li>曲目搜索：快速查找游戏收录的曲目信息</li>
              <li>成绩查询：查看个人的游玩记录和详细数据</li>
              <li>数据统计：直观展示良/可/不可等判定数据</li>
            </ul>

            <h3 className="text-amber-800 text-lg">免责声明</h3>
            <p className="text-sm">本工具仅供学习交流使用，相关数据和图片版权归原作者及 Bandai Namco 所有。</p>

            <h3 className="text-amber-800 text-lg">友情链接</h3>
            <div className="flex flex-col">
              <a href="https://qm.qq.com/q/bywwY4MmEo" target="_blank" rel="noreferrer" className="w-max text-blue">太鼓达人入坑群</a>
              <a href="https://tjahelp.eu.org/" target="_blank" rel="noreferrer" className="w-max text-blue">菌菌机器人</a>
              <a href="https://best.taiko.vanillaaaa.org/" target="_blank" rel="noreferrer" className="w-max text-blue">太鼓之达人 Rating & 六维分析</a>
              <a href="https://www.donder.click/search-song.html" target="_blank" rel="noreferrer" className="w-max text-blue">歌曲筛选器</a>
              <p>微信小程序 Don Note</p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-gray-200 border-t text-gray-500 text-sm text-center">
            <p>Donder Tool © 2025</p>
          </div>
        </div>
      </div>
    </dialog>
  )
}

export default About
