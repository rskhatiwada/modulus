import { computeInsightScore, getActivityLog, getAllProgress } from '../utils/storage'

function LearningPulse() {
    const log = getActivityLog()

    // Build last 7 days
    const days = []
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        const count = log[key] || 0
        const label = d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)
        days.push({ key, count, label, isToday: i === 0 })
    }

    const maxCount = Math.max(...days.map(d => d.count), 1)

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
            <p className="text-white text-xs font-bold mb-3">Learning Pulse</p>
            <div className="flex items-end justify-between gap-1.5 h-12">
                {days.map(({ key, count, label, isToday }) => {
                    const heightPct = count > 0 ? Math.max(20, Math.round((count / maxCount) * 100)) : 0
                    return (
                        <div key={key} className="flex flex-col items-center gap-1 flex-1">
                            <div className="w-full rounded-sm flex items-end" style={{ height: '36px' }}>
                                <div
                                    className={`w-full rounded-sm transition-all duration-300
                    ${count > 0
                                            ? isToday ? 'bg-blue-400' : 'bg-blue-600/70'
                                            : 'bg-gray-800'
                                        }`}
                                    style={{ height: count > 0 ? `${heightPct}%` : '4px' }}
                                />
                            </div>
                            <span className={`text-[9px] font-medium
                ${isToday ? 'text-blue-400' : 'text-gray-600'}`}>
                                {label}
                            </span>
                        </div>
                    )
                })}
            </div>
            <p className="text-gray-600 text-[10px] mt-2">
                Questions answered per day — last 7 days
            </p>
        </div>
    )
}

export default function StatsOverview() {
    const allProgress = getAllProgress()
    const insightScore = computeInsightScore(allProgress)
    const totalQuestions = allProgress.reduce((sum, p) => sum + (p.questions || []).length, 0)
    const coursesStarted = allProgress.length
    const bossBeaten = allProgress.filter(p => p.badgeEarned).length

    const stats = [
        { label: 'Insight Score', value: insightScore.toLocaleString(), icon: '⚡', highlight: true },
        { label: 'Questions', value: totalQuestions, icon: '✅' },
        { label: 'Courses', value: coursesStarted, icon: '📚' },
        { label: 'Boss Wins', value: bossBeaten, icon: '⚔️' },
    ]

    return (
        <div className="mb-6">
            {/* Insight score + stats grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                {stats.map(({ label, value, icon, highlight }) => (
                    <div key={label}
                        className={`rounded-xl border p-3
              ${highlight
                                ? 'bg-blue-950/40 border-blue-900'
                                : 'bg-gray-900 border-gray-800'}`}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-base">{icon}</span>
                            {highlight && (
                                <span className="text-[9px] text-blue-400 font-semibold uppercase tracking-wide">
                                    Your Score
                                </span>
                            )}
                        </div>
                        <p className={`text-2xl font-black ${highlight ? 'text-blue-400' : 'text-white'}`}>
                            {value}
                        </p>
                        <p className="text-gray-500 text-[10px] mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            {/* Learning Pulse */}
            <LearningPulse />
        </div>
    )
}