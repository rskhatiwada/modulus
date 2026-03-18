import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { courses } from '../data/courses'
import { loadProgress } from '../utils/storage'

// ── Radar Chart ───────────────────────────────────────────
function RadarChart({ scores }) {
  // scores = [accuracy, system1Resistance, misconceptionClearance, calibration]
  const dim = 260
  const cx = dim / 2, cy = dim / 2, r = 85
  const toRad = d => d * Math.PI / 180
  const angles = [-90, 0, 90, 180]

  const pt = (v, deg) => ({
    x: cx + Math.max(v, 0.04) * r * Math.cos(toRad(deg)),
    y: cy + Math.max(v, 0.04) * r * Math.sin(toRad(deg))
  })

  const gridLevels = [0.25, 0.5, 0.75, 1.0]

  const userPts = scores.map((s, i) => pt(s, angles[i]))
  const userPath = userPts.map((p, i) =>
    `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
  ).join(' ') + 'Z'

  // Fixed label positions for each axis
  const labelConfigs = [
    { x: cx, y: 18, anchor: 'middle', label: 'Accuracy', sub: 'overall correct' },
    { x: cx + r + 14, y: cy + 4, anchor: 'start', label: 'Focus', sub: 'CRT questions' },
    { x: cx, y: cy + r + 26, anchor: 'middle', label: 'Clarity', sub: 'misconceptions' },
    { x: cx - r - 14, y: cy + 4, anchor: 'end', label: 'Calibration', sub: 'self-knowledge' },
  ]

  return (
    <svg viewBox="0 0 260 260" className="w-full mx-auto" style={{ maxWidth: '200px' }}>
      {/* Grid rings */}
      {gridLevels.map(level => {
        const gPts = angles.map(a => pt(level, a))
        const gPath = gPts.map((p, i) =>
          `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
        ).join(' ') + 'Z'
        return (
          <path key={level} d={gPath}
            fill="none"
            stroke={level === 1.0 ? '#374151' : '#1f2937'}
            strokeWidth={level === 1.0 ? 1.5 : 1}
            strokeDasharray={level < 1 ? '4,3' : ''}
          />
        )
      })}

      {/* Axis lines */}
      {angles.map((a, i) => {
        const end = pt(1, a)
        return (
          <line key={i}
            x1={cx} y1={cy}
            x2={end.x.toFixed(1)} y2={end.y.toFixed(1)}
            stroke="#374151" strokeWidth="1"
          />
        )
      })}

      {/* User fill */}
      <path d={userPath}
        fill="rgba(59,130,246,0.2)"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Dots at each axis */}
      {userPts.map((p, i) => (
        <circle key={i}
          cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="4"
          fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5"
        />
      ))}

      {/* Labels */}
      {labelConfigs.map((lc, i) => (
        <g key={i}>
          <text x={lc.x} y={lc.y}
            textAnchor={lc.anchor}
            fontSize="8.5" fill="#6b7280"
            fontFamily="system-ui, sans-serif"
          >
            {lc.label}
          </text>
          <text x={lc.x} y={lc.y + 12}
            textAnchor={lc.anchor}
            fontSize="11" fontWeight="bold" fill="#93c5fd"
            fontFamily="system-ui, sans-serif"
          >
            {Math.round(scores[i] * 100)}%
          </text>
        </g>
      ))}

      {/* Center */}
      <circle cx={cx} cy={cy} r="3" fill="#374151" />
    </svg>
  )
}

