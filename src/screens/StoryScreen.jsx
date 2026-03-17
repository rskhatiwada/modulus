import { useParams, useNavigate } from 'react-router-dom'
import { courses } from '../data/courses'
import { loadProgress, initProgress } from '../utils/storage'

export default function StoryScreen() {
  const { domain, topic, slug } = useParams()
  const navigate = useNavigate()

  const course = courses.find(c => c.slug === slug)

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Course not found.</p>
      </div>
    )
  }

  function handleStart() {
    // Initialise progress if first visit
    const existing = loadProgress(slug)
    if (!existing) initProgress(slug)
    navigate(`/${domain}/${topic}/${slug}/quiz/level-1`)
  }

  // Split story into paragraphs
  const paragraphs = course.story
    .split('\n\n')
    .map(p => p.trim())
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10 max-w-2xl mx-auto">

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="text-gray-500 text-sm mb-8 flex items-center gap-1 
                   hover:text-white transition-colors"
      >
        ← Back
      </button>

      {/* Domain tag */}
      <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
        {course.domain.replace('-', ' ')} · {course.topic.replace(/-/g, ' ')}
      </span>

      {/* Title */}
      <h1 className="text-white font-bold text-2xl mt-2 leading-snug">
        {course.titleDisplay}
      </h1>
      <p className="text-gray-400 text-sm mt-1">{course.tagline}</p>

      {/* Divider */}
      <div className="border-t border-gray-800 my-6" />

      {/* Story */}
      <div className="flex flex-col gap-5">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-gray-300 text-base leading-relaxed">
            {para}
          </p>
        ))}
      </div>

      {/* Start Quiz button */}
      <div className="mt-12 pb-10">
        <button
          onClick={handleStart}
          className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95
                     text-white font-bold text-lg py-4 rounded-2xl
                     transition-all duration-200"
        >
          Start Quiz →
        </button>
      </div>

    </div>
  )
}