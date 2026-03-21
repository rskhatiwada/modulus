import { useNavigate } from 'react-router-dom'
import { courses } from '../data/courses'
import { getAllProgress, getResumeRoute, getFavorites } from '../utils/storage'
import StatsOverview from '../components/StatsOverview'
import AchievementsSection from '../components/AchievementsSection'

// ── Progress node states ──────────────────────────────────
function getNodeStates(p) {
    if (!p) return { story: 'locked', l1: 'locked', blitz: 'locked', l2: 'locked', l3: 'locked', boss: 'locked' }

    const blitzDone = (p.blitz || []).length >= 10
    const score = p.levelScores

    return {
        story: 'done',
        l1: score[1] !== null ? 'done' : 'current',
        blitz: score[1] !== null ? (blitzDone ? 'done' : 'current') : 'locked',
        l2: p.levelsUnlocked.includes(2) ? (score[2] !== null ? 'done' : 'current') : 'locked',
        l3: p.levelsUnlocked.includes(3) ? (score[3] !== null ? 'done' : 'current') : 'locked',
        boss: score[3] !== null ? (p.completedAt ? 'done' : 'current') : 'locked',
    }
}

// ── Single progress node ──────────────────────────────────
function Node({ label, state, score }) {
    const dot = {
        done: 'w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold',
        current: 'w-8 h-8 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center animate-pulse',
        locked: 'w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center',
    }
    const icon = { done: '✓', current: '→', locked: '·' }
    const textColor = { done: 'text-blue-400', current: 'text-white', locked: 'text-gray-600' }

    return (
        <div className="flex flex-col items-center gap-1">
            <div className={dot[state]}>
                <span className={state === 'locked' ? 'text-gray-600 text-lg' : 'text-white text-xs'}>
                    {icon[state]}
                </span>
            </div>
            <span className={`text-[10px] font-medium ${textColor[state]}`}>{label}</span>
            {score !== null && score !== undefined && (
                <span className="text-[9px] text-gray-500">{Math.round(score * 100)}%</span>
            )}
        </div>
    )
}

// ── Connector line ────────────────────────────────────────
function Connector({ active }) {
    return (
        <div className={`flex-1 h-0.5 mt-4 ${active ? 'bg-blue-500/40' : 'bg-gray-800'}`} />
    )
}

// ── Favorite Courses ──────────────────────────────────────
function FavoriteCourses({ navigate }) {
    const { courses: favSlugs } = getFavorites()

    if (favSlugs.length === 0) return (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-center mb-6">
            <p className="text-gray-500 text-xs">
                No favorites yet — tap the bookmark icon on any course.
            </p>
        </div>
    )

    return (
        <div className="flex flex-col gap-3 mb-6">
            {favSlugs
                .sort((a, b) => b.savedAt - a.savedAt)
                .map(({ slug }) => {
                    const course = courses.find(c => c.slug === slug)
                    if (!course) return null
                    return (
                        <div
                            key={slug}
                            onClick={() => navigate(`/${course.domain}/${course.topic}/${course.slug}/story`)}
                            className="flex items-center gap-3 bg-gray-900 border border-gray-800
                         rounded-xl px-4 py-3 cursor-pointer hover:border-blue-500
                         transition-all duration-200 active:scale-95"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24"
                                fill="#3b82f6" stroke="#3b82f6" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </svg>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-semibold truncate">
                                    {course.titleDisplay}
                                </p>
                                <p className="text-gray-500 text-[10px] mt-0.5 uppercase tracking-wide">
                                    {course.domain.replace(/-/g, ' ')}
                                </p>
                            </div>
                            <span className="text-gray-600 text-xs shrink-0">→</span>
                        </div>
                    )
                })}
        </div>
    )
}

// ── Favorite Questions ────────────────────────────────────
function FavoriteQuestions({ navigate }) {
    const { questions: favQs } = getFavorites()

    if (favQs.length === 0) return (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-center mb-6">
            <p className="text-gray-500 text-xs">
                No bookmarked questions yet — tap the bookmark icon during any quiz.
            </p>
        </div>
    )

    return (
        <div className="flex flex-col gap-3 mb-6">
            {favQs
                .sort((a, b) => b.savedAt - a.savedAt)
                .map(({ courseSlug, questionId, questionText, courseTitle }) => {
                    const course = courses.find(c => c.slug === courseSlug)
                    if (!course) return null
                    return (
                        <div
                            key={`${courseSlug}-${questionId}`}
                            onClick={() => navigate(`/${course.domain}/${course.topic}/${courseSlug}/story`)}
                            className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3
                         cursor-pointer hover:border-blue-500
                         transition-all duration-200 active:scale-95"
                        >
                            <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">
                                {courseTitle}
                            </p>
                            <p className="text-white text-xs leading-relaxed line-clamp-2">
                                {questionText}
                            </p>
                        </div>
                    )
                })}
        </div>
    )
}

