import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useMemo } from 'react'
import { courses } from '../data/courses'
import ProgressBar from '../components/ProgressBar'
import MathText from '../components/MathText'
import { getQuestionImage } from '../utils/imageUrl'
import { isQuestionFavorited, toggleQuestionFavorite } from '../utils/storage'
import {
  recordAnswer,
  recordLevelScore,
  isLevelUnlocked,
  getAttemptCount
} from '../utils/storage'
import { logActivity } from '../utils/storage'

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
    correctIndex: newCorrectIndex,
    originalIndices: shuffled.map(o => o.original)
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
  const explanationRef = useRef(null)  

  const question = questions[index]
  const currentOptions = shuffledOptions[index]

  const [questionFavorited, setQuestionFavorited] = useState(false)

  // reset favorite state when question changes
  useEffect(() => {
    if (question) {
      setQuestionFavorited(isQuestionFavorited(slug, question.id))
    }
  }, [index, slug])

  useEffect(() => {
    startTime.current = Date.now()
  }, [index])

  useEffect(() => {
    setIndex(0)
    setAnswers([])
    answersRef.current = []
  }, [level])

  useEffect(() => {                          // ← add here
    if (showExplanation && explanationRef.current) {
      explanationRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [showExplanation])

  if (!course) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Course not found.</p>
    </div>
  )

  {/* ADD THIS — right after the !course check */ }
  if (!course.questions || course.questions.length === 0) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
      <p className="text-4xl mb-4">🚧</p>
      <p className="text-white font-bold text-lg mb-2">Quiz Not Available Yet</p>
      <p className="text-gray-500 text-sm mb-8">
        This course is still being developed.
      </p>
      <button
        onClick={() => navigate(`/${domain}/${topic}/${slug}/story`)}
        className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
      >
        ← Back to course
      </button>
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

    const system1Trap = !correct && signal === 'knew_it' && timeMs < 8000
    const overconfidentWrong = !correct && signal === 'knew_it'

    let anchorSusceptible = null
    if (question.type === 'anchor' && question.anchorSusceptibleOptionIndex != null) {
      const selectedOriginalIndex = currentOptions.originalIndices[selected]
      anchorSusceptible = selectedOriginalIndex === question.anchorSusceptibleOptionIndex
    }

    const attemptCount = getAttemptCount(slug, question.id) + 1

    recordAnswer(slug, {
      id: question.id,
      level,
      type: question.type,
      misconceptionTag: question.misconceptionTag,
      conceptTags: question.conceptTags,
      difficultyEstimate: question.difficultyEstimate,
      cognitiveProcess: question.cognitiveProcess,
      correct,
      confidence: signal,
      timeMs,
      system1Trap,
      overconfidentWrong,
      anchorSusceptible,
      lastSeen: Date.now(),
      attemptCount
    })

    // To record every Answer
    logActivity()

    const updated = [...answersRef.current, { correct, confidence: signal }]
    answersRef.current = updated
    setAnswers(updated)
    setConfidence(signal)
    const skipExplanation = correct && signal === 'knew_it'
    if (skipExplanation) {
      // advance immediately, no explanation shown
      const updated2 = [...answersRef.current]  // already pushed above
      const score = updated2.filter(a => a.correct).length / updated2.length
      if (index + 1 < questions.length) {
        setSelected(null)
        setConfidence(null)
        setIndex(index + 1)
      } else {
        recordLevelScore(slug, level, score)
        if (level === 1) navigate(`/${domain}/${topic}/${slug}/blitz`)
        else if (level === 2) navigate(`/${domain}/${topic}/${slug}/quiz/level-3`)
        else navigate(`/${domain}/${topic}/${slug}/boss`)
      }
    } else {
      setShowExplanation(true)
    }
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

  // ← ADDED: resolve image URL once per question render
  const questionImageUrl = getQuestionImage(slug, question.image ?? null)

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
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
      <div className="mt-3 mb-3 min-h-[22px]">
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

      {/* Question header row: favorite button */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h2 className="text-white text-lg font-semibold leading-snug flex-1">
          <MathText text={question.question} />
        </h2>
        <button
          onClick={() => {
            const course = courses.find(c => c.slug === slug)
            const newState = toggleQuestionFavorite({
              courseSlug: slug,
              questionId: question.id,
              questionText: question.question,
              courseTitle: course?.titleDisplay || slug,
            })
            setQuestionFavorited(newState)
          }}
          className="shrink-0 mt-1 transition-transform active:scale-90"
          aria-label="Bookmark question"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"
            fill={questionFavorited ? '#3b82f6' : 'none'}
            stroke={questionFavorited ? '#3b82f6' : '#4b5563'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>


      {questionImageUrl && (
        <div className="w-[85%] max-w-md mx-auto mb-6 rounded-xl overflow-hidden border border-gray-800 aspect-video">
          <img
            src={questionImageUrl}
            alt={`Diagram for question ${question.id}`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover bg-gray-900"
          />
        </div>
      )}

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
              className={`${style} rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-150`}
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
              { signal: 'knew_it', label: 'Knew it', emoji: '✅' },
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
        <div ref={explanationRef} className={`mt-6 rounded-2xl p-4 ${isCorrect ? 'bg-green-950 border border-green-800' : 'bg-red-950 border border-red-800'}`}>
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