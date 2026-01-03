import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import Search from './pages/Search'
import Score from './pages/Score'
import { AppProvider } from './contexts/AppContext'
import 'virtual:uno.css'
import '@unocss/reset/tailwind.css'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Navigate to="/search" replace />} />
            <Route path="search" element={<Search />} />
            <Route path="score" element={<Score />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
)
