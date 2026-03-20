import { useParams, useNavigate } from 'react-router-dom'
import { courses } from '../data/courses'
import { loadProgress } from '../utils/storage'

// ── Misconception tag → human readable ───────────────────
const MISCONCEPTION_LABELS = {
    'free-fall': { label: 'Free Fall', description: 'Heavier objects fall faster than lighter ones.' },
    'newton-first-law': { label: "Newton's First Law", description: 'Objects need a constant force to keep moving.' },
    'newton-third-law': { label: "Newton's Third Law", description: "Action and reaction forces cancel each other out." },
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

// ── Helpers ───────────────────────────────────────────────
function pct(n) { return Math.round((n || 0) * 100) }

function getCalibrationLabel(score) {
    if (score >= 0.75) return { label: 'Well Calibrated', color: 'text-green-400', bg: 'bg-green-950 border-green-800' }
    if (score >= 0.55) return { label: 'Slightly Overconfident', color: 'text-yellow-400', bg: 'bg-yellow-950 border-yellow-800' }
    return { label: 'Overconfident', color: 'text-red-400', bg: 'bg-red-950 border-red-800' }
}

function getQuadrantData(questions) {
    const FAST = 8000
    const buckets = { fastCorrect: 0, fastWrong: 0, slowCorrect: 0, slowWrong: 0 }
    questions.forEach(q => {
        const fast = q.timeMs < FAST
        if (fast && q.correct) buckets.fastCorrect++
        if (fast && !q.correct) buckets.fastWrong++
        if (!fast && q.correct) buckets.slowCorrect++
        if (!fast && !q.correct) buckets.slowWrong++
    })
    return buckets
}

// ── Sub-components ────────────────────────────────────────

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

function SectionHeader({ title, subtitle }) {
    return (
        <div className="mb-3">
            <p className="text-white font-bold text-sm">{title}</p>
            {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
        </div>
    )
}

function QuadrantGrid({ q }) {
    const total = q.fastCorrect + q.fastWrong + q.slowCorrect + q.slowWrong || 1
    const cells = [
        {
            label: 'Internalized',
            sub: 'Fast + Correct',
            count: q.fastCorrect,
            color: 'text-green-400',
            bg: 'bg-green-950/40 border-green-900',
            icon: '⚡'
        },
        {
            label: 'System 1 Trap',
            sub: 'Fast + Wrong',
            count: q.fastWrong,
            color: 'text-red-400',
            bg: 'bg-red-950/40 border-red-900',
            icon: '🪤'
        },
        {
            label: 'Effortful',
            sub: 'Slow + Correct',
            count: q.slowCorrect,
            color: 'text-yellow-400',
            bg: 'bg-yellow-950/40 border-yellow-900',
            icon: '🧠'
        },
        {
            label: 'Foundational Gap',
            sub: 'Slow + Wrong',
            count: q.slowWrong,
            color: 'text-orange-400',
            bg: 'bg-orange-950/40 border-orange-900',
            icon: '📚'
        },
    ]

    return (
        <div className="grid grid-cols-2 gap-2 mb-6">
            {cells.map(c => (
                <div key={c.label} className={`rounded-xl border p-3 ${c.bg}`}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-lg">{c.icon}</span>
                        <span className={`text-2xl font-black ${c.color}`}>{c.count}</span>
                    </div>
                    <p className={`text-xs font-bold ${c.color}`}>{c.label}</p>
                    <p className="text-gray-600 text-[10px] mt-0.5">{c.sub}</p>
                    <div className="mt-2 h-1 rounded-full bg-gray-800">
                        <div
                            className={`h-1 rounded-full ${c.color.replace('text-', 'bg-')}`}
                            style={{ width: `${Math.round((c.count / total) * 100)}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

function CalibrationCard({ score }) {
    const { label, color, bg } = getCalibrationLabel(score)
    return (
        <div className={`rounded-xl border p-4 mb-6 ${bg}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-xs mb-1">Calibration Score</p>
                    <p className={`text-3xl font-black ${color}`}>{pct(score)}%</p>
                    <p className={`text-sm font-bold mt-1 ${color}`}>{label}</p>
                </div>
                <div className="text-4xl">🎯</div>
            </div>
            <p className="text-gray-500 text-xs mt-3 leading-relaxed">
                How often your confidence matched your correctness.
                100% = perfectly calibrated. Below 55% = systematic overconfidence.
            </p>
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
        .map(([tag, { correct, total }]) => ({ tag, correct, total, pct: correct / total }))
        .sort((a, b) => a.pct - b.pct)
        .slice(0, 5)

    if (entries.length === 0) return null

    return (
        <div className="flex flex-col gap-2 mb-6">
            {entries.map(({ tag, correct, total, pct: p }) => (
                <div key={tag} className="flex items-center gap-3">
                    <p className="text-gray-400 text-xs w-36 shrink-0 truncate">
                        {tag.replace(/-/g, ' ')}
                    </p>
                    <div className="flex-1 h-1.5 rounded-full bg-gray-800">
                        <div
                            className={`h-1.5 rounded-full transition-all ${p >= 0.7 ? 'bg-blue-500' : p >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.round(p * 100)}%` }}
                        />
                    </div>
                    <p className="text-gray-500 text-xs w-12 text-right shrink-0">{correct}/{total}</p>
                </div>
            ))}
        </div>
    )
}

function CRTCard({ questions }) {
    const crtQs = questions.filter(q => q.type === 'crt')
    if (crtQs.length === 0) return null
    const correct = crtQs.filter(q => q.correct).length
    const total = crtQs.length
    const ratio = correct / total

    return (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 mb-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-xs mb-1">Cognitive Reflection (CRT)</p>
                    <p className="text-white text-2xl font-black">{correct} <span className="text-gray-600 text-base font-normal">/ {total}</span></p>
                    <p className={`text-xs font-bold mt-1 ${ratio >= 0.7 ? 'text-green-400' : ratio >= 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {ratio >= 0.7 ? 'Strong deliberate thinker' : ratio >= 0.4 ? 'Mixed — some System 1 slips' : 'High System 1 reliance'}
                    </p>
                </div>
                <div className="text-4xl">🪞</div>
            </div>
            <p className="text-gray-500 text-xs mt-3 leading-relaxed">
                CRT questions have a seductive wrong answer. Getting them right means
                you paused and reasoned — most people don't.
            </p>
        </div>
    )
}

function AnchorCard({ questions }) {
    const anchorQs = questions.filter(q => q.anchorSusceptible !== null && q.anchorSusceptible !== undefined)
    if (anchorQs.length === 0) return null
    const susceptible = anchorQs.filter(q => q.anchorSusceptible).length

    return (
        <div className={`rounded-xl border p-4 mb-6
      ${susceptible > 0 ? 'border-orange-900 bg-orange-950/30' : 'border-gray-800 bg-gray-900'}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-xs mb-1">Anchor Susceptibility</p>
                    <p className={`text-2xl font-black ${susceptible > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                        {susceptible} <span className="text-gray-600 text-base font-normal">/ {anchorQs.length}</span>
                    </p>
                    <p className={`text-xs font-bold mt-1 ${susceptible > 0 ? 'text-orange-300' : 'text-green-400'}`}>
                        {susceptible > 0 ? 'Anchoring affected your answers' : 'Resistant to anchoring'}
                    </p>
                </div>
                <div className="text-4xl">⚓</div>
            </div>
            <p className="text-gray-500 text-xs mt-3 leading-relaxed">
                Some questions included an irrelevant number in the framing.
                Anchoring bias pulls answers toward that number without you noticing.
            </p>
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
    const quadrant = getQuadrantData(questions || [])
    const answered = (questions || []).length

    return (
        <div className="min-h-screen bg-gray-950 text-white pb-24">

            {/* Header */}
            <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 px-4 h-14 flex items-center justify-between">
                <button onClick={() => navigate('/learn')}
                    className="text-gray-400 hover:text-white text-sm transition-colors">
                    ← My Learning
                </button>
                <span className="text-gray-400 text-xs">Report</span>
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

                {/* Cognitive quadrant */}
                <SectionHeader
                    title="Your Cognitive Profile"
                    subtitle="Every answer mapped by speed and correctness"
                />
                <QuadrantGrid q={quadrant} />

                {/* Calibration */}
                <SectionHeader
                    title="Confidence Calibration"
                    subtitle="Did your confidence match reality?"
                />
                <CalibrationCard score={profile.calibrationScore} />

                {/* CRT */}
                <SectionHeader
                    title="Deliberate Thinking Score"
                    subtitle="Questions designed to trap System 1 thinking"
                />
                <CRTCard questions={questions || []} />

                {/* Misconceptions */}
                <SectionHeader
                    title="Misconceptions Detected"
                    subtitle="Wrong mental models flagged during your quiz"
                />
                <MisconceptionsList tags={profile.misconceptionsDetected} />

                {/* Concept mastery */}
                <SectionHeader
                    title="Concept Mastery"
                    subtitle="Your weakest concepts — sorted by accuracy"
                />
                <ConceptMastery mastery={profile.conceptMastery} />

                {/* Anchor */}
                <SectionHeader
                    title="Anchoring Bias"
                    subtitle="Did irrelevant numbers in questions pull your answers?"
                />
                <AnchorCard questions={questions || []} />

                {/* Resume CTA */}
                <button
                    onClick={() => navigate(`/${domain}/${topic}/${slug}/story`)}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-500 active:scale-95
                     text-white font-bold py-3 rounded-xl text-sm
                     transition-all duration-200"
                >
                    Retake Course →
                </button>

            </div>
        </div>
    )
}