import { useParams, useNavigate } from 'react-router-dom'
import { courses } from '../data/courses'
import { loadProgress } from '../utils/storage'

// ── Misconception tag → human readable ───────────────────
const MISCONCEPTION_LABELS = {
    'free-fall': { label: 'Free Fall', description: 'Heavier objects fall faster than lighter ones.' },
    'newton-first-law': { label: "Newton's First Law", description: 'Objects need a constant force to keep moving.' },
    'newton-third-law': { label: "Newton's Third Law", description: 'Action and reaction forces cancel each other out.' },
    'centripetal-force': { label: 'Centripetal Force', description: 'Objects fly outward because of centrifugal force.' },
    'work-energy': { label: 'Work & Energy', description: 'A force always does work if an object is moving.' },
    'heat-temperature': { label: 'Heat vs Temperature', description: 'Heat and temperature are the same thing.' },
    'entropy': { label: 'Entropy', description: 'Entropy means disorder always increases everywhere.' },
    'electric-current': { label: 'Electric Current', description: 'Current is consumed as it flows through a circuit.' },
    'voltage-current': { label: 'Voltage vs Current', description: 'More voltage always means more current.' },
    'quantum-uncertainty': { label: 'Quantum Uncertainty', description: 'Uncertainty is just due to imprecise instruments.' },
    'wave-particle': { label: 'Wave-Particle Duality', description: 'Particles and waves are fundamentally different things.' },
    'evolution-direction': { label: 'Evolution Direction', description: 'Evolution has a goal or direction toward complexity.' },
    'natural-selection': { label: 'Natural Selection', description: 'Organisms develop traits because they need them.' },
    'dna-mutation': { label: 'DNA Mutation', description: 'Mutations are always harmful.' },
    'brain-usage': { label: 'Brain Usage', description: 'Humans only use 10% of their brain.' },
    'osmosis': { label: 'Osmosis', description: 'Water always moves toward higher solute concentration.' },
    'atom-structure': { label: 'Atomic Structure', description: 'Electrons orbit the nucleus like planets orbit the sun.' },
    'chemical-bonding': { label: 'Chemical Bonding', description: 'Atoms bond to complete their outer shell by sharing.' },
    'acid-ph': { label: 'Acid & pH', description: 'Acids are always dangerous and burn on contact.' },
    'relativity-time': { label: 'Relativity & Time', description: 'Time dilation only matters at the speed of light.' },
    'gravity-vacuum': { label: 'Gravity in Vacuum', description: 'There is no gravity in space.' },
    'momentum': { label: 'Momentum', description: 'A heavier object always has more momentum.' },
}

function getMisconceptionInfo(tag) {
    return MISCONCEPTION_LABELS[tag] || {
        label: tag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: 'A common incorrect mental model flagged during your quiz.'
    }
}

function pct(n) { return Math.round((n || 0) * 100) }

// ── Sub-components ────────────────────────────────────────

function SectionHeader({ title, subtitle }) {
    return (
        <div className="mb-3">
            <p className="text-white font-bold text-sm">{title}</p>
            {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
        </div>
    )
}

function ScoreRow({ scores }) {
    return (
        <div className="flex gap-3 mb-6">
            {[1, 2, 3].map(lvl => {
                const s = scores[lvl]
                const done = s !== null && s !== undefined
                return (
                    <div key={lvl}
                        className={`flex-1 rounded-xl p-3 text-center border
              ${done
                                ? s >= 0.7 ? 'bg-blue-950 border-blue-800' : 'bg-red-950 border-red-800'
                                : 'bg-gray-900 border-gray-800'}`}>
                        <p className={`text-xl font-black ${done ? (s >= 0.7 ? 'text-blue-400' : 'text-red-400') : 'text-gray-600'}`}>
                            {done ? `${pct(s)}%` : '—'}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">Level {lvl}</p>
                    </div>
                )
            })}
        </div>
    )
}

function MisconceptionsList({ tags }) {
    if (!tags || tags.length === 0) return (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 mb-6 text-center">
            <p className="text-green-400 font-bold text-sm">✓ No misconceptions detected</p>
            <p className="text-gray-500 text-xs mt-1">Clean run — your mental models are solid.</p>
        </div>
    )
    return (
        <div className="flex flex-col gap-2 mb-6">
            {tags.map(tag => {
                const { label, description } = getMisconceptionInfo(tag)
                return (
                    <div key={tag} className="rounded-xl border border-red-900 bg-red-950/30 p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-red-400 text-xs">⚠</span>
                            <p className="text-red-300 text-xs font-bold uppercase tracking-wide">{label}</p>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Common belief: <span className="text-gray-300 italic">"{description}"</span>
                        </p>
                    </div>
                )
            })}
        </div>
    )
}

function ConceptMastery({ mastery }) {
    const entries = Object.entries(mastery || {})
        .map(([tag, { correct, total }]) => ({ tag, correct, total, p: correct / total }))
        .sort((a, b) => a.p - b.p)
        .slice(0, 5)

    if (entries.length === 0) return null

    return (
        <div className="flex flex-col gap-2 mb-6">
            {entries.map(({ tag, correct, total, p }) => (
                <div key={tag} className="flex items-center gap-3">
                    <p className="text-gray-400 text-xs w-36 shrink-0 truncate capitalize">
                        {tag.replace(/-/g, ' ')}
                    </p>
                    <div className="flex-1 h-1.5 rounded-full bg-gray-800">
                        <div
                            className={`h-1.5 rounded-full transition-all
                ${p >= 0.7 ? 'bg-blue-500' : p >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.round(p * 100)}%` }}
                        />
                    </div>
                    <p className="text-gray-500 text-xs w-12 text-right shrink-0">{correct}/{total}</p>
                </div>
            ))}
        </div>
    )
}

