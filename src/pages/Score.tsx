import axios from 'axios'
import { ChevronDown, ChevronUp, Info, Loader2, Search as SearchIcon } from 'lucide-react'
import React, { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { toast } from 'sonner'
import Button from '../components/Button'
import SongTypeTag from '../components/SongTypeTag'
import TogglePublicDialog from '../components/TogglePublicDialog'
import { useAppContext } from '../contexts/AppContext'
import { RawToScore, Score } from '../types/Score'

const ScorePage: React.FC = () => {
    const { userId, setUserId, scores, setScores, setDetailVisible, setDetailSongId, setDetailLevel, scrollContainer } = useAppContext()

    const types = ['全部', '流行', '动漫', '游戏', '古典', '儿童', '博歌乐', '综合', '南梦宫原创']
    const [selectedType, setSelectedType] = useState('全部')

    const crowns = ['全部', '未通关', '银冠', '金冠', '虹冠']
    const [selectedCrown, setSelectedCrown] = useState('全部')

    const levels = ['全部', '简单', '一般', '困难', '魔王', '魔王里']
    const [selectedLevel, setSelectedLevel] = useState('全部')

    const ranks = ['全部', '白粹', '铜粹', '银粹', '金雅', '粉雅', '紫雅', '极']
    const [selectedRank, setSelectedRank] = useState('全部')

    const sorts = ['更新时间', '刷新记录时间', '得分', '难度']
    const [selectedSort, setSelectedSort] = useState('更新时间')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

    const [searchQuery, setSearchQuery] = useState('')
    const deferredSearchQuery = useDeferredValue(searchQuery)
    const [bindLoading, setBindLoading] = useState(false)
    const [authHintVisible, setAuthHintVisible] = useState(false)
    const [updateTime, setUpdateTime] = useState('')
    const [isPublic, setIsPublic] = useState(false)
    const [togglePublicDialogVisible, setTogglePublicDialogVisible] = useState(false)
    const [inputUserId, setInputUserId] = useState<string>('')
    const [scoresLoading, setScoresLoading] = useState(false)
    const [isComponentReady, setIsComponentReady] = useState(false)

    const selectSort = (sort: string) => {
        if (selectedSort === sort) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSelectedSort(sort)
            setSortDirection('desc')
        }
    }

    const getScore = async (id: number) => {
        const res = await axios.get('https://hasura.llx.life/api/rest/donder/get-score', {
            params: { id }
        })
        const resData = res.data.score
        if (!resData) {
            return { scores: [], updateTime: '' }
        }
        const scores = JSON.parse(resData.data).map(RawToScore)
        const date = new Date(resData.updated_at)
        const updateTime = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
        setIsPublic(resData.isPublic)
        return { scores, updateTime }
    }

    const refreshScore = (id: number) => {
        return axios.post('https://donder.llx.life/refresh_score', { id: Number(id) })
    }

    const handleBindClick = async () => {
        if (!inputUserId) return
        const id = Number(inputUserId)
        localStorage.setItem('userId', id.toString())
        setBindLoading(true)

        try {
            const res = await axios.post('https://donder.llx.life/auth', { id })

            if (res.data.success) {
                if (res.data.token) {
                    localStorage.setItem('token', res.data.token)
                    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
                    let { scores: fetchedScores, updateTime: fetchedTime } = await getScore(id)

                    if (!fetchedScores || fetchedScores.length === 0) {
                        const res = await refreshScore(id)
                        if (res.data.success) {
                            const result = await getScore(id)
                            fetchedScores = result.scores
                            fetchedTime = result.updateTime
                        } else {
                            toast.error(res.data.error || '绑定失败，请稍后重试咚~')
                        }
                    }

                    setScores(fetchedScores)
                    setUpdateTime(fetchedTime)
                    setUserId(id)
                    toast.success('绑定成功咚~')
                } else if (res.data.needAuth) {
                    toast.info(res.data.message)
                    setAuthHintVisible(true)
                    setBindLoading(false)
                    return
                }
            } else {
                toast.error(res.data.error || '绑定失败，请稍后重试咚~')
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            toast.error(e.response?.data?.error || '绑定失败，请稍后重试咚~')
        } finally {
            setBindLoading(false)
        }
    }

    const handleSyncClick = async () => {
        if (!userId) return
        setBindLoading(true)

        try {
            const res = await refreshScore(userId)
            if (res.data.success) {
                const { scores: newScores, updateTime: newUpdateTime } = await getScore(userId)
                setScores(newScores)
                setUpdateTime(newUpdateTime)
                toast.success('同步成功咚~')
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            toast.error(e.response?.data?.error || '同步失败，请稍后重试咚~')
        } finally {
            setBindLoading(false)
        }
    }

    const handleUnbind = () => {
        localStorage.removeItem('userId')
        setUserId(null)
        setScores([])
    }

    const handleExport = () => {
        if (!scores || scores.length === 0) {
            toast.error('暂无成绩可导出咚~')
            return
        }

        const dataStr = JSON.stringify(scores, null, 2)
        const blob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = `taiko_scores_${userId || 'unknown'}.json`
        document.body.appendChild(link)
        link.click()

        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success('导出成功咚~')
    }

    const handleTogglePublic = () => {
        setTogglePublicDialogVisible(true)
    }

    const handleConfirmTogglePublic = async () => {
        if (!userId) return

        try {
            const res = await axios.post('https://donder.llx.life/update_public', { isPublic: !isPublic })
            if (res.data.success) {
                setIsPublic(!isPublic)
                toast.success(isPublic ? '成绩已隐藏咚~' : '成绩已公开咚~')
            } else {
                toast.error(res.data.error || '操作失败，请稍后重试咚~')
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            toast.error(e.response?.data?.error || '操作失败，请稍后重试咚~')
        } finally {
            setTogglePublicDialogVisible(false)
        }
    }

    const filteredScores = useMemo(() => {
        let filtered = scores

        if (deferredSearchQuery) {
            const query = deferredSearchQuery.toLowerCase()
            filtered = filtered.filter((score: Score) =>
                score.song_detail?.song_name?.toLowerCase().includes(query) ||
                score.song_detail?.subtitle?.toLowerCase().includes(query) ||
                score.song_detail?.song_name_jp?.toLowerCase().includes(query)
            )
        }

        if (selectedType !== '全部') {
            filtered = filtered.filter((score: Score) => score.song_detail?.type === `${selectedType}音乐`)
        }

        if (selectedLevel !== '全部') {
            const levelMap: Record<string, number> = {
                '简单': 1, '一般': 2, '困难': 3, '魔王': 4, '魔王里': 5,
            }
            const levelNum = levelMap[selectedLevel]
            filtered = filtered.filter((score: Score) => score.level === levelNum)
        }

        if (selectedCrown !== '全部') {
            filtered = filtered.filter((score: Score) => {
                if (selectedCrown === '未通关') return !score.IsClear()
                if (selectedCrown === '银冠') return score.IsClear() && !score.IsFC()
                if (selectedCrown === '金冠') return score.IsFC() && !score.IsAP()
                if (selectedCrown === '虹冠') return score.IsAP()
                return true
            })
        }

        if (selectedRank !== '全部') {
            const rankMap: Record<string, string> = {
                '白粹': '2', '铜粹': '3', '银粹': '4', '金雅': '5', '粉雅': '6', '紫雅': '7', '极': '8',
            }
            filtered = filtered.filter((score: Score) => score.best_score_rank.toString() === rankMap[selectedRank])
        }

        filtered.sort((a: Score, b: Score) => {
            let aValue: number, bValue: number

            switch (selectedSort) {
                case '更新时间': {
                    aValue = new Date(a.update_datetime).getTime()
                    bValue = new Date(b.update_datetime).getTime()
                    break
                }
                case '刷新记录时间': {
                    aValue = new Date(a.highscore_datetime).getTime()
                    bValue = new Date(b.highscore_datetime).getTime()
                    break
                }
                case '得分': {
                    aValue = a.high_score
                    bValue = b.high_score
                    break
                }
                case '难度': {
                    const aLevel = a.level
                    const bLevel = b.level
                    if (aLevel !== bLevel) {
                        aValue = aLevel
                        bValue = bLevel
                    } else {
                        const levelKey = `level_${aLevel}`
                        const aLevelStr = a.song_detail?.[levelKey] || '-'
                        const bLevelStr = b.song_detail?.[levelKey] || '-'
                        aValue = aLevelStr === '-' ? (sortDirection === 'asc' ? Infinity : -Infinity) : parseInt(aLevelStr)
                        bValue = bLevelStr === '-' ? (sortDirection === 'asc' ? Infinity : -Infinity) : parseInt(bLevelStr)
                    }
                    break
                }
                default:
                    aValue = 0
                    bValue = 0
            }

            return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
        })

        return filtered.map((item: Score) => {
            let crown = ''
            if (item.IsAP()) crown = 'rainbow'
            else if (item.IsFC()) crown = 'gold'
            else if (item.IsClear()) crown = 'silver'

            return {
                songId: item.song_no,
                type: item.song_detail?.type || '',
                song_name: item.song_detail?.song_name || '未知曲目',
                subtitle: item.song_detail?.subtitle || '',
                levels:[
                  item.song_detail?.level_1 || '-',
                  item.song_detail?.level_2 || '-',
                  item.song_detail?.level_3 || '-',
                  item.song_detail?.level_4 || '-',
                  item.song_detail?.level_5 || '-',
                ],
                level: item.level,
                high_score: item.high_score,
                best_score_rank: item.best_score_rank,
                crown,
            }
        })
    }, [scores, deferredSearchQuery, selectedType, selectedLevel, selectedCrown, selectedRank, selectedSort, sortDirection])

    const handleOpenDetail = (songId: number, level: number) => {
        setDetailSongId(songId)
        setDetailLevel(level)
        setDetailVisible(true)
    }


    useEffect(() => {
        setIsComponentReady(false)
        const loadMetadata = async () => {
            if (userId) {
                setScoresLoading(true)
                try {
                    const { updateTime: newUpdateTime } = await getScore(userId)
                    setUpdateTime(newUpdateTime)
                } catch (error) {
                    console.error('Failed to load metadata:', error)
                } finally {
                    setScoresLoading(false)
                }
            }
            // 给一个短暂的延迟让加载动画显示
            setTimeout(() => setIsComponentReady(true), 100)
        }
        loadMetadata()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="flex flex-col items-center gap-8 mx-auto my-8 w-full max-w-screen-xl text-dark">
            {!isComponentReady || scoresLoading ? (
                <div className="flex flex-col justify-center items-center space-y-4 py-20">
                    <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                    <p className="text-gray-600 text-lg">正在加载成绩数据咚~</p>
                </div>
            ) : !scores.length ? (
                <div className="flex flex-col items-center space-y-4 bg-white/50 p-4 border-2 border-white rounded-xl ring-2 ring-amber-950 w-100 max-w-full">
                    <img className="w-30" src="/img/sticker/sticker_1.png" alt="" />
                    <input
                        value={inputUserId}
                        onChange={(e) => setInputUserId(e.target.value)}
                        type="number"
                        placeholder="请输入要查询成绩的玩家ID咚~"
                        className="bg-white p-4 border-2 border-white rounded-xl outline-none ring-2 ring-amber-950 w-full"
                    />
                    {authHintVisible && (
                        <p className="max-w-xs text-rose-600 text-sm text-center">
                            请在五分钟内，前往"鼓众广场"小程序更换与当前不一样的头部肤色以完成验证咚~
                        </p>
                    )}
                    <div onClick={handleBindClick}>
                        <Button disabled={!inputUserId || bindLoading}>
                            {bindLoading ? '绑定中...' : '确认'}
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center bg-white/50 p-4 border-2 border-white rounded-xl ring-2 ring-amber-950 w-full">
                        <div>
                            <p>同步时间：{updateTime}</p>
                            <div className="flex space-x-2">
                                <p className="text-amber-600 hover:underline cursor-pointer" onClick={handleUnbind}>解除绑定</p>
                                <p className="text-amber-600 hover:underline cursor-pointer" onClick={handleExport}>导出成绩</p>
                                <p className="text-amber-600 hover:underline cursor-pointer" onClick={handleTogglePublic}>
                                    {isPublic ? '隐藏成绩' : '公开成绩'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div onClick={handleSyncClick}>
                                <Button disabled={bindLoading}>
                                    {bindLoading ? '同步中...' : '同步成绩'}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4 bg-white/50 p-4 border-2 border-white rounded-xl ring-2 ring-amber-950 w-full">
                        <div className="relative flex items-center">
                            <SearchIcon className="absolute ml-4" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                type="text"
                                placeholder="搜索曲目咚~"
                                className="bg-white p-4 pl-12 border-2 border-white rounded-xl outline-none ring-2 ring-amber-950 w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <p className="w-15">分类</p>
                                <div className="flex flex-wrap flex-1 gap-x-2 gap-y-1 min-w-0">
                                    {types.map((type) => (
                                        <p
                                            key={type}
                                            onClick={() => setSelectedType(type)}
                                            className={`text-amber-950 px-2 py-0.5 rounded cursor-pointer transition-colors hover:bg-amber-400/50 ${selectedType === type ? 'text-border !bg-amber-400 text-white' : ''
                                                }`}
                                        >
                                            {type}
                                        </p>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center">
                                <p className="w-15">难度</p>
                                <div className="flex flex-wrap flex-1 gap-x-2 gap-y-1 min-w-0">
                                    {levels.map((level) => (
                                        <p
                                            key={level}
                                            onClick={() => setSelectedLevel(level)}
                                            className={`text-amber-950 px-2 py-0.5 rounded cursor-pointer transition-colors hover:bg-amber-400/50 ${selectedLevel === level ? 'text-border !bg-amber-400 text-white' : ''
                                                }`}
                                        >
                                            {level}
                                        </p>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center">
                                <p className="w-15">皇冠</p>
                                <div className="flex flex-wrap flex-1 gap-x-2 gap-y-1 min-w-0">
                                    {crowns.map((crown) => (
                                        <p
                                            key={crown}
                                            onClick={() => setSelectedCrown(crown)}
                                            className={`text-amber-950 px-2 py-0.5 rounded cursor-pointer transition-colors hover:bg-amber-400/50 ${selectedCrown === crown ? 'text-border !bg-amber-400 text-white' : ''
                                                }`}
                                        >
                                            {crown}
                                        </p>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center">
                                <p className="w-15">评价</p>
                                <div className="flex flex-wrap flex-1 gap-x-2 gap-y-1 min-w-0">
                                    {ranks.map((rank) => (
                                        <p
                                            key={rank}
                                            onClick={() => setSelectedRank(rank)}
                                            className={`text-amber-950 px-2 py-0.5 rounded cursor-pointer transition-colors hover:bg-amber-400/50 ${selectedRank === rank ? 'text-border !bg-amber-400 text-white' : ''
                                                }`}
                                        >
                                            {rank}
                                        </p>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center">
                                <p className="w-15">排序</p>
                                <div className="flex flex-wrap flex-1 gap-x-2 gap-y-1 min-w-0">
                                    {sorts.map((sort) => (
                                        <div
                                            key={sort}
                                            onClick={() => selectSort(sort)}
                                            className={`text-amber-950 px-2 py-0.5 rounded cursor-pointer flex items-center hover:bg-amber-400/50 ${selectedSort === sort ? 'text-border !bg-amber-400 text-white' : ''
                                                }`}
                                        >
                                            <p>{sort}</p>
                                            {selectedSort === sort && sortDirection === 'desc' && (
                                                <ChevronDown className="opacity-50 w-5 !text-amber-950" />
                                            )}
                                            {selectedSort === sort && sortDirection === 'asc' && (
                                                <ChevronUp className="opacity-50 w-5 !text-amber-950" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-blue-200 shadow px-4 py-2 rounded-full text-sm">
                        <Info className="w-5" />
                        <p>查找到 {filteredScores.length} 条数据</p>
                    </div>
                    <div className="w-full">
                        <Virtuoso
                            customScrollParent={scrollContainer || undefined}
                            data={filteredScores}
                            itemContent={(_, score: any) => (
                                <div className="pb-4">
                                    <div
                                        onClick={() => handleOpenDetail(score.songId, score.level)}
                                        className="p-4 rounded-xl flex flex-col gap-1 justify-between transition-colors hover:(bg-black/5) md:(flex-row items-center)"
                                    >
                                        <div className="flex items-center space-x-2">
                                            {score.type && (
                                                <SongTypeTag type={score.type} />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xl">{score.song_name}</p>
                                                {score.subtitle && <p className="text-gray-500 text-sm">{score.subtitle}</p>}
                                            </div>
                                        </div>
                                        <div className="flex space-x-4 items-center justify-end w-75 rounded-xl mx-auto bg-black/5 p-2 md:(mx-0 p-0 bg-transparent)">
                                            {score.crown && <img className="w-10" src={`/img/crown/crown_${score.crown}.png`} alt="" />}
                                            <img className="w-10" src={`/img/score_badge/score_${score.best_score_rank}.png`} alt="" />
                                            <div>
                                                <p className="text-border w-24 font-bold text-white text-2xl text-center">{score.high_score}</p>
                                            </div>
                                            <div
                                                className={`relative w-15 h-10 rounded-lg border-2 border-white ${score.level === 1 ? 'bg-red-300' :
                                                        score.level === 2 ? 'bg-lime-300' :
                                                            score.level === 3 ? 'bg-blue-300' :
                                                                score.level === 4 ? 'bg-pink-300' : 'bg-purple-300'
                                                    }`}
                                            >
                                                <div className="absolute bg-gradient-to-b from-white/50 to-transparent w-full h-full"></div>
                                                <div className="relative flex justify-center items-center space-x-1 w-full h-full">
                                                    <img className="w-6" src={`/img/level/level_${score.level}.png`} alt="" />
                                                    <p className="text-border font-bold text-white text-xl">
                                                        {(score as any)[`level_${score.level}`] || '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        />
                    </div>
                    {togglePublicDialogVisible && (
                        <TogglePublicDialog
                            visible={togglePublicDialogVisible}
                            onVisibleChange={setTogglePublicDialogVisible}
                            isPublic={isPublic}
                            loading={bindLoading}
                            onConfirm={handleConfirmTogglePublic}
                        />
                    )}
                </>
            )}
        </div>
    )
}

export default ScorePage
