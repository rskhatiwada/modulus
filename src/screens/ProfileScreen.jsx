import { useNavigate } from 'react-router-dom'
import { getAggregateProfile, getAllProgress, loadProgress } from '../utils/storage'
import { courses } from '../data/courses'

// ── Constants ─────────────────────────────────────────────
const MIN_COURSES = 2

const DOMAINS = [
    { key: 'physics', label: 'Physics', emoji: '⚛️' },
    { key: 'mathematics', label: 'Maths', emoji: '∑' },
    { key: 'biology', label: 'Biology', emoji: '🧬' },
    { key: 'chemistry', label: 'Chemistry', emoji: '⚗️' },
    { key: 'computer-science', label: 'CS', emoji: '💻' },
    { key: 'neuroscience', label: 'Neuro', emoji: '🧠' },
    { key: 'earth-and-space', label: 'Space', emoji: '🌌' },
    { key: 'engineering', label: 'Eng', emoji: '⚙️' },
]

// ── Helpers ───────────────────────────────────────────────
function pct(n) { return Math.round((n || 0) * 100) }

function getMemberSince() {
    const all = getAllProgress()
    if (!all.length) return null
    const earliest = Math.min(...all.map(p => p.startedAt || Date.now()))
    return new Date(earliest).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

// ── Sub-components ────────────────────────────────────────

function SectionHeader({ title, subtitle }) {
    return (
        <div className="mb-3 mt-6">
            <p className="text-white font-bold text-sm">{title}</p>
            {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
        </div>
    )
}

function GateBlock({ needed }) {
    return (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 mb-4">
            <div className="h-1.5 rounded-full bg-gray-800 mb-2">
                <div className="h-1.5 rounded-full bg-gray-700 w-1/4" />
            </div>
            <p className="text-gray-600 text-xs">
                Complete {needed} more course{needed !== 1 ? 's' : ''} to unlock this insight
            </p>
        </div>
    )
}

function IdentityHeader({ agg, memberSince }) {
    return (
        <div className="flex items-center gap-4 mb-6 p-4
                    bg-gray-900 border border-gray-800 rounded-2xl">
            {/* Avatar placeholder */}
            <div className="w-14 h-14 rounded-full bg-blue-950 border-2 border-blue-800
                      flex items-center justify-center shrink-0">
                <span className="text-blue-400 text-2xl">👤</span>
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-base">Guest Learner</p>
                <p className="text-gray-500 text-xs mt-0.5">
                    {memberSince ? `Learning since ${memberSince}` : 'Just getting started'}
                </p>
                <div className="flex gap-3 mt-2">
                    <span className="text-xs text-gray-400">
                        <span className="text-white font-bold">{agg.totalCourses || 0}</span> courses
                    </span>
                    <span className="text-xs text-gray-400">
                        <span className="text-white font-bold">{agg.totalQuestions || 0}</span> questions
                    </span>
                </div>
            </div>

            {/* Auth nudge */}
            <div className="shrink-0">
                <div className="text-xs text-gray-600 text-right leading-relaxed">
                    Sign in to<br />sync progress
                </div>
            </div>
        </div>
    )
}

function DomainCoverageMap({ allProgress }) {
    const touchedDomains = new Set(
        allProgress.map(p => {
            const course = courses.find(c => c.slug === p.course)
            return course?.domain
        }).filter(Boolean)
    )

    const completedDomains = new Set(
        allProgress.filter(p => p.completedAt).map(p => {
            const course = courses.find(c => c.slug === p.course)
            return course?.domain
        }).filter(Boolean)
    )

    return (
        <div className="grid grid-cols-4 gap-2 mb-4">
            {DOMAINS.map(({ key, label, emoji }) => {
                const completed = completedDomains.has(key)
                const touched = touchedDomains.has(key)
                return (
                    <div key={key}
                        className={`rounded-xl border p-3 text-center transition-all
              ${completed
                                ? 'bg-blue-950 border-blue-800'
                                : touched
                                    ? 'bg-gray-800 border-gray-700'
                                    : 'bg-gray-900 border-gray-800'
                            }`}>
                        <div className="text-xl mb-1">{emoji}</div>
                        <p className={`text-[10px] font-semibold
              ${completed ? 'text-blue-300' : touched ? 'text-gray-300' : 'text-gray-600'}`}>
                            {label}
                        </p>
                        {completed && (
                            <p className="text-[9px] text-blue-400 mt-0.5">✓ done</p>
                        )}
                        {touched && !completed && (
                            <p className="text-[9px] text-gray-500 mt-0.5">in progress</p>
                        )}
                        {!touched && (
                            <p className="text-[9px] text-gray-700 mt-0.5">not started</p>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

function WeakAreas({ mastery }) {
    const entries = Object.entries(mastery || {})
        .map(([tag, { correct, total }]) => ({ tag, correct, total, p: correct / total }))
        .filter(e => e.total >= 2)      // need at least 2 attempts to be meaningful
        .sort((a, b) => a.p - b.p)
        .slice(0, 3)

    if (entries.length === 0) return (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 mb-4 text-center">
            <p className="text-gray-500 text-xs">Not enough data yet — complete more questions.</p>
        </div>
    )

    return (
        <div className="flex flex-col gap-2 mb-4">
            {entries.map(({ tag, correct, total, p }, i) => (
                <div key={tag}
                    className="flex items-center gap-3 bg-gray-900 border border-gray-800
                     rounded-xl px-4 py-3">
                    <span className={`text-xs font-black w-5 shrink-0
            ${i === 0 ? 'text-red-400' : i === 1 ? 'text-orange-400' : 'text-yellow-400'}`}>
                        #{i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold capitalize truncate">
                            {tag.replace(/-/g, ' ')}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1 rounded-full bg-gray-800">
                                <div
                                    className="h-1 rounded-full bg-red-500"
                                    style={{ width: `${Math.round(p * 100)}%` }}
                                />
                            </div>
                            <span className="text-gray-500 text-[10px] shrink-0">
                                {correct}/{total} correct
                            </span>
                        </div>
                    </div>
                    <span className={`text-sm font-black shrink-0
            ${p < 0.4 ? 'text-red-400' : 'text-yellow-400'}`}>
                        {Math.round(p * 100)}%
                    </span>
                </div>
            ))}
        </div>
    )
}

function QuadrantGrid({ q }) {
    const total = q.fastCorrect + q.fastWrong + q.slowCorrect + q.slowWrong || 1
    const cells = [
        { label: 'Internalized', sub: 'Fast + Correct', count: q.fastCorrect, color: 'text-green-400', bar: 'bg-green-500', icon: '⚡', bg: 'bg-green-950/40 border-green-900' },
        { label: 'System 1 Trap', sub: 'Fast + Wrong', count: q.fastWrong, color: 'text-red-400', bar: 'bg-red-500', icon: '🪤', bg: 'bg-red-950/40 border-red-900' },
        { label: 'Effortful', sub: 'Slow + Correct', count: q.slowCorrect, color: 'text-yellow-400', bar: 'bg-yellow-500', icon: '🧠', bg: 'bg-yellow-950/40 border-yellow-900' },
        { label: 'Foundational Gap', sub: 'Slow + Wrong', count: q.slowWrong, color: 'text-orange-400', bar: 'bg-orange-500', icon: '📚', bg: 'bg-orange-950/40 border-orange-900' },
    ]
    return (
        <div className="grid grid-cols-2 gap-2 mb-4">
            {cells.map(c => (
                <div key={c.label} className={`rounded-xl border p-3 ${c.bg}`}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-lg">{c.icon}</span>
                        <span className={`text-2xl font-black ${c.color}`}>{c.count}</span>
                    </div>
                    <p className={`text-xs font-bold ${c.color}`}>{c.label}</p>
                    <p className="text-gray-600 text-[10px] mt-0.5">{c.sub}</p>
                    <div className="mt-2 h-1 rounded-full bg-gray-800">
                        <div className={`h-1 rounded-full ${c.bar}`}
                            style={{ width: `${Math.round((c.count / total) * 100)}%` }} />
                    </div>
                </div>
            ))}
        </div>
    )
}

function StatCard({ label, value, sub, colorClass, borderClass, icon, description }) {
    return (
        <div className={`rounded-xl border p-4 mb-4 ${borderClass} ${colorClass}`}>
            <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">{label}</p>
                <span className="text-2xl">{icon}</span>
            </div>
            <p className="text-white text-3xl font-black">{value}</p>
            <p className="text-sm font-bold mt-1 text-gray-300">{sub}</p>
            {description && (
                <p className="text-gray-500 text-xs mt-2 leading-relaxed">{description}</p>
            )}
        </div>
    )
}

function MisconceptionsList({ tags }) {
    const LABELS = {
        'free-fall': { label: 'Free Fall', description: 'Heavier objects fall faster.' },
        'newton-first-law': { label: "Newton's First Law", description: 'Objects need force to keep moving.' },
        'newton-third-law': { label: "Newton's Third Law", description: 'Action-reaction forces cancel out.' },
        'heat-temperature': { label: 'Heat vs Temperature', description: 'Heat and temperature are the same.' },
        'electric-current': { label: 'Electric Current', description: 'Current is consumed in a circuit.' },
        'evolution-direction': { label: 'Evolution Direction', description: 'Evolution aims toward complexity.' },
        'atom-structure': { label: 'Atomic Structure', description: 'Electrons orbit like planets.' },
        'gravity-vacuum': { label: 'Gravity in Space', description: 'There is no gravity in space.' },
    }
    if (!tags || tags.length === 0) return (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 mb-4 text-center">
            <p className="text-green-400 font-bold text-sm">✓ No misconceptions detected</p>
            <p className="text-gray-500 text-xs mt-1">Your mental models are solid across all courses.</p>
        </div>
    )
    return (
        <div className="flex flex-col gap-2 mb-4">
            {tags.map(tag => {
                const info = LABELS[tag] || {
                    label: tag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    description: 'Flagged as incorrect mental model.'
                }
                return (
                    <div key={tag} className="rounded-xl border border-red-900 bg-red-950/30 p-3">
                        <p className="text-red-300 text-xs font-bold uppercase tracking-wide mb-1">
                            ⚠ {info.label}
                        </p>
                        <p className="text-gray-400 text-xs italic">"{info.description}"</p>
                    </div>
                )
            })}
        </div>
    )
}

function ConceptMasteryFull({ mastery }) {
    const entries = Object.entries(mastery || {})
        .map(([tag, { correct, total }]) => ({ tag, correct, total, p: correct / total }))
        .sort((a, b) => a.p - b.p)
        .slice(0, 8)

    if (entries.length === 0) return (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 mb-4 text-center">
            <p className="text-gray-500 text-xs">No concept data yet.</p>
        </div>
    )

    return (
        <div className="flex flex-col gap-2 mb-4">
            {entries.map(({ tag, correct, total, p }) => (
                <div key={tag} className="flex items-center gap-3">
                    <p className="text-gray-400 text-xs w-36 shrink-0 truncate capitalize">
                        {tag.replace(/-/g, ' ')}
                    </p>
                    <div className="flex-1 h-1.5 rounded-full bg-gray-800">
                        <div
                            className={`h-1.5 rounded-full
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

function SettingsSection() {
    function handleResetProgress() {
        if (!window.confirm('Reset all progress? This cannot be undone.')) return
        Object.keys(localStorage)
            .filter(k => k.startsWith('sf_course_'))
            .forEach(k => localStorage.removeItem(k))
        window.location.reload()
    }

    return (
        <div className="flex flex-col gap-2 mb-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-white text-xs font-semibold mb-1">Account</p>
                <p className="text-gray-500 text-xs mb-3">
                    Sign in to sync your progress across devices. Coming soon.
                </p>
                <button
                    disabled
                    className="w-full bg-gray-800 text-gray-600 font-bold text-sm
                     py-2.5 rounded-xl border border-gray-700 cursor-not-allowed"
                >
                    Sign In — Coming Soon
                </button>
            </div>

            <div className="bg-gray-900 border border-red-900/40 rounded-xl p-4">
                <p className="text-white text-xs font-semibold mb-1">Danger Zone</p>
                <p className="text-gray-500 text-xs mb-3">
                    Permanently delete all your progress and diagnostic data.
                </p>
                <button
                    onClick={handleResetProgress}
                    className="w-full bg-red-950 hover:bg-red-900 active:scale-95
                     text-red-400 font-bold text-sm py-2.5 rounded-xl
                     border border-red-900 transition-all duration-200"
                >
                    Reset All Progress
                </button>
            </div>
        </div>
    )
}

// ── Main Screen ───────────────────────────────────────────
export default function ProfileScreen() {
    const navigate = useNavigate()
    const agg = getAggregateProfile()
    const allProgress = getAllProgress()
    const memberSince = getMemberSince()
    const locked = agg.totalCourses < MIN_COURSES
    const needed = Math.max(0, MIN_COURSES - agg.totalCourses)

    return (
        <div className="min-h-screen bg-gray-950 text-white pb-24">
            <div className="max-w-2xl mx-auto px-4 pt-6">

                <h1 className="text-2xl font-black mb-1">Profile</h1>
                <p className="text-gray-500 text-sm mb-4">Your cognitive fingerprint.</p>

                {/* Identity */}
                <IdentityHeader agg={agg} memberSince={memberSince} />

                {/* Domain Coverage */}
                <SectionHeader
                    title="Domain Coverage"
                    subtitle="Which of the 8 domains have you explored?"
                />
                <DomainCoverageMap allProgress={allProgress} />

                {/* Weak Areas */}
                <SectionHeader
                    title="Weak Areas"
                    subtitle="Your lowest-accuracy concepts across all courses"
                />
                <WeakAreas mastery={agg.conceptMastery} />

                {/* ── Cognitive Report ── */}
                <SectionHeader
                    title="Cognitive Report"
                    subtitle="Trait-level diagnostics — requires 2+ courses for reliability"
                />

                {locked && (
                    <div className="rounded-xl border border-blue-900 bg-blue-950/30 p-4 mb-4">
                        <p className="text-blue-300 text-sm font-bold mb-1">
                            🔬 Complete {needed} more course{needed !== 1 ? 's' : ''} to unlock
                        </p>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Cognitive traits require enough data to be statistically reliable.
                            Single-course estimates swing too wildly to be meaningful.
                        </p>
                    </div>
                )}

                {/* Cognitive quadrant */}
                <SectionHeader
                    title="Cognitive Profile"
                    subtitle="Every answer mapped by speed and correctness"
                />
                {locked ? <GateBlock needed={needed} /> : <QuadrantGrid q={agg.quadrant} />}

                {/* Calibration */}
                <SectionHeader
                    title="Confidence Calibration"
                    subtitle="How well your confidence matched your correctness"
                />
                {locked ? <GateBlock needed={needed} /> : (
                    <StatCard
                        label="Calibration Score"
                        value={`${pct(agg.calibrationScore)}%`}
                        sub={agg.calibrationScore >= 0.75 ? 'Well Calibrated' : agg.calibrationScore >= 0.55 ? 'Slightly Overconfident' : 'Overconfident'}
                        borderClass={agg.calibrationScore >= 0.75 ? 'border-green-900' : agg.calibrationScore >= 0.55 ? 'border-yellow-900' : 'border-red-900'}
                        colorClass={agg.calibrationScore >= 0.75 ? 'bg-green-950/30' : agg.calibrationScore >= 0.55 ? 'bg-yellow-950/30' : 'bg-red-950/30'}
                        icon="🎯"
                        description="100% = your confidence always matched reality. Below 55% = systematic overconfidence."
                    />
                )}

                {/* Overconfidence */}
                <SectionHeader
                    title="Overconfidence Index"
                    subtitle="Of your wrong answers, how many did you say 'Knew it'?"
                />
                {locked ? <GateBlock needed={needed} /> : (
                    <StatCard
                        label="Overconfidence Index"
                        value={`${pct(agg.overconfidenceIndex)}%`}
                        sub={agg.overconfidenceIndex < 0.2 ? "Low — you know what you don't know" : agg.overconfidenceIndex < 0.5 ? 'Moderate overconfidence' : 'High — frequent confident errors'}
                        borderClass={agg.overconfidenceIndex < 0.2 ? 'border-green-900' : agg.overconfidenceIndex < 0.5 ? 'border-yellow-900' : 'border-red-900'}
                        colorClass={agg.overconfidenceIndex < 0.2 ? 'bg-green-950/30' : agg.overconfidenceIndex < 0.5 ? 'bg-yellow-950/30' : 'bg-red-950/30'}
                        icon="⚠️"
                        description="The most dangerous learning pattern. Overconfident wrong answers are your V2 priority targets."
                    />
                )}

                {/* System 1 */}
                <SectionHeader
                    title="System 1 Vulnerability"
                    subtitle="Fast wrong answers — intuition firing before reasoning"
                />
                {locked ? <GateBlock needed={needed} /> : (
                    <StatCard
                        label="System 1 Vulnerability"
                        value={`${pct(agg.system1Vulnerability)}%`}
                        sub={agg.system1Vulnerability < 0.25 ? 'Low — you slow down before answering' : agg.system1Vulnerability < 0.5 ? 'Moderate System 1 reliance' : 'High — intuition is dominating'}
                        borderClass={agg.system1Vulnerability < 0.25 ? 'border-green-900' : agg.system1Vulnerability < 0.5 ? 'border-yellow-900' : 'border-red-900'}
                        colorClass={agg.system1Vulnerability < 0.25 ? 'bg-green-950/30' : agg.system1Vulnerability < 0.5 ? 'bg-yellow-950/30' : 'bg-red-950/30'}
                        icon="⚡"
                        description="Kahneman's System 1 = fast, intuitive, error-prone. High vulnerability means you answer before fully processing."
                    />
                )}

                {/* CRT */}
                {(agg.crtTotal > 0) && (
                    <>
                        <SectionHeader
                            title="Deliberate Thinking Score"
                            subtitle="CRT questions across all courses"
                        />
                        {locked ? <GateBlock needed={needed} /> : (
                            <StatCard
                                label="CRT Score"
                                value={`${pct(agg.crtScore)}%`}
                                sub={agg.crtScore >= 0.7 ? 'Strong deliberate thinker' : agg.crtScore >= 0.4 ? 'Mixed — some System 1 slips' : 'High System 1 reliance'}
                                borderClass={agg.crtScore >= 0.7 ? 'border-green-900' : agg.crtScore >= 0.4 ? 'border-yellow-900' : 'border-red-900'}
                                colorClass={agg.crtScore >= 0.7 ? 'bg-green-950/30' : agg.crtScore >= 0.4 ? 'bg-yellow-950/30' : 'bg-red-950/30'}
                                icon="🪞"
                                description="CRT questions have a seductive wrong answer. Most people score below 50%."
                            />
                        )}
                    </>
                )}

                {/* Anchor */}
                {(agg.anchorTotal > 0) && (
                    <>
                        <SectionHeader
                            title="Anchoring Bias"
                            subtitle="Did irrelevant numbers in questions pull your answers?"
                        />
                        {locked ? <GateBlock needed={needed} /> : (
                            <StatCard
                                label="Anchor Susceptibility"
                                value={`${pct(agg.anchorSusceptible)}%`}
                                sub={agg.anchorSusceptible < 0.3 ? 'Resistant to anchoring' : agg.anchorSusceptible < 0.6 ? 'Moderate susceptibility' : 'High — numbers affected your answers'}
                                borderClass={agg.anchorSusceptible < 0.3 ? 'border-green-900' : agg.anchorSusceptible < 0.6 ? 'border-yellow-900' : 'border-red-900'}
                                colorClass={agg.anchorSusceptible < 0.3 ? 'bg-green-950/30' : agg.anchorSusceptible < 0.6 ? 'bg-yellow-950/30' : 'bg-red-950/30'}
                                icon="⚓"
                                description="Anchoring bias is unconscious. Most people don't believe it affects them."
                            />
                        )}
                    </>
                )}

                {/* Misconceptions */}
                <SectionHeader
                    title="All Misconceptions Detected"
                    subtitle="Wrong mental models flagged across every course"
                />
                <MisconceptionsList tags={agg.misconceptions} />

                {/* Concept mastery */}
                <SectionHeader
                    title="Concept Mastery"
                    subtitle="Your accuracy per concept across all courses — weakest first"
                />
                <ConceptMasteryFull mastery={agg.conceptMastery} />

                {/* Settings */}
                <SectionHeader title="Settings" />
                <SettingsSection />

            </div>
        </div>
    )
}