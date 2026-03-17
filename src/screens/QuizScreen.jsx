import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useMemo } from 'react'
import { courses } from '../data/courses'
import ProgressBar from '../components/ProgressBar'
import MathText from '../components/MathText'
import {
  recordAnswer,
  recordLevelScore,
  isLevelUnlocked
} from '../utils/storage'

const LEVEL_MAP = { 'level-1': 1, 'level-2': 2, 'level-3': 3 }

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function shuffleOptions(options, correctIndex) {
  const indexed = options.map((text, i) => ({ text, original: i }))
  const shuffled = shuffle(indexed)
  const newCorrectIndex = shuffled.findIndex(o => o.original === correctIndex)
  return {
    options: shuffled.map(o => o.text),
    correctIndex: newCorrectIndex
  }
}

export default function QuizScreen() {
  const { domain, topic, slug, level: levelParam } = useParams()
  const navigate = useNavigate()
  const level = LEVEL_MAP[levelParam] || 1

  const course = courses.find(c => c.slug === slug)
  const rawQuestions = course?.questions.filter(q => q.level === level) || []

  const { questions, shuffledOptions } = useMemo(() => {
    const shuffledQs = shuffle(rawQuestions)
    const opts = shuffledQs.map(q => shuffleOptions(q.options, q.answer))
    return { questions: shuffledQs, shuffledOptions: opts }
  }, [slug, level])

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [confidence, setConfidence] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [answers, setAnswers] = useState([])
  const answersRef = useRef([])
  const startTime = useRef(Date.now())

  const question = questions[index]
  const currentOptions = shuffledOptions[index]

  // Reset index and answers when level changes
  useEffect(() => {
    setIndex(0)
    setAnswers([])
    answersRef.current = []
  }, [level])

  if (!course) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Course not found.</p>
    </div>
  )

  if (!isLevelUnlocked(slug, level)) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-white text-xl font-bold mb-2">Level {level} is locked</p>
        <p className="text-gray-400 text-sm mb-6">
          You need 70% on Level {level - 1} to unlock this.
        </p>
        <button
          onClick={() => navigate(`/${domain}/${topic}/${slug}/quiz/level-${level - 1}`)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Go to Level {level - 1}
        </button>
      </div>
    </div>
  )

  function handleSelect(optionIndex) {
    if (selected !== null) return
    setSelected(optionIndex)
  }

  function handleConfidence(signal) {
    const timeMs = Date.now() - startTime.current
    const correct = selected === currentOptions.correctIndex

    recordAnswer(slug, {
      id: question.id,
      type: question.type,
      misconception: question.misconception,
      correct,
      confidence: signal,
      timeMs,
      level
    })

    const updated = [...answersRef.current, { correct, confidence: signal }]
    answersRef.current = updated
    setAnswers(updated)
    setConfidence(signal)
    setShowExplanation(true)
  }

  function handleNext() {
    setSelected(null)
    setConfidence(null)
    setShowExplanation(false)

    if (index + 1 < questions.length) {
      setIndex(index + 1)
    } else {
      const all = answersRef.current
      const score = all.filter(a => a.correct).length / all.length
      recordLevelScore(slug, level, score)

      if (level === 1) navigate(`/${domain}/${topic}/${slug}/blitz`)
      else if (level === 2) navigate(`/${domain}/${topic}/${slug}/quiz/level-3`)
      else navigate(`/${domain}/${topic}/${slug}/boss`)
    }
  }

  const isCorrect = selected === currentOptions?.correctIndex

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(`/${domain}/${topic}/${slug}/story`)}
          className="text-gray-500 text-sm hover:text-white transition-colors"
        >
          ← Exit
        </button>
        <span className="text-gray-400 text-sm font-medium">
          Level {level} · {index + 1} / {questions.length}
        </span>
      </div>

      <ProgressBar current={index} total={questions.length} />

      {/* Question type badge */}
      <div className="mt-6 mb-4 min-h-[28px]">
        {question.type === 'crt' && (
          <span className="sf-badge-crt">Think carefully</span>
        )}
        {question.type === 'misconception_probe' && (
          <span className="sf-badge-misconception">Common misconception</span>
        )}
        {question.type === 'anchor' && (
          <span className="sf-badge-anchor">Stay focused</span>
        )}
      </div>

      {/* Question */}
      <h2 className="text-white text-lg font-semibold leading-snug mb-6">
        <MathText text={question.question} />
      </h2>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {currentOptions?.options.map((option, i) => {
          let style = 'bg-gray-900 border border-gray-800 text-gray-200 hover:border-blue-500 cursor-pointer active:scale-95'
          if (selected !== null) {
            if (i === currentOptions.correctIndex) {
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
              className={`${style} rounded-xl px-4 py-4 text-left text-sm font-medium transition-all duration-150`}
            >
              <span className="text-gray-500 mr-3">{['A', 'B', 'C', 'D'][i]}.</span>
              <MathText text={option} />
            </button>
          )
        })}
      </div>

      {/* Confidence signal */}
      {selected !== null && confidence === null && (
        <div className="mt-8">
          <p className="text-gray-400 text-sm text-center mb-3">How did you find that?</p>
          <div className="flex gap-3 justify-center">
            {[
              { signal: 'got_it', label: 'Knew it', emoji: '✅' },
              { signal: 'unsure', label: 'Unsure', emoji: '🤔' },
              { signal: 'guessed', label: 'Guessed', emoji: '🎲' },
            ].map(({ signal, label, emoji }) => (
              <button
                key={signal}
                onClick={() => handleConfidence(signal)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl py-3 text-white text-sm font-medium transition-all active:scale-95"
              >
                <span className="block text-xl mb-1">{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      {showExplanation && (
        <div className={`mt-6 rounded-2xl p-4 ${isCorrect ? 'bg-green-950 border border-green-800' : 'bg-red-950 border border-red-800'}`}>
          <p className={`text-sm font-bold mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? '✓ Correct' : '✗ Incorrect'}
          </p>
          <MathText text={question.explanation} className="text-gray-300 text-sm leading-relaxed" />
          <button
            onClick={handleNext}
            className="sf-btn-primary mt-4 active:scale-95"
          >
            {index + 1 < questions.length ? 'Next Question →' : 'Finish Level →'}
          </button>
        </div>
      )}

    </div>
  )
}