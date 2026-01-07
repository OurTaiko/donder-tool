import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import { AppProvider } from './contexts/AppContext'
import { Loader2 } from 'lucide-react'
import 'virtual:uno.css'
import '@unocss/reset/tailwind.css'

const SearchPage = lazy(() => import('./pages/Search'))
const ScorePage = lazy(() => import('./pages/Score'))
const DifficultyChartPage = lazy(() => import('./pages/DifficultyChart'))

const PageLoader = () => (
  <div className="flex justify-center items-center w-full h-full min-h-[50vh]">
    <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
  </div>
)

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Navigate to="/search" replace />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="score" element={<ScorePage />} />
              <Route path="difficulty" element={<DifficultyChartPage />} />
            </Route>
          </Routes>
        </Suspense>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
)
