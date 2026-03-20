import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { courses } from '../data/courses'
import { loadProgress } from '../utils/storage'
import {
  searchCourses,
  getMatchedTags,
  didYouMean,
  getSearchHistory,
  saveSearchHistory,
  clearSearchHistory,
} from '../utils/search'

// ── Constants ────────────────────────────────────────────────────────────────

const HINTS = [
  "Try: 'quantum tunneling'",
  "Try: 'why do things float?'",
  "Try: 'heavier things fall faster'",
  "Try: 'f=ma'",
  "Try: 'how DNA works'",
  "Try: 'Bayes theorem'",
  "Try: 'dark matter'",
  "Try: 'what is entropy'",
]

const DOMAINS = [
  { key: null, label: 'All', emoji: '✦' },
  { key: 'physics', label: 'Physics' },
  { key: 'mathematics', label: 'Maths' },
  { key: 'biology', label: 'Biology' },
  { key: 'chemistry', label: 'Chemistry' },
  { key: 'computer-science', label: 'CS' },
  { key: 'neuroscience', label: 'Neuro' },
  { key: 'earth-and-space', label: 'Space' },
  { key: 'engineering', label: 'Eng' },
]

const STATS = [
  { value: '139', label: 'Courses' },
  { value: '8', label: 'Domains' },
  { value: '15', label: 'Mins' },
]

