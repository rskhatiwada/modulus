import { computeAchievements, getAllProgress } from '../utils/storage'

export default function AchievementsSection() {
    const allProgress = getAllProgress()
    const earned = computeAchievements(allProgress)

    // All possible achievements for display (locked ones shown grayed)
    const ALL = [
        { id: 'boss-slayer', emoji: '⚔️', title: 'Boss Slayer', description: 'Defeat a Boss Battle.' },
        { id: 'freak', emoji: '🧬', title: 'FREAK', description: 'Complete 5 courses.' },
        { id: 'ghost-buster', emoji: '👻', title: 'Ghost Buster', description: 'Correct on a misconception probe.' },
        { id: 'system1-slayer', emoji: '🪞', title: 'System 1 Slayer', description: 'Nail a CRT question confidently.' },
        { id: 'myth-busted', emoji: '💥', title: 'Myth Busted', description: 'Overcome a misconception you fell for before.' },
        { id: 'caught-yourself', emoji: '🎯', title: 'You Caught Yourself', description: 'Nail a question you were once overconfident on.' },
        { id: 'calibration-achieved', emoji: '🎯', title: 'Calibration Achieved', description: 'Match confidence to correctness 75%+ of the time.' },
    ]

    const earnedIds = new Set(earned.map(a => a.id))

    return (
        <div className="mb-6">
            {earned.length === 0 && (
                <p className="text-gray-600 text-xs mb-3">
                    Complete quizzes to unlock achievements.
                </p>
            )}
            <div className="grid grid-cols-1 gap-2">
                {ALL.map(({ id, emoji, title, description }) => {
                    const unlocked = earnedIds.has(id)
                    return (
                        <div key={id}
                            className={`flex items-center gap-3 rounded-xl border px-4 py-3
                transition-all duration-200
                ${unlocked
                                    ? 'bg-gray-900 border-gray-700'
                                    : 'bg-gray-950 border-gray-900 opacity-40'}`}>
                            <span className={`text-2xl ${!unlocked && 'grayscale'}`}>{emoji}</span>
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-bold ${unlocked ? 'text-white' : 'text-gray-600'}`}>
                                    {title}
                                </p>
                                <p className="text-gray-500 text-[10px] mt-0.5">{description}</p>
                            </div>
                            {unlocked && (
                                <span className="text-blue-400 text-xs font-bold shrink-0">✓</span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}