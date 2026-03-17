import { useParams, useNavigate } from 'react-router-dom'
import { courses } from '../data/courses'
import { loadProgress } from '../utils/storage'

export default function ResultScreen() {
  const { domain, topic, slug } = useParams()
  const navigate = useNavigate()

  const course = courses.find(c => c.slug === slug)
  const progress = loadProgress(slug)

  if (!course || !progress) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">No results found.</p>
      </div>
    )
  }

  const { profile, levelScores, badgeEarned } = progress

  const levelLabels = { 1: 'Level 1', 2: 'Level 2', 3: 'Level 3' }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10 max-w-2xl mx-auto">

      {/* Header */}
      <div className="text-center mb-10">
        {badgeEarned && (
          <p className="text-5xl mb-3">🏆</p>
        )}
        <h1 className="text-white text-2xl font-bold">
          {course.titleDisplay}
        </h1>
        <p className="text-gray-400 text-sm mt-1">Course Complete</p>
      </div>

      {/* Level Scores */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-5">
        <h2 className="text-gray-400 text-xs font-semibold uppercase 
                       tracking-widest mb-4">
          Level Scores
        </h2>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(lvl => {
            const score = levelScores[lvl]
            const pct = score !== null ? Math.round(score * 100) : null
            return (
              <div key={lvl} className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">
                  {levelLabels[lvl]}
                </span>
                <span className={`text-sm font-bold
                  ${pct === null
                    ? 'text-gray-600'
                    : pct >= 70
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}>
                  {pct !== null ? `${pct}%` : '—'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Diagnostic Profile */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-5">
        <h2 className="text-gray-400 text-xs font-semibold uppercase 
                       tracking-widest mb-4">
          Your Diagnostic Profile
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Calibration Score</span>
            <span className="text-blue-400 text-sm font-bold">
              {Math.round(profile.calibrationScore * 100)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Overconfidence Index</span>
            <span className={`text-sm font-bold
              ${profile.overconfidenceIndex > 0.5
                ? 'text-red-400'
                : profile.overconfidenceIndex > 0.25
                  ? 'text-yellow-400'
                  : 'text-green-400'
              }`}>
              {Math.round(profile.overconfidenceIndex * 100)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">System 1 Vulnerability</span>
            <span className={`text-sm font-bold
              ${profile.system1Vulnerability > 0.5
                ? 'text-red-400'
                : profile.system1Vulnerability > 0.25
                  ? 'text-yellow-400'
                  : 'text-green-400'
              }`}>
              {Math.round(profile.system1Vulnerability * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Misconceptions Detected */}
      {profile.misconceptionsDetected.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-8">
          <h2 className="text-gray-400 text-xs font-semibold uppercase 
                         tracking-widest mb-3">
            Misconceptions Detected
          </h2>
          <div className="flex flex-col gap-2">
            {profile.misconceptionsDetected.map(m => (
              <div key={m}
                className="bg-red-950 border border-red-900 
                           rounded-lg px-3 py-2">
                <span className="text-red-300 text-sm">
                  {m.replace(/-/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back to home */}
      <button
        onClick={() => navigate('/')}
        className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95
                   text-white font-bold text-lg py-4 rounded-2xl
                   transition-all duration-200"
      >
        ← Back to Home
      </button>

    </div>
  )
}