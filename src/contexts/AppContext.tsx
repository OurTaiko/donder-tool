import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import axios from 'axios'
import { RawToSong, Song } from '../types/Song'
import { RawToScore, Score } from '../types/Score'

interface AppContextType {
  scrollContainer: HTMLElement | null
  setScrollContainer: (el: HTMLElement | null) => void
  detailVisible: boolean
  setDetailVisible: (visible: boolean) => void
  detailSongId: number | undefined
  setDetailSongId: (id: number | undefined) => void
  detailLevel: number | undefined
  setDetailLevel: (level: number | undefined) => void
  songData: Song[] | undefined
  songDataLoading: boolean
  fetchSongData: () => Promise<void>
  userId: number | null
  setUserId: (id: number | null) => void
  scores: Score[]
  setScores: (scores: Score[]) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailSongId, setDetailSongId] = useState<number | undefined>()
  const [detailLevel, setDetailLevel] = useState<number | undefined>()
  const [songData, setSongData] = useState<Song[] | undefined>()
  const [songDataLoading, setSongDataLoading] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const [scores, setScores] = useState<Score[]>([])

  const fetchSongData = useCallback(async () => {
    if (songData || songDataLoading) return
    setSongDataLoading(true)
    try {
      const songResponse = await axios.get('https://cdn.ourtaiko.org/api/cnsongs')
      setSongData(songResponse.data.map(RawToSong))
    } catch (error) {
      console.error('Failed to fetch song data:', error)
    } finally {
      setSongDataLoading(false)
    }
  }, [songData, songDataLoading])

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    const token = localStorage.getItem('token')
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    
    if (storedUserId) {
      const id = Number(storedUserId)
      setUserId(id)
      
      // 加载用户成绩数据
      const loadScores = async () => {
        try {
          const res = await axios.get('https://hasura.llx.life/api/rest/donder/get-score', {
            params: { id }
          })
          const resData = res.data.score
          if (resData) {
            const scoresData = JSON.parse(resData.data)
            setScores(scoresData.map(RawToScore))
          }
        } catch (error) {
          console.error('Failed to load scores:', error)
        }
      }
      loadScores()
    }
  }, [])

  const value: AppContextType = {
    scrollContainer,
    setScrollContainer,
    detailVisible,
    setDetailVisible,
    detailSongId,
    setDetailSongId,
    detailLevel,
    setDetailLevel,
    songData,
    songDataLoading,
    fetchSongData,
    userId,
    setUserId,
    scores,
    setScores,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
