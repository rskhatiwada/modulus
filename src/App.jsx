import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import HomeScreen from './screens/HomeScreen'
import StoryScreen from './screens/StoryScreen'
import QuizScreen from './screens/QuizScreen'
import BlitzScreen from './screens/BlitzScreen'
import BossScreen from './screens/BossScreen'
import ResultScreen from './screens/ResultScreen'

// Stub screens — replace with real ones later
function LearnScreen() { return <div className="p-6 text-white">My Learning — coming soon</div> }
function SearchScreen() { return <div className="p-6 text-white">Search — coming soon</div> }
function ProfileScreen() { return <div className="p-6 text-white">Profile — coming soon</div> }

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white">
        <Routes>

          {/* ── Screens WITH bottom nav ── */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/learn" element={<LearnScreen />} />
            <Route path="/search" element={<SearchScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
          </Route>

          {/* ── Immersive screens — NO bottom nav ── */}
          <Route path="/:domain/:topic/:slug/story" element={<StoryScreen />} />
          <Route path="/:domain/:topic/:slug/quiz/:level" element={<QuizScreen />} />
          <Route path="/:domain/:topic/:slug/blitz" element={<BlitzScreen />} />
          <Route path="/:domain/:topic/:slug/boss" element={<BossScreen />} />
          <Route path="/:domain/:topic/:slug/result" element={<ResultScreen />} />

        </Routes>
      </div>
    </BrowserRouter>
  )
}