// ── Course card with progress map ─────────────────────────
function LearnCard({ progress, navigate }) {
    const course = courses.find(c => c.slug === progress.course)
    if (!course) return null

    const nodes = getNodeStates(progress)
    const resumeRoute = getResumeRoute(course.slug, course.domain, course.topic)
    const score = progress.levelScores
    const hasReport = (progress.questions || []).length > 0

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">

            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
                {course.domain.replace(/-/g, ' ')} · {course.topic.replace(/-/g, ' ')}
            </span>
            <h2 className="text-white font-bold text-base mt-1 leading-snug">
                {course.titleDisplay}
            </h2>

            {/* Progress map */}
            <div className="flex items-start mt-5 mb-5">
                <Node label="Story" state={nodes.story} />
                <Connector active={nodes.l1 !== 'locked'} />
                <Node label="L1" state={nodes.l1} score={score[1]} />
                <Connector active={nodes.blitz !== 'locked'} />
                <Node label="Blitz" state={nodes.blitz} />
                <Connector active={nodes.l2 !== 'locked'} />
                <Node label="L2" state={nodes.l2} score={score[2]} />
                <Connector active={nodes.l3 !== 'locked'} />
                <Node label="L3" state={nodes.l3} score={score[3]} />
                <Connector active={nodes.boss !== 'locked'} />
                <Node label="Boss" state={nodes.boss} />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={() => navigate(resumeRoute)}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 active:scale-95
                     text-white font-bold text-sm py-2.5 rounded-xl
                     transition-all duration-200"
                >
                    {progress.completedAt ? '🏆 Review' : '→ Resume'}
                </button>
                {hasReport && (
                    <button
                        onClick={() => navigate(`/${course.domain}/${course.topic}/${course.slug}/report`)}
                        className="px-4 bg-gray-800 hover:bg-gray-700 active:scale-95
                       text-gray-300 font-bold text-sm py-2.5 rounded-xl
                       border border-gray-700 transition-all duration-200"
                    >
                        Report
                    </button>
                )}
            </div>
        </div>
    )
}

// ── Main screen ───────────────────────────────────────────
export default function LearnScreen() {
    const navigate = useNavigate()
    const allProgress = getAllProgress()
    const started = allProgress.filter(p => p.course)

    started.sort((a, b) => {
        if (a.completedAt && !b.completedAt) return 1
        if (!a.completedAt && b.completedAt) return -1
        return (b.startedAt || 0) - (a.startedAt || 0)
    })

    return (
        <div className="min-h-screen text-white px-4 pt-6 pb-24 max-w-2xl mx-auto">

            <h1 className="text-2xl font-black mb-1">My Learning</h1>
            <p className="text-gray-500 text-sm mb-6">Pick up where you left off.</p>

            {/* Course progress cards */}
            {started.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-4xl mb-4">📚</p>
                    <p className="text-white font-bold text-lg mb-2">Nothing here yet</p>
                    <p className="text-gray-500 text-sm mb-8">
                        Start any course and it will appear here.
                    </p>
                    {/* Stats + Learning Pulse */}
                    <StatsOverview />

                    {/* Achievements */}
                    <div className="mb-8">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3">
                            Achievements
                        </p>
                        <AchievementsSection />
                    </div>

                    {/* Course progress cards */}
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3">
                        In Progress
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold
                       px-6 py-2.5 rounded-xl text-sm transition-all active:scale-95"
                    >
                        Browse Courses →
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {started.map(p => (
                        <LearnCard key={p.course} progress={p} navigate={navigate} />
                    ))}
                </div>
            )}

            {/* Favorite Courses */}
            <div className="mt-8">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3">
                    Favorite Courses
                </p>
                <FavoriteCourses navigate={navigate} />
            </div>

            {/* Bookmarked Questions */}
            <div className="mt-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3">
                    Bookmarked Questions
                </p>
                <FavoriteQuestions navigate={navigate} />
            </div>

        </div>
    )
}