// ── Main Screen ───────────────────────────────────────────
export default function CourseReportScreen() {
    const { domain, topic, slug } = useParams()
    const navigate = useNavigate()

    const course = courses.find(c => c.slug === slug)
    const progress = loadProgress(slug)

    if (!course || !progress) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="text-center">
                <p className="text-gray-400 mb-4">No report data found.</p>
                <button onClick={() => navigate('/learn')}
                    className="text-blue-400 text-sm hover:text-blue-300">
                    ← My Learning
                </button>
            </div>
        </div>
    )

    const { profile, questions, levelScores } = progress
    const answered = (questions || []).length

    return (
        <div className="min-h-screen bg-gray-950 text-white pb-24">

            {/* Header */}
            <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm
                      border-b border-gray-800 px-4 h-14
                      flex items-center justify-between">
                <button onClick={() => navigate('/learn')}
                    className="text-gray-400 hover:text-white text-sm transition-colors">
                    ← My Learning
                </button>
                <span className="text-gray-400 text-xs">Course Report</span>
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-6">

                {/* Course title */}
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
                    {course.domain.replace(/-/g, ' ')} · {course.topic.replace(/-/g, ' ')}
                </span>
                <h1 className="text-white font-black text-xl mt-1 mb-1 leading-snug">
                    {course.titleDisplay}
                </h1>
                <p className="text-gray-500 text-xs mb-6">
                    {answered} questions answered across all levels
                </p>

                {/* Level scores */}
                <SectionHeader title="Level Scores" />
                <ScoreRow scores={levelScores} />

                {/* Misconceptions */}
                <SectionHeader
                    title="Misconceptions Detected"
                    subtitle="Wrong mental models flagged during this course"
                />
                <MisconceptionsList tags={profile.misconceptionsDetected} />

                {/* Concept mastery */}
                <SectionHeader
                    title="Concept Mastery"
                    subtitle="Your accuracy per concept — weakest first"
                />
                <ConceptMastery mastery={profile.conceptMastery} />

                {/* Nudge to Profile */}
                <div className="rounded-xl border border-blue-900 bg-blue-950/30 p-4 mb-6">
                    <p className="text-blue-300 text-sm font-bold mb-1">
                        🧠 Deeper diagnostics in your Profile
                    </p>
                    <p className="text-gray-400 text-xs leading-relaxed">
                        Overconfidence index, System 1 vulnerability, calibration score,
                        and anchor susceptibility are computed across all your courses
                        for statistical reliability. Complete more courses to unlock them.
                    </p>
                    <button
                        onClick={() => navigate('/profile')}
                        className="mt-3 text-blue-400 text-xs font-semibold
                       hover:text-blue-300 transition-colors"
                    >
                        View Profile →
                    </button>
                </div>

                {/* Retake */}
                <button
                    onClick={() => navigate(`/${domain}/${topic}/${slug}/story`)}
                    className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95
                     text-white font-bold py-3 rounded-xl text-sm
                     transition-all duration-200"
                >
                    Retake Course →
                </button>

            </div>
        </div>
    )
}