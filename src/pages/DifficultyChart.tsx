import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Loader2, AlertCircle } from 'lucide-react'
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
    const [error, setError] = useState<string | null>(null)

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
             </div>

             {/* Content */}
             <div className="w-full max-w-5xl">
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
                    <div className="flex flex-col gap-8">
                        {chartData.sections.map((section, idx) => (
                            <div key={idx} className="bg-white/60 shadow-sm backdrop-blur-sm p-4 sm:p-6 rounded-3xl">
                                <h3 className="inline-block mb-4 pb-2 border-amber-200 border-b-2 font-bold text-amber-900 text-xl">
                                    {section.name}
                                </h3>
                                <div className="gap-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
                    </div>
                ) : null}
             </div>
        </div>
    )
}

export default DifficultyChartPage