// ── Main Component ────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [hintIndex, setHintIndex] = useState(0)
  const [results, setResults] = useState(null)
  const [cleanedQuery, setCleanedQuery] = useState('')
  const [suggestion, setSuggestion] = useState(null)
  const [activeDomain, setActiveDomain] = useState(null)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [authModal, setAuthModal] = useState(false)
  const [visibleCount, setVisibleCount] = useState(8)
  const inputRef = useRef(null)
  const searchSectionRef = useRef(null)

  // Nav scroll detection
  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 40) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])



  // Load search history on mount
  useEffect(() => {
    setHistory(getSearchHistory())
  }, [])

  // Cycle placeholder hints
  useEffect(() => {
    if (query) return
    const interval = setInterval(() => {
      setHintIndex(i => (i + 1) % HINTS.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [query])

  // Run search on every keystroke
  useEffect(() => {
    if (!query.trim()) {
      setResults(null)
      setCleanedQuery('')
      setSuggestion(null)
      return
    }
    const { tier1, tier2, cleanedQuery: cq } = searchCourses(query, activeDomain)
    setResults({ tier1, tier2 })
    setCleanedQuery(cq)
    if (!tier1.length && !tier2.length) {
      setSuggestion(didYouMean(query))
    } else {
      setSuggestion(null)
    }
  }, [query, activeDomain])

  useEffect(() => {
    if (!query.trim()) return
    const { tier1, tier2, cleanedQuery: cq } = searchCourses(query, activeDomain)
    setResults({ tier1, tier2 })
    setCleanedQuery(cq)
  }, [activeDomain])

  useEffect(() => {
    setVisibleCount(8)
  }, [activeDomain])

  const isSearching = !!query.trim()
  const hasResults = results && (results.tier1.length > 0 || results.tier2.length > 0)
  const totalResults = (results?.tier1?.length || 0) + (results?.tier2?.length || 0)
  const allFilteredCourses = activeDomain
    ? courses.filter(c => c.domain === activeDomain)
    : courses
  const filteredCourses = allFilteredCourses.slice(0, visibleCount)
  const hasMore = visibleCount < allFilteredCourses.length

  function handleQueryChange(val) {
    setQuery(val)
    setShowHistory(false)
  }

  function handleSearchFocus() {
    if (!query.trim()) setShowHistory(true)
  }

  function handleSearchBlur() {
    setTimeout(() => setShowHistory(false), 150)
  }

  function handleHistoryClick(item) {
    setQuery(item)
    setShowHistory(false)
    inputRef.current?.focus()
  }

  function handleSearchSubmit() {
    if (!query.trim()) return
    saveSearchHistory(query)
    setHistory(getSearchHistory())
    setShowHistory(false)
  }

  function handleClearHistory() {
    clearSearchHistory()
    setHistory([])
  }

  function scrollToSearch() {
    searchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => inputRef.current?.focus(), 500)
  }

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#030712' }}>

      {/* ── Sticky Nav ──────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${scrolled
            ? 'bg-gray-950/90 backdrop-blur-md border-b border-gray-800/60'
            : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 h-14 flex items-center justify-between">

          {/* Logo */}
          <button
            onClick={() => { setQuery(''); setActiveDomain(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="text-lg font-bold tracking-tight"
          >
            Scientific<span className="text-blue-500">FREAK</span>
          </button>

          {/* Nav right */}
          <div className="flex items-center gap-2">
            {/* Nav search icon — scrolls to search bar */}
            <button
              onClick={scrollToSearch}
              className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg
             text-gray-400 hover:text-white hover:bg-gray-800
             transition-all duration-200"
              aria-label="Search"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            {/* Sign In */}
            <button
              onClick={() => setAuthModal(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg
                         border border-gray-700 text-gray-300
                         hover:border-blue-500 hover:text-white
                         transition-all duration-200"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero — full width, no max-w constraint ── */}
      <section className="relative pt-16 md:pt-8 pb-8 px-6 sm:px-12 lg:px-24 overflow-hidden max-w-8xl mx-auto">



        {/* Inner content — max-w on desktop so text doesn't stretch too wide */}
        <div className="max-w-3xl">

          {/* Domain pill */}
          <div className="inline-flex items-center gap-1.5 bg-blue-950/60 border border-blue-900/60
                text-blue-400 text-xs font-semibold px-3 py-1 rounded-full mt-0 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            STEM · AI-Powered · Futuristic
          </div>

          {/* Headline — larger on wide screens */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-3 whitespace-nowrap">
            Be an expert <span className="text-blue-500">in 15 mins.</span>
          </h1>

          {/* Subline */}
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-7 max-w-lg">
            Turning complex ideas to everyday knowledge.
          </p>

          {/* CTA */}
          <div className="flex items-center gap-3 mb-10">
            <button
              onClick={scrollToSearch}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95
                   text-white font-bold text-sm px-5 py-2.5 rounded-xl
                   transition-all duration-200"
            >
              Start Learning →
            </button>
            <button
              onClick={() => setAuthModal(true)}
              className="text-gray-400 hover:text-white text-sm font-medium
                   transition-colors duration-200"
            >
              Sign up free
            </button>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6">
            {STATS.map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-2xl font-black text-white leading-none">
                  {stat.value}

                </span>
                <span className="text-gray-600 text-xs mt-0.5">{stat.label}</span>
              </div>
            ))}
            <div className="h-8 w-px bg-gray-800 mx-1" />
            <p className="text-gray-600 text-xs leading-relaxed">
              Built for the Curious<br /><span>© QKSM Algorithm</span>
            </p>
          </div>

        </div>
      </section>

      <div className="border-t border-gray-800/40 max-w-3xl mx-auto" />


      {/* ── Search + Course List ─────────────────────────────────────────── */}
      <section
        ref={searchSectionRef}
        className="max-w-3xl mx-auto px-3 pt-4 pb-20"
        style={{ backgroundColor: '#030712' }}
      >

        {/* Section label */}
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-4">
          All Courses
        </p>

        {/* Search field */}
        <div className="relative mb-3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base pointer-events-none">
            🔍
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onKeyDown={e => { if (e.key === 'Enter') handleSearchSubmit() }}
            placeholder={HINTS[hintIndex]}
            className={`w-full bg-gray-900 border border-gray-800 rounded-xl
               pl-9 py-3 text-white text-sm
               placeholder-gray-600 focus:outline-none focus:border-blue-500
               transition-colors duration-200
               ${query ? 'pr-24' : 'pr-4'}`}
          />

          {query && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={() => { setQuery(''); setSuggestion(null); setResults(null) }}
                className="text-gray-500 hover:text-white text-lg transition-colors px-1"
              >
                ×
              </button>
              <button
                onClick={handleSearchSubmit}
                className="bg-blue-600 hover:bg-blue-500 active:scale-95
                   text-white text-xs font-semibold px-3 py-1.5 rounded-lg
                   transition-all duration-200"
              >
                Search
              </button>
            </div>
          )}

          {/* Search history dropdown */}
          {showHistory && history.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900
                    border border-gray-800 rounded-xl overflow-hidden z-10 shadow-xl">
              <div className="flex items-center justify-between px-3 pt-2 pb-1">
                <span className="text-gray-600 text-xs uppercase tracking-widest">Recent</span>
                <button
                  onClick={handleClearHistory}
                  className="text-gray-600 hover:text-gray-400 text-xs transition-colors"
                >
                  Clear
                </button>
              </div>
              {history.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleHistoryClick(item)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-400
                     hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-2"
                >
                  <span className="text-gray-600 text-xs">↺</span>
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search hint */}
        {!isSearching && (
          <p className="text-gray-600 text-xs mb-4">
            Search by question, concept or misconception...
          </p>
        )}

        {/* Domain filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {DOMAINS.map(domain => (
            <button
              key={domain.key ?? 'all'}
              onClick={() => setActiveDomain(domain.key)}
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full
                          transition-all duration-200 flex items-center gap-1.5
                          ${activeDomain === domain.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-900 border border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'
                }`}
            >
              <span>{domain.emoji}</span>
              {domain.label}
            </button>
          ))}
        </div>

        {/* Search result count */}
        {isSearching && (
          <p className="text-gray-500 text-xs mb-4">
            {hasResults
              ? `${totalResults} result${totalResults !== 1 ? 's' : ''} for "${query}"${activeDomain ? ` in ${activeDomain.replace('-', ' ')}` : ''}`
              : `No results for "${query}"`}
          </p>
        )}

        {/* Did you mean */}
        {isSearching && !hasResults && suggestion && (
          <div className="mb-5">
            <p className="text-gray-500 text-sm">
              Did you mean{' '}
              <button
                onClick={() => { setQuery(suggestion); setShowHistory(false) }}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                {suggestion}
              </button>
              ?
            </p>
          </div>
        )}

        {/* No results */}
        {isSearching && !hasResults && (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">🔭</p>
            <p className="text-white font-semibold mb-1">Nothing found</p>
            <p className="text-gray-500 text-sm">
              Try a concept, a question, or a common misconception
            </p>
          </div>
        )}

        {/* Search results */}
        {isSearching && hasResults && (
          <div className="flex flex-col gap-6">
            {results.tier1.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-3">
                  Best match
                </p>
                <div className="flex flex-col gap-4">
                  {results.tier1.map(course => (
                    <CourseCard
                      key={course.slug}
                      course={course}
                      navigate={navigate}
                      highlightedTags={getMatchedTags(course, cleanedQuery)}
                    />
                  ))}
                </div>
              </div>
            )}
            {results.tier2.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                  Related
                </p>
                <div className="flex flex-col gap-4">
                  {results.tier2.map(course => (
                    <CourseCard
                      key={course.slug}
                      course={course}
                      navigate={navigate}
                      highlightedTags={getMatchedTags(course, cleanedQuery)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full course list */}
        {!isSearching && (
          <>
            <div className="flex flex-col gap-4">
              {filteredCourses.map(course => (
                <CourseCard key={course.slug} course={course} navigate={navigate} />
              ))}
            </div>
            {hasMore && (
              <button
                onClick={() => setVisibleCount(v => v + 8)}
                className="w-full mt-6 py-3 rounded-xl border border-gray-800
                           text-gray-400 hover:border-blue-500 hover:text-white
                           text-sm font-semibold transition-all duration-200"
              >
                Load More ({allFilteredCourses.length - visibleCount} remaining)
              </button>
            )}
          </>
        )}

      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-800/60 py-8">
        <div className="max-w-8xl mx-auto px-6 sm:px-12 lg:px-24 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">
              Scientific<span className="text-blue-500">FREAK</span>
            </p>
            <p className="text-gray-600 text-xs mt-0.5">Be an expert in 15 mins.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAuthModal(true)}
              className="text-gray-600 hover:text-white text-xs transition-colors"
            >
              Sign Up
            </button>
            <a href="mailto:content@scientificfreak.com" className="text-gray-600 hover:text-white text-xs transition-colors">Contact</a>
            <span className="text-gray-700 text-xs">© 2026</span>
          </div>
        </div>
      </footer>

      {/* ── Auth Modal ───────────────────────────────────────────────────── */}
      {authModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50
                     flex items-center justify-center px-4"
          onClick={() => setAuthModal(false)}
        >
          <div
            className="bg-gray-900 border border-gray-800 rounded-2xl p-7
                       max-w-sm w-full text-center"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-2xl mb-3">🔐</p>
            <h2 className="text-white font-bold text-lg mb-2">Accounts Coming Soon</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              We're building authentication now. Your progress is already saved
              locally on this device — nothing is lost.
            </p>
            <button
              onClick={() => setAuthModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95
                         text-white font-bold py-2.5 rounded-xl
                         transition-all duration-200 text-sm"
            >
              Got it, continue learning
            </button>
            <p className="text-gray-600 text-xs mt-3">
              No account needed to start any course.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}

// ── Course Card ───────────────────────────────────────────────────────────────

function CourseCard({ course, navigate, highlightedTags = [] }) {
  const progress = loadProgress(course.slug)
  const badge = progress?.badgeEarned
  const started = !!progress
  const completed = progress?.completedAt
  const highlightSet = new Set(highlightedTags)

  return (
    <div
      onClick={() => navigate(`/${course.domain}/${course.topic}/${course.slug}/story`)}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-5
                 cursor-pointer hover:border-blue-500
                 transition-all duration-200 active:scale-95"
    >
      {/* Domain tag */}
      <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
        {course.domain.replace(/-/g, ' ')} · {course.topic.replace(/-/g, ' ')}
      </span>

      {/* Title */}
      <h2 className="text-white font-bold text-lg mt-1 leading-snug">
        {course.titleDisplay}
      </h2>

      {/* Tagline */}
      <p className="text-gray-400 text-sm mt-1">{course.tagline}</p>

      {/* Concept tags */}
      {course.tags?.concept?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {course.tags.concept.slice(0, 4).map(tag => (
            <span
              key={tag}
              className={`text-xs px-2 py-0.5 rounded-full transition-colors
                ${highlightSet.has(tag)
                  ? 'text-blue-300 bg-blue-950 border border-blue-800'
                  : 'text-gray-500 bg-gray-800'
                }`}
            >
              {tag.replace(/-/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Status row */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          {badge && <span className="text-yellow-400 text-lg">🏆</span>}
          {completed && !badge && <span className="text-gray-500 text-xs">Completed</span>}
          {started && !completed && <span className="text-blue-400 text-xs">In progress</span>}
          {!started && <span className="text-gray-600 text-xs">Not started</span>}
        </div>

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
}
