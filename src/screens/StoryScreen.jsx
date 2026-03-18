import { useParams, useNavigate } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react'
import { courses } from '../data/courses'
import { loadProgress, initProgress } from '../utils/storage'
import { getQuestionImage } from '../utils/imageUrl'

export default function StoryScreen() {
  const { domain, topic, slug } = useParams()
  const navigate = useNavigate()
  const [hasRead, setHasRead] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const bottomRef = useRef(null)
  const storyRef = useRef(null)

  const course = courses.find(c => c.slug === slug)

  // Scroll gate — unlocks top button when bottom sentinel is visible
  useEffect(() => {
    if (!bottomRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setHasRead(true) },
      { threshold: 0.1 }
    )
    observer.observe(bottomRef.current)
    return () => observer.disconnect()
  }, [course])

  // Progress dots — fixed scroll math
  useEffect(() => {
    function handleScroll() {
      if (!storyRef.current) return                          // ← null guard fix
      const rect = storyRef.current.getBoundingClientRect()
      const elementHeight = storyRef.current.offsetHeight
      // progress: 0 when story top hits viewport bottom, 1 when story bottom hits viewport top
      const progress = Math.min(1, Math.max(0,
        (window.innerHeight - rect.top) / (elementHeight + window.innerHeight)
      ))
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()                                           // ← run once on mount
    return () => window.removeEventListener('scroll', handleScroll)
  }, [course])

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Course not found.</p>
      </div>
    )
  }

  function handleStart() {
    const existing = loadProgress(slug)
    if (!existing) initProgress(slug)
    navigate(`/${domain}/${topic}/${slug}/quiz/level-1`)
  }

  const paragraphs = course.story
    .split('\n\n')
    .map(p => p.trim())
    .filter(Boolean)

  const wordCount = paragraphs.join(' ').split(/\s+/).length
  const readMins = Math.max(1, Math.round(wordCount / 200))

  const totalDots = paragraphs.length
  const filledDots = Math.round(scrollProgress * totalDots)

  const heroUrl = getQuestionImage(slug, 'img-newtons-laws')

  return (
    <div className="min-h-screen bg-gray-950 px-3 py-6 max-w-2xl mx-auto">

      {/* Back button + top Start Quiz */}
      <div className="relative mb-2">
        <button
          onClick={() => navigate('/')}
          className="text-gray-500 text-sm flex items-center gap-1 
                     hover:text-white transition-colors"
        >
          ← Back
        </button>

        <button
          onClick={handleStart}
          disabled={!hasRead}
          className={`absolute top-0 right-0 text-sm font-semibold px-4 py-1 rounded-xl transition-all duration-200
            ${hasRead
              ? 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
        >
          Start Quiz →
        </button>
      </div>

      {/* Domain tag */}
      <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
        {course.domain.replace('-', ' ')} · {course.topic.replace(/-/g, ' ')}
      </span>

      {/* Title */}
      <h1 className="text-white font-bold text-2xl mt-2 leading-snug">
        {course.titleDisplay}
      </h1>

      {/* Tagline + read time */}
      <div className="flex items-center justify-between mt-1">
        <p className="text-gray-400 text-sm">{course.tagline}</p>
        <span className="text-gray-600 text-xs shrink-0 ml-4">{readMins} min read</span>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 my-6" />

      {/* Story nudge */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 mb-4">
        <p className="text-gray-300 text-sm leading-relaxed">
          Read this{' '}
          <span className="text-blue-400 font-semibold">{readMins} min story</span>
          {' '}to understand the secret sauce of{' '}
          <span className="text-white font-semibold">{course.titleDisplay}</span>
          . We promise, it is worth it. 🔥
        </p>
      </div>

      {/* Hero image */}
      <img
        src={heroUrl}
        alt={course.titleDisplay}
        loading="eager"
        className="w-full rounded-xl object-cover mb-6"
        style={{ aspectRatio: '16/9', maxHeight: '200px' }}
      />

      {/* Story + progress dots */}
      <div className="flex gap-3">

        {/* Progress dots */}
        <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
          {Array.from({ length: totalDots }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300
                ${i < filledDots ? 'bg-blue-500' : 'bg-gray-800'}`}
            />
          ))}
        </div>

        {/* Story paragraphs */}
        <div ref={storyRef} className="flex flex-col gap-5 flex-1">
          {paragraphs.map((para, i) => (
            <p key={i} className="text-gray-300 text-base leading-relaxed">
              {para}
            </p>
          ))}
        </div>

      </div>

      {/* Sentinel */}
      <div ref={bottomRef} className="h-1" />

      {/* Bottom Start Quiz button */}
      <div className="mt-12 pb-10">
        <button
          onClick={handleStart}
          className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95
                     text-white font-bold text-lg py-3 rounded-2xl
                     transition-all duration-200"
        >
          Start Quiz →
        </button>
      </div>

    </div>
  )
}