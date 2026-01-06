import React, { useEffect, useRef, useMemo } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import Button from './Button'
import { useAppContext } from '../contexts/AppContext'
import { Song } from '../types/Song'

interface DetailProps {
  visible: boolean
  onVisibleChange: (visible: boolean) => void
  songId: number
  selectLevel: number
  onSelectLevelChange: (level: number) => void
}

const Detail: React.FC<DetailProps> = ({
  visible,
  onVisibleChange,
  songId,
  selectLevel,
  onSelectLevelChange,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { songData, scores, fetchSongData } = useAppContext()

  useEffect(() => {
    if (visible) {
      fetchSongData()
      if (dialogRef.current) {
        dialogRef.current.showModal()
      }
    } else if (!visible && dialogRef.current && dialogRef.current.open) {
      dialogRef.current.close()
    }
  }, [visible, fetchSongData])

  const closeDialog = () => {
    onVisibleChange(false)
  }

  const data = useMemo(() => {
    const cn = songData?.find((item: Song) => item.id === songId)
    const score = scores?.find((s: any) => s.song_no === songId && s.level === selectLevel)

    return {
      type: cn?.type || '',
      title: cn?.song_name || '',
      titleJp: cn?.song_name_jp || '',
      subtitle: cn?.subtitle || '',
      openDay: (() => {
        const dateStr = cn?.open_day || ''
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          const [month, day, year] = parts
          return `${year}.${month.padStart(2, '0')}.${day.padStart(2, '0')}`
        }
        return ''
      })(),
      score,
      levels: (() => {
        if (cn?.levels[4] === '-') {
          return [cn?.levels[0], cn?.levels[1], cn?.levels[2], cn?.levels[3]]
        } else {
          return [cn?.levels[0], cn?.levels[1], cn?.levels[2], cn?.levels[3], cn?.levels[4]]
        }
      })(),
    }
  }, [songData, scores, songId, selectLevel])

  const handleLevelChange = (newLevel: number) => {
    onSelectLevelChange(newLevel)
  }

  const copyTitle = () => {
    if (data?.title) {
      navigator.clipboard.writeText(data.title)
      toast.success('已复制歌曲标题到剪贴板咚~')
    }
  }

  const jumpToWiki = () => {
    const wikiUrl = `https://taiko.wiki/song/${songId}`
    window.open(wikiUrl, '_blank')
  }

  const getTypeClass = (type: string) => {
    const typeMap: Record<string, string> = {
      '流行音乐': 'bg-blue-500',
      '动漫音乐': 'bg-pink-500',
      '游戏音乐': 'bg-purple-500',
      '古典音乐': 'bg-amber-500',
      '儿童音乐': 'bg-yellow-500',
      '博歌乐音乐': 'bg-gray-500',
      '综合音乐': 'bg-green-500',
      '南梦宫原创音乐': 'bg-red-500',
    }
    return typeMap[type] || ''
  }

  if (!data) return null

  return (
    <dialog ref={dialogRef} onClick={closeDialog} className="z-50 fixed inset-0 flex bg-black/50 m-0 p-0 w-full max-w-full h-full max-h-full">
      <div onClick={(e) => e.stopPropagation()} className="relative flex bg-white shadow-xl m-auto rounded-xl w-200 max-w-[90%] max-h-[calc(100%-4rem)] overflow-hidden dialog-content">
        <div className="top-4 right-4 absolute">
          <button onClick={closeDialog} className="hover:bg-gray-200 p-2 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <div className="flex-1 space-y-2 p-4 md:p-8 overflow-y-auto overscroll-contain">
          {/* 歌曲ID */}
          <p className="text-gray text-sm">#{songId}</p>
          {/* 标题 */}
          <div className="flex flex-col space-y-1">
            <p className={`text-sm w-max px-2 py-1 rounded-full text-white text-shadow border-2 border-white ${getTypeClass(data.type)}`}>
              {data.type}
            </p>
            <p onClick={copyTitle} className="w-max max-w-full text-xl cursor-pointer">{data.title || '未知曲目'}</p>
            {data.subtitle && <p className="text-gray-500 text-sm">{data.subtitle}</p>}
          </div>
          {/* 哔哩哔哩 */}
          {data.title && (
            <div className="flex bg-blue-50 border-2 border-blue rounded-lg w-max text-blue-500">
              <img className="mx-2 w-5" src="/img/icon/bilibili.svg" alt="" />
              <a
                href={`bilibili://search?keyword=${encodeURIComponent(`太鼓达人 ${data.title}`)}`}
                target="_blank"
                rel="noreferrer"
                className="hover:bg-blue-100 px-2 py-1 rounded-md"
              >
                APP
              </a>
              <a
                href={`https://search.bilibili.com/all?keyword=${encodeURIComponent(`太鼓达人 ${data.title}`)}`}
                target="_blank"
                rel="noreferrer"
                className="hover:bg-blue-100 px-2 py-1 rounded-md"
              >
                WEB
              </a>
            </div>
          )}
          {/* 信息 */}
          {data.title && (
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-sm">
                <p className="text-gray-500">上线日期</p>
                <p className="flex-1 min-w-0">{data.openDay}</p>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <p className="text-gray-500">日文标题</p>
                <p className="flex-1 min-w-0">{data.titleJp}</p>
              </div>
            </div>
          )}
          {/* 谱面预览 */}
          <div>
            <div className="flex items-end space-x-1 h-10">
              {data.levels.map((level: any, index: number) => (
                <div
                  key={index}
                  onClick={() => handleLevelChange(index + 1)}
                  className={`relative w-15 rounded-t-lg border-2 border-b-none border-amber-950 overflow-hidden transition-all cursor-pointer hover:opacity-100 ${
                    index + 1 === 1 ? 'bg-red-300' :
                    index + 1 === 2 ? 'bg-lime-300' :
                    index + 1 === 3 ? 'bg-blue-300' :
                    index + 1 === 4 ? 'bg-pink-300' : 'bg-purple-300'
                  } ${
                    selectLevel === index + 1 ? 'h-10 opacity-100' : 'h-8 opacity-50'
                  }`}
                >
                  <div className="absolute bg-gradient-to-b from-white/50 to-transparent w-full h-full"></div>
                  <div className="relative flex justify-center items-center space-x-1 w-full h-full">
                    <img className="w-6" src={`/img/level/level_${index + 1}.png`} alt="" />
                    <p className="text-border font-bold text-white text-xl">{level}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex border-2 border-amber-950 rounded-lg rounded-tl-none w-full min-h-44 overflow-hidden">
              {data.score ? (
                <div className="gap-2 grid grid-cols-2 md:grid-cols-3 p-2 w-full">
                  <div className="flex flex-col space-y-1">
                    <div className="flex flex-col flex-1 bg-red-400 rounded-lg overflow-hidden text-white text-center">
                      <p className="bg-red-500 p-1 text-sm">历史最高得分</p>
                      <div className="flex flex-col flex-1 justify-center items-center">
                        <p className="m-auto text-border font-bold text-white text-3xl tracking-widest">{data.score?.high_score}</p>
                      </div>
                    </div>
                    <p className="opacity-50 text-xs text-center">{data.score?.highscore_datetime.replace(/\//g, '.')}</p>
                    <div className="grid grid-cols-2">
                      <div className="flex">
                        <img className="m-auto w-15" src={`/img/score_badge/score_${data.score?.best_score_rank}.png`} alt="" />
                      </div>
                      <div className="flex">
                        <img className="m-auto w-15" src={`/img/crown/crown_${data.score?.full_combo_cnt > 0 ? 'gold' : 'silver'}.png`} alt="" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-border text-white">
                    <div className="flex justify-between items-center bg-gradient-to-r from-orange-400 to-gray-300 px-2 py-0.5 rounded-lg">
                      <p className="text-border text-white">良</p>
                      <p>{data.score?.good_cnt}</p>
                    </div>
                    <div className="flex justify-between items-center bg-gradient-to-r from-gray-400 to-gray-300 px-2 py-0.5 rounded-lg">
                      <p className="text-border text-white">可</p>
                      <p>{data.score?.ok_cnt}</p>
                    </div>
                    <div className="flex justify-between items-center bg-gradient-to-r from-blue-400 to-gray-300 px-2 py-0.5 rounded-lg">
                      <p className="text-border text-white">不可</p>
                      <p>{data.score?.ng_cnt}</p>
                    </div>
                    <div className="flex justify-between items-center bg-gradient-to-r from-amber-400 to-gray-300 px-2 py-0.5 rounded-lg">
                      <p className="text-border text-white">连打数</p>
                      <p>{data.score?.pound_cnt}</p>
                    </div>
                    <div className="flex justify-between items-center bg-gradient-to-r from-red-400 to-gray-300 px-2 py-0.5 rounded-lg">
                      <p className="text-border text-white">最大连击数</p>
                      <p>{data.score?.combo_cnt}</p>
                    </div>
                  </div>
                  <div className="space-y-1 col-span-2 md:col-span-1 text-border text-white">
                    <div className="flex justify-center items-center bg-gray-200 px-2 py-0.5 rounded-lg">
                      <p>游玩统计</p>
                    </div>
                    <div className="gap-1 grid grid-cols-2 md:grid-cols-1">
                      <div className="flex justify-between items-center bg-gray-200 px-2 py-0.5 rounded-lg">
                        <p>游玩次数</p>
                        <p>{data.score?.stage_cnt}</p>
                      </div>
                      <div className="flex justify-between items-center bg-gray-200 px-2 py-0.5 rounded-lg">
                        <p>通关次数</p>
                        <p>{data.score?.clear_cnt}</p>
                      </div>
                      <div className="flex justify-between items-center bg-gray-200 px-2 py-0.5 rounded-lg">
                        <p>全连次数</p>
                        <p>{data.score?.full_combo_cnt}</p>
                      </div>
                      <div className="flex justify-between items-center bg-gray-200 px-2 py-0.5 rounded-lg">
                        <p>全良连段次数</p>
                        <p>{data.score?.dondaful_combo_cnt}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2 opacity-50 m-auto">
                  <img className="w-35" src="/img/sticker/sticker_2.png" alt="" />
                  <p>还没有该难度的游玩记录咚~</p>
                </div>
              )}
            </div>
          </div>
          <div>
            <Button onClick={jumpToWiki} className="mt-4 w-full">Taiko Wiki</Button>
          </div>
        </div>
      </div>
    </dialog>
  )
}

export default Detail