// ── Horizontal bar ────────────────────────────────────────
function MasteryBar({ tag, correct, total }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const barColor = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
  const textColor = pct >= 80 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-300 text-xs capitalize">
          {tag.replace(/-/g, ' ')}
        </span>
        <span className={`text-xs font-bold ${textColor}`}>
          {pct}% <span className="text-gray-600 font-normal">({correct}/{total})</span>
        </span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ── Score row with mini bar ───────────────────────────────
function ScoreRow({ label, pct, color }) {
  const barColor = color || (pct >= 70 ? 'bg-green-500' : 'bg-red-500')
  const textColor = pct === null
    ? 'text-gray-600'
    : color ? 'text-blue-400'
      : pct >= 70 ? 'text-green-400' : 'text-red-400'
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-400 text-sm w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        {pct !== null && (
          <div
            className={`h-full rounded-full ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
      <span className={`text-sm font-bold w-10 text-right ${textColor}`}>
        {pct !== null ? `${pct}%` : '—'}
      </span>
    </div>
  )
}

// ── Tooltip-aware stat chip ───────────────────────────────
const TOOLTIPS = {
  Accuracy: {
    short: 'Overall correct',
    long: 'The percentage of all questions you answered correctly across every level. Your baseline knowledge score.'
  },
  Focus: {
    short: 'Resisted intuition traps',
    long: 'How well you answered CRT questions — the ones designed to feel obviously correct but require careful thinking to get right. High Focus means your System 2 reasoning overrode gut instinct.'
  },
  Clarity: {
    short: 'Misconceptions cleared',
    long: 'How many misconception-probe questions you got right. These target specific wrong mental models that most people carry. High Clarity means your mental model of this concept is accurate.'
  },
  Calibration: {
    short: 'Self-knowledge accuracy',
    long: 'How well your confidence matched your correctness. High calibration means when you said "Knew it" you were right, and when you said "Guessed" you were wrong. Low calibration — especially confident wrong answers — is a warning sign.'
  },
}

function CognitiveFingerprint({ accuracy, system1Resistance, misconceptionClearance, calibrationScore }) {
  const [activeTooltip, setActiveTooltip] = useState(null)

  const stats = [
    { label: 'Accuracy', value: Math.round(accuracy * 100) },
    { label: 'Focus', value: Math.round(system1Resistance * 100) },
    { label: 'Clarity', value: Math.round(misconceptionClearance * 100) },
    { label: 'Calibration', value: Math.round(calibrationScore * 100) },
  ]

  function handleTap(label) {
    setActiveTooltip(prev => prev === label ? null : label)
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-5">
      <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">
        Cognitive Fingerprint
      </h2>
      <p className="text-gray-600 text-xs mb-4">
        Your performance across four independent dimensions
      </p>

      {/* Smaller chart */}
      <RadarChart scores={[accuracy, system1Resistance, misconceptionClearance, calibrationScore]} />

      {/* Compact chips with tap tooltips */}
      <div className="mt-4 flex flex-col gap-2">
        {stats.map(({ label, value }) => {
          const isActive = activeTooltip === label
          const color = value >= 80
            ? 'text-green-400'
            : value >= 50
              ? 'text-yellow-400'
              : 'text-red-400'
          const tip = TOOLTIPS[label]

          return (
            <div key={label}>
              <button
                onClick={() => handleTap(label)}
                className="w-full flex items-center justify-between
                           bg-gray-800 hover:bg-gray-750 rounded-xl
                           px-4 py-2.5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 text-sm font-medium">{label}</span>
                  <span className="text-gray-600 text-xs">{tip.short}</span>
                  <span className="text-gray-600 text-xs ml-1">
                    {isActive ? '▲' : '▼'}
                  </span>
                </div>
                <span className={`text-sm font-black ${color}`}>{value}%</span>
              </button>

              {isActive && (
                <div className="mx-1 mt-0.5 bg-gray-800 border border-gray-700
                                rounded-b-xl px-4 py-3">
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {tip.long}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────
export default function ResultScreen() {
  const { domain, topic, slug } = useParams()
  const navigate = useNavigate()

  const course = courses.find(c => c.slug === slug)
  const progress = loadProgress(slug)

  if (!course || !progress) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">No results found.</p>
      </div>
    )
  }

  const answered = progress.questions || []
  const { levelScores, badgeEarned } = progress

  // Support both old 'got_it' and new 'knew_it'
  const knewIt = q => q.confidence === 'knew_it' || q.confidence === 'got_it'

  // ── Four radar axes ────────────────────────────────────
  const accuracy = answered.length > 0
    ? answered.filter(q => q.correct).length / answered.length
    : 0

  const crtQs = answered.filter(q => q.type === 'crt')
  const system1Resistance = crtQs.length > 0
    ? crtQs.filter(q => q.correct).length / crtQs.length
    : 0

  const probeQs = answered.filter(q => q.type === 'misconception_probe')
  const misconceptionClearance = probeQs.length > 0
    ? probeQs.filter(q => q.correct).length / probeQs.length
    : 0

  const calibrated = answered.filter(q =>
    (q.correct && knewIt(q)) ||
    (!q.correct && q.confidence === 'guessed')
  )
  const calibrationScore = answered.length > 0
    ? calibrated.length / answered.length
    : 0

  // ── Concept mastery ────────────────────────────────────
  const conceptMap = {}
  answered.forEach(q => {
    (q.conceptTags || []).forEach(tag => {
      if (!conceptMap[tag]) conceptMap[tag] = { correct: 0, total: 0 }
      conceptMap[tag].total++
      if (q.correct) conceptMap[tag].correct++
    })
  })
  const conceptEntries = Object.entries(conceptMap)
    .map(([tag, v]) => ({
      tag, ...v,
      pct: v.total > 0 ? v.correct / v.total : 0
    }))
    .filter(c => c.total >= 3)
    .sort((a, b) => a.pct - b.pct)



  // ── Calibration matrix ─────────────────────────────────
  const matrix = {
    knewCorrect: answered.filter(q => q.correct && knewIt(q)).length,
    knewWrong: answered.filter(q => !q.correct && knewIt(q)).length,
    unsureCorrect: answered.filter(q => q.correct && q.confidence === 'unsure').length,
    unsureWrong: answered.filter(q => !q.correct && q.confidence === 'unsure').length,
    guessedCorrect: answered.filter(q => q.correct && q.confidence === 'guessed').length,
    guessedWrong: answered.filter(q => !q.correct && q.confidence === 'guessed').length,
  }

  // ── Priority targets ───────────────────────────────────
  const wrong = answered.filter(q => !q.correct)
  const overconfidentCount = wrong.filter(q => knewIt(q)).length
  const misconceptions = [...new Set(
    answered.filter(q => !q.correct && q.misconceptionTag).map(q => q.misconceptionTag)
  )]
  const weakestConcept = conceptEntries.find(c => c.pct < 1.0)

  // ── Blitz + Boss ───────────────────────────────────────
  const blitzAnswers = progress.blitz || []
  const blitzPct = blitzAnswers.length > 0
    ? Math.round(blitzAnswers.filter(b => b.correct).length / blitzAnswers.length * 100)
    : null

  const bossAnswers = progress.boss || []
  const bossPct = bossAnswers.length > 0
    ? Math.round(bossAnswers.filter(b => b.correct).length / bossAnswers.length * 100)
    : null

  const overallPct = Math.round(accuracy * 100)

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10 max-w-2xl mx-auto">

      {/* ── Hero ─────────────────────────────────────── */}
      <div className="text-center mb-8">
        {badgeEarned && <p className="text-5xl mb-3">🏆</p>}
        <h1 className="text-white text-2xl font-bold">{course.titleDisplay}</h1>
        <p className="text-gray-500 text-sm mt-1 mb-5">Course Complete · {answered.length} questions</p>
        <div className={`inline-block text-white text-5xl font-black px-10 py-4 rounded-2xl
          ${overallPct >= 80 ? 'bg-green-700' : overallPct >= 60 ? 'bg-blue-700' : 'bg-red-800'}`}>
          {overallPct}%
        </div>
        <p className="text-gray-600 text-xs mt-3">overall accuracy</p>
      </div>

      {/* ── Cognitive Fingerprint ────────────────────── */}
      <CognitiveFingerprint
        accuracy={accuracy}
        system1Resistance={system1Resistance}
        misconceptionClearance={misconceptionClearance}
        calibrationScore={calibrationScore}
      />

      {/* ── Concept Mastery ──────────────────────────── */}
      {conceptEntries.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-5">
          <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">
            Concept Mastery
          </h2>
          <p className="text-gray-600 text-xs mb-4">Weakest concepts shown first</p>
          {conceptEntries.map(({ tag, correct, total }) => (
            <MasteryBar key={tag} tag={tag} correct={correct} total={total} />
          ))}
        </div>
      )}

      {/* ── Calibration Matrix ───────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-5">
        <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">
          Confidence Accuracy Matrix
        </h2>
        <p className="text-gray-600 text-xs mb-4">
          How well your stated confidence matched your actual correctness
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-600 text-xs pb-2 w-1/3"></th>
              <th className="text-center text-gray-400 text-xs pb-2">✓ Correct</th>
              <th className="text-center text-gray-400 text-xs pb-2">✗ Wrong</th>
              <th className="text-center text-gray-500 text-xs pb-2">Flag</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-800">
              <td className="py-2.5 text-gray-300 text-xs">Knew it ✅</td>
              <td className="text-center font-bold text-green-400 text-base">{matrix.knewCorrect}</td>
              <td className="text-center font-bold text-red-400 text-base">{matrix.knewWrong}</td>
              <td className="text-center text-xs text-gray-500">
                {matrix.knewWrong > 2 ? '🚨 Overconfident' : matrix.knewCorrect > 0 ? '✅ Calibrated' : '—'}
              </td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-2.5 text-gray-300 text-xs">Unsure 🤔</td>
              <td className="text-center font-bold text-blue-400 text-base">{matrix.unsureCorrect}</td>
              <td className="text-center font-bold text-yellow-400 text-base">{matrix.unsureWrong}</td>
              <td className="text-center text-xs text-gray-500">
                {matrix.unsureCorrect > matrix.unsureWrong ? '📈 Developing' : '📚 Gap'}
              </td>
            </tr>
            <tr>
              <td className="py-2.5 text-gray-300 text-xs">Guessed 🎲</td>
              <td className="text-center font-bold text-yellow-400 text-base">{matrix.guessedCorrect}</td>
              <td className="text-center font-bold text-gray-500 text-base">{matrix.guessedWrong}</td>
              <td className="text-center text-xs text-gray-500">
                {matrix.guessedCorrect > 0 ? '🎲 Lucky' : matrix.guessedWrong > 0 ? '📚 Aware gap' : '—'}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="text-gray-700 text-xs mt-3">
          Ideal: high Knew it ✓, low Knew it ✗. A large Knew it ✗ count is a System 1 warning.
        </p>
      </div>

      {/* ── Where to Focus ───────────────────────────── */}
      <div className="mb-5">
        <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">
          Where to Focus Next
        </h2>
        <div className="flex flex-col gap-3">
          {weakestConcept && (
            <div className="bg-red-950 border border-red-900 rounded-xl p-4">
              <p className="text-red-400 text-xs font-semibold uppercase tracking-wide mb-1">
                Weakest Concept
              </p>
              <p className="text-white font-bold capitalize text-base">
                {weakestConcept.tag.replace(/-/g, ' ')}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {Math.round(weakestConcept.pct * 100)}% accuracy ({weakestConcept.correct}/{weakestConcept.total} correct).
                Review the story section on this concept and re-attempt the level.
              </p>
            </div>
          )}
          {misconceptions.length > 0 && (
            <div className="bg-orange-950 border border-orange-900 rounded-xl p-4">
              <p className="text-orange-400 text-xs font-semibold uppercase tracking-wide mb-1">
                Active Misconception{misconceptions.length > 1 ? 's' : ''}
              </p>
              {misconceptions.map(m => (
                <p key={m} className="text-white font-bold capitalize text-base">
                  {m.replace(/-/g, ' ')}
                </p>
              ))}
              <p className="text-gray-400 text-xs mt-1">
                These wrong mental models are still active. V2 will target them directly.
              </p>
            </div>
          )}
          {overconfidentCount > 0 && (
            <div className="bg-yellow-950 border border-yellow-900 rounded-xl p-4">
              <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wide mb-1">
                Overconfidence Alert
              </p>
              <p className="text-white font-bold text-base">
                {overconfidentCount} confident wrong answer{overconfidentCount > 1 ? 's' : ''}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                You said "Knew it" but were wrong {overconfidentCount} time{overconfidentCount > 1 ? 's' : ''}.
                These are your highest-priority System 1 traps — intuition felt right, reasoning was wrong.
              </p>
            </div>
          )}
          {!weakestConcept && misconceptions.length === 0 && overconfidentCount === 0 && (
            <div className="bg-green-950 border border-green-900 rounded-xl p-4">
              <p className="text-green-400 text-xs font-semibold uppercase tracking-wide mb-1">
                No Priority Targets
              </p>
              <p className="text-white font-bold text-base">Excellent performance</p>
              <p className="text-gray-400 text-xs mt-1">
                Accurate, well-calibrated, and misconception-free. Proceed to the next course.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Session Scores ───────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-5">
        <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">
          Session Scores
        </h2>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(lvl => {
            const score = levelScores[lvl]
            const pct = score !== null ? Math.round(score * 100) : null
            return <ScoreRow key={lvl} label={`Level ${lvl}`} pct={pct} />
          })}
          {blitzPct !== null && (
            <div className="pt-2 border-t border-gray-800">
              <ScoreRow label="Blitz ⚡" pct={blitzPct} color="bg-blue-500" />
            </div>
          )}
          {bossPct !== null && (
            <div className="pt-2 border-t border-gray-800">
              <ScoreRow label="Boss Battle 👹" pct={bossPct} color={bossPct >= 70 ? 'bg-purple-500' : 'bg-red-500'} />
            </div>
          )}
        </div>
      </div>

      {/* ── Back to home ─────────────────────────────── */}
      <button
        onClick={() => navigate('/')}
        className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95
                   text-white font-bold text-lg py-4 rounded-2xl
                   transition-all duration-200"
      >
        ← Back to Home
      </button>

    </div>
  )
}