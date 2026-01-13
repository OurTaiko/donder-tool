import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Loader2, AlertCircle, Download } from 'lucide-react'
import { toPng } from 'html-to-image'
import { toast } from 'sonner'
import { useAppContext } from '../contexts/AppContext'
import { DifficultyChart as IDifficultyChart } from '../types/DifficultyChart'
import { Score } from '../types/Score'

const DifficultyChartPage: React.FC = () => {
    const { songData, scores, setDetailVisible, setDetailSongId, setDetailLevel } = useAppContext()
    
    // Filters
    const levels = ['10']
    const [selectedLevel, setSelectedLevel] = useState('10')
    
    const types = [
        // { label: '通关', value: 'clear' },
        { label: '全连', value: 'fc' },
        // { label: '全良', value: 'ap' }
    ]
    const [selectedType, setSelectedType] = useState('fc')

    const [chartData, setChartData] = useState<IDifficultyChart | null>(null)
    const [loading, setLoading] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    const chartRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError(null)
            try {
                const url = `https://cdn.ourtaiko.org/api/difficulty_chart/${selectedLevel}/${selectedType}`
                const res = await axios.get(url)
                setChartData(res.data)
            } catch (err) {
                console.error(err)
                setError('获取难度表失败，请稍后重试')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [selectedLevel, selectedType])
    
    const handleExportImage = async () => {
        if (!chartRef.current) return
        
        setExporting(true)
        const toastId = toast.loading('正在生成图片...', { duration: 10000 })
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            const dataUrl = await toPng(chartRef.current, {
                width: 2000,
                style: {
                    width: '2000px',
                    height: 'auto',
                    minHeight: 'fit-content',
                    maxHeight: 'none',
                    margin: '0',
                    padding: '80px 80px 140px 80px',
                    backgroundColor: '#fff7ed',
                    backgroundImage: 'linear-gradient(to bottom, #fbbf24, #fbbf24 160px, rgba(251, 191, 36, 0.1) 800px, transparent 100%), url(' + window.location.origin + '/img/bg.webp)',
                    backgroundSize: '100% 100%, cover',
                    backgroundPosition: 'center center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: '0',
                    overflow: 'visible',
                },
                backgroundColor: '#ffffff',
                cacheBust: true,
                skipAutoScale: true,
                pixelRatio: 2,
            })
            
            const link = document.createElement('a')
            link.download = `Taiko_Difficulty_Chart_${selectedLevel}_${selectedType}.png`
            link.href = dataUrl
            link.click()
            toast.success('图片已生成并开始下载', { id: toastId })
        } catch (err) {
            console.error('Export error:', err)
            toast.error('生成图片时遇到错误，请重试', { id: toastId })
        } finally {
            setExporting(false)
        }
    }
    
    // Better score finding logic
    const findScore = (songId: number, difficultyNum: number) => {
        return scores.find(s => s.song_no === songId && s.level === difficultyNum)
    }

    // Helper to determine status class
    const getStatusClass = (score: Score | undefined) => {
        if (!score) return 'bg-gray-100 border-gray-200'
        if (score.IsAP()) return 'bg-gradient-to-br from-indigo-100 to-purple-100 border-purple-300 ring-2 ring-purple-200'
        if (score.IsFC()) return 'bg-gradient-to-br from-yellow-100 to-orange-100 border-orange-300 ring-2 ring-orange-200'
        if (score.IsClear()) return 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400 ring-2 ring-gray-300' // Silver-ish
        return 'bg-green-50 border-green-200' // Played but not cleared?
    }
    
    const getStatusLabel = (score: Score | undefined) => {
         if (!score) return null
         if (score.IsAP()) return <img src="/img/crown/crown_rainbow.png" className="w-auto h-5 object-contain" alt="全良" />
         if (score.IsFC()) return <img src="/img/crown/crown_gold.png" className="w-auto h-5 object-contain" alt="全连" />
         if (score.IsClear()) return <img src="/img/crown/crown_silver.png" className="w-auto h-5 object-contain" alt="通关" />
         return <img src="/img/crown/crown_silver.png" className="opacity-0 w-auto h-5 object-contain" alt="通关" />
    }

    const handleCardClick = (songId: number, difficulty: number) => {
        setDetailSongId(songId)
        setDetailLevel(difficulty)
        setDetailVisible(true)
    }

    return (
        <div className="flex flex-col items-center gap-6 pb-20 w-full animate-fade-in">
             {/* Filter Section */}
             <div className="flex flex-wrap justify-center gap-4 bg-white/80 shadow-sm backdrop-blur-md p-4 rounded-2xl w-full max-w-4xl">
                 <div className="flex items-center gap-2">
                     <span className="font-bold text-gray-700">等级</span>
                     <div className="flex bg-gray-100 p-1 rounded-lg">
                        {levels.map(l => (
                            <button
                                key={l}
                                onClick={() => setSelectedLevel(l)}
                                className={`px-4 py-1 rounded-md text-sm font-medium transition-all ${
                                    selectedLevel === l 
                                    ? 'bg-white text-amber-600 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {l}★
                            </button>
                        ))}
                     </div>
                 </div>

                 <div className="flex items-center gap-2">
                     <span className="font-bold text-gray-700">类型</span>
                     <div className="flex bg-gray-100 p-1 rounded-lg">
                        {types.map(t => (
                            <button
                                key={t.value}
                                onClick={() => setSelectedType(t.value)}
                                className={`px-4 py-1 rounded-md text-sm font-medium transition-all ${
                                    selectedType === t.value 
                                    ? 'bg-white text-amber-600 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                     </div>
                 </div>

                 <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportImage}
                        disabled={exporting || loading || !chartData}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 shadow-sm px-4 py-1.5 rounded-lg font-medium text-white active:scale-95 transition-all"
                    >
                        {exporting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        <span>{exporting ? '正在生成...' : '保存图片'}</span>
                    </button>
                 </div>
             </div>

             {/* Content */}
             <div className={exporting ? 'w-[1840px]' : 'w-full max-w-5xl'} ref={chartRef}>
                {/* Export Header - Only visible during export via html-to-image processing */}
                {exporting && (
                    <div className="flex flex-col items-center mb-10 text-center">
                        <div className="flex items-center gap-4 mb-2">
                            <img src="/img/icon.webp" className="w-16 h-16" alt="icon" />
                            <h1 className="font-bold text-amber-900 text-6xl">太鼓达人难度分级表</h1>
                        </div>
                        <p className="mb-8 font-bold text-amber-900/40 text-2xl uppercase tracking-[0.3em]">prober.ourtaiko.org</p>
                        <div className="flex gap-4 text-xl">
                            <span className="bg-white/80 shadow-sm px-6 py-2 border border-amber-200 rounded-full font-bold text-amber-800">等级: {selectedLevel} ★</span>
                            <span className="bg-white/80 shadow-sm px-6 py-2 border border-amber-200 rounded-full font-bold text-amber-800">目标: {types.find(t => t.value === selectedType)?.label}</span>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center py-20 text-gray-500">
                        <AlertCircle className="mb-2 w-10 h-10" />
                        <p>{error}</p>
                    </div>
                ) : chartData ? (
                    <div className={`flex flex-col gap-8 ${exporting ? 'w-full px-0' : ''}`}>
                        {chartData.sections.map((section, idx) => (
                            <div key={idx} className={`bg-white/60 shadow-sm backdrop-blur-sm rounded-3xl ${exporting ? 'p-8 w-full' : 'p-4 sm:p-6'}`}>
                                <h3 className="inline-block mb-4 pb-2 border-amber-200 border-b-2 font-bold text-amber-900 text-xl">
                                    {section.name}
                                </h3>
                                <div className={`gap-4 grid ${exporting ? 'grid-cols-9' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'}`}>
                                    {section.songs.map((chartSong, sIdx) => {
                                        const songId = parseInt(chartSong.id)
                                        if (isNaN(songId)) return null
                                        
                                        const song = songData?.find(s => s.id === songId)
                                        if (!song) return null // Song not found in metadata
                                        if (song.levels.length < chartSong.difficulty) return null // Difficulty not available
                                        const level = song.levels[chartSong.difficulty - 1]
                                        if (!level || level === "-") return null // Level data missing

                                        const score = findScore(songId, chartSong.difficulty)
                                        const statusClass = getStatusClass(score)

                                        const iconSrc = `/img/level/level_${chartSong.difficulty}.png`

                                        return (
                                            <div 
                                                key={sIdx} 
                                                onClick={() => handleCardClick(songId, chartSong.difficulty)}
                                                className={`relative group h-24 flex flex-col justify-center items-center py-2 px-3 rounded-xl border-2 transition-all hover:scale-105 cursor-default overflow-hidden ${statusClass}`}
                                            >
                                                {/* Background Elements */}
                                                <img 
                                                    src={iconSrc} 
                                                    className="bottom-1 left-1 absolute opacity-50 w-8 h-8 object-contain pointer-events-none" 
                                                    alt="diff" 
                                                />
                                                <div className="top-1 right-1 absolute pointer-events-none">
                                                    {getStatusLabel(score)}
                                                </div>

                                                {/* Content */}
                                                <div className="z-10 mb-3 w-full font-bold text-gray-800 text-sm text-center line-clamp-2 leading-tight">
                                                    {song.song_name}
                                                </div>
                                                
                                                {score && score.high_score_result && (
                                                    <div className="right-0 bottom-1 left-0 absolute flex justify-center pointer-events-none">
                                                        <span className="bg-white/60 shadow-sm backdrop-blur-[2px] px-2 border border-white/50 rounded-full font-mono font-bold text-[14px] text-gray-600">
                                                            {score.high_score_result[0]}-{score.high_score_result[1]}-{score.high_score_result[2]}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                        
                        {/* Export Footer */}
                        {exporting && (
                            <div className="mt-8 pt-6 border-amber-200/50 border-t w-full text-center">
                                <p className="font-medium text-amber-900/40 text-lg">Donder Tool - ourtaiko.org</p>
                            </div>
                        )}
                    </div>
                ) : null}
             </div>
        </div>
    )
}

export default DifficultyChartPage
