import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { SocketProvider } from './context/SocketContext.jsx'
import { useCrazyGamesAuth } from './hooks/useCrazyGamesAuth.js'
import { isCrazyGamesHost } from './lib/crazygames.js'
import BattlePage from './pages/BattlePage.jsx'
import PracticePage from './pages/PracticePage.jsx'
import HomePage from './pages/HomePage.jsx'
import ShopPage from './pages/ShopPage.jsx'
import LeaderboardPage from './pages/LeaderboardPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'

function CrazyGamesAuthBootstrap() {
  useCrazyGamesAuth({ auto: true })
  return null
}

/** Block email login/signup when embedded on CrazyGames */
function BlockExternalAuth({ children }) {
  const location = useLocation()
  if (isCrazyGamesHost() && (location.pathname === '/login' || location.pathname === '/signup')) {
    return <Navigate to="/" replace />
  }
  return children
}

export default function App() {
  return (
    <SocketProvider>
      <CrazyGamesAuthBootstrap />
      <BrowserRouter>
        <BlockExternalAuth>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/battle" element={<BattlePage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Routes>
        </BlockExternalAuth>
      </BrowserRouter>
    </SocketProvider>
  )
}
