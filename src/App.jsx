import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import StoryScreen from './screens/StoryScreen'
import QuizScreen from './screens/QuizScreen'
import BlitzScreen from './screens/BlitzScreen'
import BossScreen from './screens/BossScreen'
import ResultScreen from './screens/ResultScreen'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
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