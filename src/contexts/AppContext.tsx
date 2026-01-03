import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface AppContextType {
  scrollContainer: HTMLElement | null
  setScrollContainer: (el: HTMLElement | null) => void
  detailVisible: boolean
  setDetailVisible: (visible: boolean) => void
  detailSongId: number | undefined
  setDetailSongId: (id: number | undefined) => void
  detailLevel: number | undefined
  setDetailLevel: (level: number | undefined) => void
  songData: any[] | undefined
  userId: number | null
  setUserId: (id: number | null) => void
  scores: any[]
  setScores: (scores: any[]) => void
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
  const [songData, setSongData] = useState<any[] | undefined>()
  const [userId, setUserId] = useState<number | null>(null)
  const [scores, setScores] = useState<any[]>([])

  useEffect(() => {
    const fetchSongData = async () => {
      const songResponse = await axios.get('https://cdn.ourtaiko.org/api/cnsongs')
      setSongData(songResponse.data)
    }

    const storedUserId = localStorage.getItem('userId')
    if (storedUserId) {
      setUserId(Number(storedUserId))
    }

    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }

    fetchSongData()
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
    userId,
    setUserId,
    scores,
    setScores,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
