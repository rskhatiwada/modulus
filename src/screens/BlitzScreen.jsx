import { recordBlitzAnswer } from '../utils/storage'
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { courses } from '../data/courses'
import ProgressBar from '../components/ProgressBar'
import MathText from '../components/MathText'

const SECONDS_PER_STATEMENT = 12

export default function BlitzScreen() {
  const { domain, topic, slug } = useParams()
  const navigate = useNavigate()

  const course = courses.find(c => c.slug === slug)
  const statements = course?.blitz || []

  const [index, setIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_STATEMENT)
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState(null)
  const [results, setResults] = useState([])
  const [finished, setFinished] = useState(false)
  const timerRef = useRef(null)

  const statement = statements[index]

  // Countdown timer
  useEffect(() => {
    if (finished) return
    setTimeLeft(SECONDS_PER_STATEMENT)
    setAnswered(false)
    setSelected(null)

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          // Time ran out — mark as wrong
          if (!answered) {
            handleResult(null)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [index, finished])

  function handleResult(userAnswer) {
    clearInterval(timerRef.current)
    const timeMs = (SECONDS_PER_STATEMENT - timeLeft) * 1000
    setAnswered(true)
    setSelected(userAnswer)

    const correct = userAnswer === statement.answer
    const newResults = [...results, { correct, userAnswer }]
    setResults(newResults)

    recordBlitzAnswer(slug, {
      id: statement.id,
      statement: statement.statement,
      correct,
      timeMs
    })

    // Move to next after short delay
    setTimeout(() => {
      if (index + 1 < statements.length) {
        setIndex(index + 1)
      } else {
        setFinished(true)
      }
    }, 800)
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Course not found.</p>
      </div>
    )
  }

  // Results screen
  if (finished) {
    const score = results.filter(r => r.correct).length
    return (
      <div className="min-h-screen bg-gray-950 px-4 py-10 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-blue-400 text-sm font-semibold uppercase 
                        tracking-widest mb-2">
            Blitz Complete
          </p>
          <h1 className="text-white text-4xl font-bold">{score} / {statements.length}</h1>
          <p className="text-gray-400 mt-2 text-sm">
            {score >= 8
              ? 'Outstanding. You know this cold.'
              : score >= 6
                ? 'Solid. A few gaps to close.'
                : 'Keep going — Level 2 will sharpen this.'}
          </p>
        </div>

        {/* Statement results */}
        <div className="flex flex-col gap-3 mb-10">
          {statements.map((s, i) => {
            const r = results[i]
            return (
              <div
                key={s.id}
                className={`rounded-xl px-4 py-3 border text-sm
                            ${r?.correct
                              ? 'bg-green-950 border-green-800 text-green-300'
                              : 'bg-red-950 border-red-800 text-red-300'
                            }`}
              >
                <span className="mr-2">{r?.correct ? '✓' : '✗'}</span>
                {s.statement}
                {!r?.correct && (
                  <span className="block text-gray-400 text-xs mt-1">
                    Answer: {s.answer ? 'True' : 'False'}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={() => navigate(
            `/${domain}/${topic}/${slug}/quiz/level-2`
          )}
          className="w-full bg-[#23b14d] hover:bg-blue-500 active:scale-95
                     text-white font-bold text-lg py-4 rounded-2xl
                     transition-all duration-200"
        >
          Continue to Level 2 →
        </button>
      </div>
    )
  }

  // Timer color
  const timerColor = timeLeft <= 3
    ? 'text-red-400'
    : timeLeft <= 6
      ? 'text-yellow-400'
      : 'text-green-400'

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-[#23b14d] text-sm font-semibold uppercase tracking-widest">
          ⚡ True / False Blitz
        </span>
        <span className="text-gray-400 text-sm">
          {index + 1} / {statements.length}
        </span>
      </div>

      {/* Progress */}
      <ProgressBar current={index} total={statements.length} color="bg-blue-500" />

      {/* Timer */}
      <div className="text-center my-8">
        <span className={`text-6xl font-bold ${timerColor} transition-colors`}>
          {timeLeft}
        </span>
      </div>

      {/* Statement */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
        <p className="text-white text-lg font-semibold text-center leading-snug">
          <MathText text={statement?.statement} />
        </p>
      </div>

      {/* True / False buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => !answered && handleResult(true)}
          className={`flex-1 py-5 rounded-2xl font-bold text-xl
                      transition-all active:scale-95
                      ${answered
                        ? selected === true
                          ? statement.answer === true
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                          : 'bg-gray-800 text-gray-500'
                        : 'bg-green-700 hover:bg-green-600 text-white cursor-pointer'
                      }`}
        >
          True
        </button>
        <button
          onClick={() => !answered && handleResult(false)}
          className={`flex-1 py-5 rounded-2xl font-bold text-xl
                      transition-all active:scale-95
                      ${answered
                        ? selected === false
                          ? statement.answer === false
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                          : 'bg-gray-800 text-gray-500'
                        : 'bg-red-700 hover:bg-red-600 text-white cursor-pointer'
                      }`}
        >
          False
        </button>
      </div>

    </div>
  )
}