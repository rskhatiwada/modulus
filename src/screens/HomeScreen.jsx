import { useNavigate } from 'react-router-dom'
import { courses } from '../data/courses'
import { loadProgress } from '../utils/storage'

export default function HomeScreen() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10 max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Scientific<span className="text-blue-500">FREAK</span>
        </h1>
        <p className="text-gray-400 mt-1 text-sm">Be an expert in 15 minutes.</p>
      </div>

      {/* Course Cards */}
      <div className="flex flex-col gap-4">
        {courses.map(course => {
          const progress = loadProgress(course.slug)
          const badge = progress?.badgeEarned
          const started = !!progress
          const level1Score = progress?.levelScores?.[1]
          const completed = progress?.completedAt

          return (
            <div
              key={course.slug}
              onClick={() => navigate(
                `/${course.domain}/${course.topic}/${course.slug}/story`
              )}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 
                         cursor-pointer hover:border-blue-500 
                         transition-all duration-200 active:scale-95"
            >
              {/* Domain tag */}
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
                {course.domain.replace('-', ' ')} · {course.topic.replace(/-/g, ' ')}
              </span>

              {/* Title */}
              <h2 className="text-white font-bold text-lg mt-1 leading-snug">
                {course.titleDisplay}
              </h2>

              {/* Tagline */}
              <p className="text-gray-400 text-sm mt-1">{course.tagline}</p>

              {/* Status row */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  {badge && (
                    <span className="text-yellow-400 text-lg">🏆</span>
                  )}
                  {completed && !badge && (
                    <span className="text-gray-500 text-xs">Completed</span>
                  )}
                  {started && !completed && (
                    <span className="text-blue-400 text-xs">In progress</span>
                  )}
                  {!started && (
                    <span className="text-gray-600 text-xs">Not started</span>
                  )}
                </div>

                {/* Level indicators */}
                <div className="flex gap-1">
                  {[1, 2, 3].map(lvl => {
                    const score = progress?.levelScores?.[lvl]
                    const unlocked = progress?.levelsUnlocked?.includes(lvl)
                    return (
                      <div
                        key={lvl}
                        className={`w-6 h-6 rounded-full text-xs font-bold 
                                    flex items-center justify-center
                                    ${score >= 0.7
                                      ? 'bg-blue-500 text-white'
                                      : unlocked
                                        ? 'bg-gray-700 text-gray-300'
                                        : 'bg-gray-800 text-gray-600'
                                    }`}
                      >
                        {lvl}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}