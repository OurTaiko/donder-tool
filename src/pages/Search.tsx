import React, { useState, useMemo, useEffect, useDeferredValue } from 'react'
import { Search as SearchIcon, Info, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useAppContext } from '../contexts/AppContext'
import { Virtuoso } from 'react-virtuoso'
import SongTypeTag from '../components/SongTypeTag'
import { Song } from '../types/Song'

const Search: React.FC = () => {
  const { songData, songDataLoading, fetchSongData, setDetailVisible, setDetailSongId, setDetailLevel, scrollContainer } = useAppContext()
  const [isComponentReady, setIsComponentReady] = useState(false)

  useEffect(() => {
    setIsComponentReady(false)
    const loadData = async () => {
      await fetchSongData()
      // 给一个短暂的延迟让加载动画显示
      setTimeout(() => setIsComponentReady(true), 100)
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const types = ['全部', '流行', '动漫', '游戏', '古典', '儿童', '博歌乐', '综合', '南梦宫原创']
  const [selectedType, setSelectedType] = useState('全部')
  
  const sorts = ['默认', '简单', '一般', '困难', '魔王', '魔王里', '上线日期']
  const [selectedSort, setSelectedSort] = useState('默认')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)

  const selectSort = (sort: string) => {
    if (sort === '默认') {
      setSelectedSort('默认')
      return
    }
    if (selectedSort === sort) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSelectedSort(sort)
      setSortDirection('desc')
    }
  }

  const filteredSongs = useMemo(() => {
    let filtered = songData || []

    // 搜索
    if (deferredSearchQuery) {
      const query = deferredSearchQuery.toLowerCase()
      filtered = filtered.filter((song: Song) =>
        song.song_name.toLowerCase().includes(query) ||
        (song.subtitle && typeof song.subtitle === 'string' && song.subtitle.toLowerCase().includes(query)) ||
        song.song_name_jp.toLowerCase().includes(query)
      )
    }

    // 类型筛选
    if (selectedType !== '全部') {
      filtered = filtered.filter((song: Song) => song.type === `${selectedType}音乐`)
    }

    // 排序
    const sortKey = selectedSort
    const multiplier = sortDirection === 'asc' ? 1 : -1
    if (sortKey === '简单') {
      filtered = [...filtered].sort((a, b) => multiplier * (parseInt(String(a.levels[0])) - parseInt(String(b.levels[0]))))
    } else if (sortKey === '一般') {
      filtered = [...filtered].sort((a, b) => multiplier * (parseInt(String(a.levels[1])) - parseInt(String(b.levels[1]))))
    } else if (sortKey === '困难') {
      filtered = [...filtered].sort((a, b) => multiplier * (parseInt(String(a.levels[2])) - parseInt(String(b.levels[2]))))
    } else if (sortKey === '魔王') {
      filtered = [...filtered].sort((a, b) => multiplier * (parseInt(String(a.levels[3])) - parseInt(String(b.levels[3]))))
    } else if (sortKey === '魔王里') {
      filtered = [...filtered].sort((a, b) => {
        const aLevel = a.levels[4] && a.levels[4] !== '-' ? parseInt(String(a.levels[4])) : parseInt(String(a.levels[3]))
        const bLevel = b.levels[4] && b.levels[4] !== '-' ? parseInt(String(b.levels[4])) : parseInt(String(b.levels[3]))
        return multiplier * (aLevel - bLevel)
      })
    } else if (sortKey === '上线日期') {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.open_day).getTime()
        const dateB = new Date(b.open_day).getTime()
        return multiplier * (dateA - dateB)
      })
    }

    return filtered
  }, [songData, deferredSearchQuery, selectedType, selectedSort, sortDirection])

  const handleOpenDetail = (songId: number, level: number) => {
    setDetailSongId(songId)
    setDetailLevel(level)
    setDetailVisible(true)
  }

  return (
    <div className="flex flex-col items-center gap-8 mx-auto my-8 w-full max-w-screen-xl text-dark">
      {!isComponentReady || songDataLoading || !songData ? (
        <div className="flex flex-col justify-center items-center space-y-4 py-20">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
          <p className="text-gray-600 text-lg">正在加载曲目数据咚~</p>
        </div>
      ) : songData.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-gray-600 text-lg">暂无曲目数据咚~</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 bg-white/50 p-4 border-2 border-white rounded-xl ring-2 ring-amber-950 w-full">
        {/* 搜索 */}
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
        {/* 筛选与排序 */}
        <div className="space-y-2">
          <div className="flex items-center">
            <p className="w-15">分类</p>
            <div className="flex flex-wrap flex-1 gap-x-2 gap-y-1 min-w-0">
              {types.map((type) => (
                <p
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`text-amber-950 px-2 py-0.5 rounded cursor-pointer transition-colors hover:bg-amber-400/50 ${
                    selectedType === type ? 'text-border !bg-amber-400 text-white' : ''
                  }`}
                >
                  {type}
                </p>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <p className="w-15">排序</p>
            <div className="flex flex-wrap flex-1 gap-x-2 gap-y-1 min-w-0">
              {sorts.map((sort, index) => (
                <div
                  key={sort}
                  onClick={() => selectSort(sort)}
                  className={`text-amber-950 px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center hover:bg-amber-400/50 ${
                    selectedSort === sort ? 'text-border !bg-amber-400 text-white' : ''
                  }`}
                >
                  <p>{sort}</p>
                  {index > 0 && selectedSort === sort && sortDirection === 'desc' && (
                    <ChevronDown className="opacity-50 w-5 !text-amber-950" />
                  )}
                  {index > 0 && selectedSort === sort && sortDirection === 'asc' && (
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
        <p>查找到 {filteredSongs.length} 条数据</p>
      </div>
      <div className="w-full">
        <Virtuoso
          customScrollParent={scrollContainer || undefined}
          data={filteredSongs}
          itemContent={(_, song: Song) => (
            <div className="pb-4">
              <div
                onClick={() => handleOpenDetail(song.id, song.levels[4] && song.levels[4] !== '-' ? 5 : 4)}
                className="p-4 rounded-xl flex flex-col gap-1 justify-between transition-colors hover:(bg-black/5) md:(flex-row items-center)"
              >
                <div className="flex items-center space-x-2">
                  <SongTypeTag type={song.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xl">{song.song_name}</p>
                    {song.subtitle && <p className="text-gray-500 text-sm">{song.subtitle}</p>}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => {
                    const levelValue = song.levels[i - 1]
                    const hasLevel = levelValue && levelValue !== '-'
                    return (
                      <div
                        key={i}
                        onClick={(e) => {
                          if (hasLevel) {
                            e.stopPropagation()
                            handleOpenDetail(song.id, i)
                          }
                        }}
                        className={`relative w-15 h-10 rounded-lg border-2 border-white overflow-hidden ${
                          i === 1 ? 'bg-red-300' :
                          i === 2 ? 'bg-lime-300' :
                          i === 3 ? 'bg-blue-300' :
                          i === 4 ? 'bg-pink-300' : 'bg-purple-300'
                        } ${hasLevel ? 'cursor-pointer transition-all hover:(ring-2 ring-amber-950)' : ''}`}
                      >
                        <div className="absolute bg-gradient-to-b from-white/50 to-transparent w-full h-full"></div>
                        <div className="relative flex justify-center items-center space-x-1 w-full h-full">
                          <img className="w-6" src={`/img/level/level_${i}.png`} alt="" />
                          <p className="text-border font-bold text-white text-xl">{levelValue || '-'}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        />
      </div>
        </>
      )}
    </div>
  )
}

export default Search
