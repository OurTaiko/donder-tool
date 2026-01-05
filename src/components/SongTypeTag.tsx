import React from 'react'

interface SongTypeTagProps {
  type: string
}

const SongTypeTag: React.FC<SongTypeTagProps> = ({ type }) => {
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

  const getTypeAlias = (type: string) => {
    const aliasMap: Record<string, string> = {
      '流行音乐': '流行',
        '动漫音乐': '动漫',
        '游戏音乐': '游戏',
        '古典音乐': '古典',
        '儿童音乐': '儿童',
        '博歌乐音乐': '术曲',
        '综合音乐': '综合',
        '南梦宫原创音乐': '原创',
    }
    return aliasMap[type] || type
  }

  return (
    <p
      className={`text-sm px-2 py-1 rounded-full text-white text-shadow border-2 border-white ${getTypeClass(type)}`}
    >
      {getTypeAlias(type)}
    </p>
  )
}

export default SongTypeTag
