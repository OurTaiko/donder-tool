import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import { AppProvider } from './contexts/AppContext'
import { Loader2 } from 'lucide-react'
import 'virtual:uno.css'
import '@unocss/reset/tailwind.css'

const Search = lazy(() => import('./pages/Search'))
const Score = lazy(() => import('./pages/Score'))

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
              <Route path="search" element={<Search />} />
              <Route path="score" element={<Score />} />
            </Route>
          </Routes>
        </Suspense>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
)
