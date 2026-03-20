import { useNavigate } from 'react-router-dom'
import { courses } from '../data/courses'
import { getAllProgress, getResumeRoute } from '../utils/storage'

// ── Progress node states ──────────────────────────────────
function getNodeStates(p) {
    if (!p) return { story: 'locked', l1: 'locked', blitz: 'locked', l2: 'locked', l3: 'locked', boss: 'locked' }

    const blitzDone = (p.blitz || []).length >= 10
    const score = p.levelScores

    return {
        story: 'done',
        l1: score[1] !== null ? 'done' : 'current',
        blitz: score[1] !== null ? (blitzDone ? 'done' : 'current') : 'locked',
        l2: p.levelsUnlocked.includes(2)
            ? (score[2] !== null ? 'done' : 'current')
            : 'locked',
        l3: p.levelsUnlocked.includes(3)
            ? (score[3] !== null ? 'done' : 'current')
            : 'locked',
        boss: score[3] !== null
            ? (p.completedAt ? 'done' : 'current')
            : 'locked',
    }
}

// ── Single progress node ──────────────────────────────────
function Node({ label, state, score }) {
    const base = 'flex flex-col items-center gap-1'
    const dot = {
        done: 'w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold',
        current: 'w-8 h-8 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center animate-pulse',
        locked: 'w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center',
    }
    const icon = {
        done: '✓',
        current: '→',
        locked: '·',
    }
    const textColor = {
        done: 'text-blue-400',
        current: 'text-white',
        locked: 'text-gray-600',
    }

    return (
        <div className={base}>
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

// ── Connector line between nodes ─────────────────────────
function Connector({ active }) {
    return (
        <div className={`flex-1 h-0.5 mt-4 ${active ? 'bg-blue-500/40' : 'bg-gray-800'}`} />
    )
}

// ── Course card with progress map ────────────────────────
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

    // Sort: in-progress first, completed last
    started.sort((a, b) => {
        if (a.completedAt && !b.completedAt) return 1
        if (!a.completedAt && b.completedAt) return -1
        return (b.startedAt || 0) - (a.startedAt || 0)
    })

    return (
        <div className="min-h-screen text-white px-4 pt-6 pb-24 max-w-2xl mx-auto">

            <h1 className="text-2xl font-black mb-1">My Learning</h1>
            <p className="text-gray-500 text-sm mb-6">Pick up where you left off.</p>

            {started.length === 0 ? (
                <div className="text-center py-24">
                    <p className="text-4xl mb-4">📚</p>
                    <p className="text-white font-bold text-lg mb-2">Nothing here yet</p>
                    <p className="text-gray-500 text-sm mb-8">
                        Start any course and it will appear here.
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
        </div>
    )
}