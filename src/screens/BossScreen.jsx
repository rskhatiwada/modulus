import { recordBossAnswer, recordBossResult } from '../utils/storage'
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useMemo } from 'react'
import { courses } from '../data/courses'
import ProgressBar from '../components/ProgressBar'
import MathText from '../components/MathText'

export default function BossScreen() {
  const { domain, topic, slug } = useParams()
  const navigate = useNavigate()

  const course = courses.find(c => c.slug === slug)

  // Boss uses the 10 hardest Level 3 questions
  const allL3 = course?.questions.filter(q => q.level === 3) || []

  const questions = useMemo(() => {
    const shuffled = [...allL3].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 10)
  }, [slug])

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [finished, setFinished] = useState(false)
  const [totalTime, setTotalTime] = useState(0)
  const timerRef = useRef(null)

  const question = questions[index]

  // Global timer — counts up
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTotalTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  // Stop timer when finished
  useEffect(() => {
    if (finished) clearInterval(timerRef.current)
  }, [finished])

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Course not found.</p>
      </div>
    )
  }

  function handleSelect(optionIndex) {
    if (selected !== null) return
    setSelected(optionIndex)
  }

  function handleNext() {
    const correct = selected === question.answer
    const timeMs = totalTime * 1000
    const newAnswers = [...answers, { correct }]
    setAnswers(newAnswers)

    recordBossAnswer(slug, {
      id: question.id,
      correct,
      timeMs
    })

    if (index + 1 < questions.length) {
      setSelected(null)
      setIndex(index + 1)
    } else {
      const score = newAnswers.filter(a => a.correct).length / questions.length
      const passed = score >= 0.7
      recordBossResult(slug, passed)
      setFinished(true)
    }
  }

  // Format seconds to mm:ss
  function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  // Results screen
  if (finished) {
    const score = answers.filter(a => a.correct).length
    const passed = score / questions.length >= 0.7

    return (
      <div className="min-h-screen bg-gray-950 px-3 py-6 
                      max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <p className="text-5xl mb-4">{passed ? '🏆' : '💀'}</p>
          <h1 className="text-white text-3xl font-bold mb-2">
            {passed ? 'Boss Defeated!' : 'Boss Wins This Round'}
          </h1>
          <p className="text-gray-400 text-sm">
            {score} / {questions.length} correct · {formatTime(totalTime)}
          </p>
        </div>

        {passed ? (
          <div className="bg-yellow-950 border border-yellow-700 
                          rounded-2xl p-6 mb-8">
            <p className="text-yellow-400 font-bold text-lg mb-1">
              Badge Unlocked
            </p>
            <p className="text-gray-300 text-sm">
              {course.titleDisplay}
            </p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 
                          rounded-2xl p-6 mb-8">
            <p className="text-gray-300 text-sm">
              You need 70% to earn the badge. Review the levels and try again.
            </p>
          </div>
        )}

        <button
          onClick={() => navigate(
            `/${domain}/${topic}/${slug}/result`
          )}
          className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95
                     text-white font-bold text-lg py-4 rounded-2xl
                     transition-all duration-200"
        >
          See Full Results →
        </button>
      </div>
    )
  }

  const isCorrect = selected === question.answer

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-red-400 text-sm font-semibold uppercase tracking-widest">
          ⚔️ Boss Battle
        </span>
        <span className="text-gray-300 font-mono text-sm font-bold">
          {formatTime(totalTime)}
        </span>
      </div>

      {/* Progress */}
      <ProgressBar
        current={index}
        total={questions.length}
        color="bg-red-500"
      />

      {/* Question count */}
      <p className="text-gray-500 text-sm mt-3 mb-6">
        Question {index + 1} of {questions.length} — no hints
      </p>

      {/* Question */}
      <h2 className="text-white text-lg font-semibold leading-snug mb-6">
        <MathText text={question.question} />
      </h2>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {question.options.map((option, i) => {
          let style = 'bg-gray-900 border border-gray-800 text-gray-200 \
                       hover:border-red-500 cursor-pointer active:scale-95'

          if (selected !== null) {
            if (i === question.answer) {
              style = 'bg-green-900 border border-green-500 text-white'
            } else if (i === selected && !isCorrect) {
              style = 'bg-red-900 border border-red-500 text-white'
            } else {
              style = 'bg-gray-900 border border-gray-800 text-gray-500'
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`${style} rounded-xl px-4 py-4 text-left text-sm
                          font-medium transition-all duration-150`}
            >
              <span className="text-gray-500 mr-3">
                {['A', 'B', 'C', 'D'][i]}.
              </span>
              <MathText text={option} />
            </button>
          )
        })}
      </div>

      {/* Next button — shown after selection, no explanation */}
      {selected !== null && (
        <button
          onClick={handleNext}
          className="mt-8 w-full bg-red-600 hover:bg-red-500 active:scale-95
                     text-white font-bold text-lg py-4 rounded-2xl
                     transition-all duration-200"
        >
          {index + 1 < questions.length ? 'Next →' : 'Finish Battle →'}
        </button>
      )}

    </div>
  )
}