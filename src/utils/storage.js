// ── Key generator ─────────────────────────────────────────
const key = (slug) => `sf_course_${slug}`
const USER_KEY = 'sf_user_id'

// ── User ID ───────────────────────────────────────────────
export function getUserId() {
  let id = localStorage.getItem(USER_KEY)
  if (!id) {
    id = 'user_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem(USER_KEY, id)
  }
  return id
}

// ── Load / Save ───────────────────────────────────────────
export function loadProgress(slug) {
  const raw = localStorage.getItem(key(slug))
  if (!raw) return null
  return JSON.parse(raw)
}

export function saveProgress(slug, data) {
  localStorage.setItem(key(slug), JSON.stringify(data))
}

// ── Attempt count ─────────────────────────────────────────
export function getAttemptCount(courseSlug, questionId) {
  const progress = loadProgress(courseSlug)
  if (!progress) return 0
  return (progress.questions || []).filter(q => q.id === questionId).length
}

// ── Init fresh progress ───────────────────────────────────
export function initProgress(slug) {
  const userId = getUserId()
  const fresh = {
    userId,
    course: slug,
    startedAt: Date.now(),
    levelsUnlocked: [1],
    levelScores: { 1: null, 2: null, 3: null },
    badgeEarned: false,
    questions: [],
    blitz: [],
    boss: [],
    profile: {
      overconfidenceIndex: 0,
      system1Vulnerability: 0,
      misconceptionsDetected: [],
      calibrationScore: 0,
      conceptMastery: {}
    }
  }
  saveProgress(slug, fresh)
  return fresh
}

// ── Record a single question answer ───────────────────────
export function recordAnswer(slug, {
  id,
  level,
  type,
  misconceptionTag,     // replaces old 'misconception' field
  conceptTags,
  difficultyEstimate,
  cognitiveProcess,
  correct,
  confidence,
  timeMs,
  system1Trap: passedSystem1Trap,   // passed in from QuizScreen
  overconfidentWrong,
  anchorSusceptible,
  lastSeen,
  attemptCount
}) {
  const progress = loadProgress(slug) || initProgress(slug)

  // Fallback compute system1Trap if not passed (backward compat)
  // Supports both old 'got_it' and new 'knew_it'
  const system1Trap = passedSystem1Trap ?? (
    !correct &&
    (confidence === 'knew_it' || confidence === 'got_it') &&
    timeMs < 8000
  )

  const entry = {
    id,
    level,
    type,
    misconceptionTag: misconceptionTag || null,
    conceptTags: conceptTags || [],
    difficultyEstimate: difficultyEstimate || null,
    cognitiveProcess: cognitiveProcess || null,
    correct,
    confidence,
    timeMs,
    system1Trap,
    overconfidentWrong: overconfidentWrong ?? (!correct && (confidence === 'knew_it' || confidence === 'got_it')),
    anchorSusceptible: anchorSusceptible ?? null,
    lastSeen: lastSeen || Date.now(),
    attemptCount: attemptCount || 1
  }

  // Replace previous answer for this question on re-attempt
  progress.questions = progress.questions.filter(q => q.id !== id)
  progress.questions.push(entry)

  // ── Recompute diagnostic profile ──────────────────────
  const answered = progress.questions
  const wrong = answered.filter(q => !q.correct)

  // Support both old got_it and new knew_it
  const knewIt = q => q.confidence === 'knew_it' || q.confidence === 'got_it'

  progress.profile.overconfidenceIndex =
    wrong.length > 0 ? wrong.filter(q => knewIt(q)).length / wrong.length : 0

  progress.profile.system1Vulnerability =
    wrong.length > 0 ? wrong.filter(q => q.system1Trap).length / wrong.length : 0

  // Misconceptions detected from wrong answers
  progress.profile.misconceptionsDetected = [...new Set(
    answered.filter(q => !q.correct && q.misconceptionTag).map(q => q.misconceptionTag)
  )]

  // Calibration: confidence matched correctness
  const calibrated = answered.filter(q =>
    (q.correct && knewIt(q)) ||
    (!q.correct && q.confidence === 'guessed')
  )
  progress.profile.calibrationScore =
    answered.length > 0 ? calibrated.length / answered.length : 0

  // Concept mastery: group by conceptTag, compute accuracy per tag
  const conceptMastery = {}
  answered.forEach(q => {
    (q.conceptTags || []).forEach(tag => {
      if (!conceptMastery[tag]) conceptMastery[tag] = { correct: 0, total: 0 }
      conceptMastery[tag].total++
      if (q.correct) conceptMastery[tag].correct++
    })
  })
  progress.profile.conceptMastery = conceptMastery

  saveProgress(slug, progress)
  return progress
}

// ── Record level score and unlock next ────────────────────
export function recordLevelScore(slug, level, score) {
  const progress = loadProgress(slug) || initProgress(slug)
  progress.levelScores[level] = score
  if (score >= 0.7 && level < 3 && !progress.levelsUnlocked.includes(level + 1)) {
    progress.levelsUnlocked.push(level + 1)
  }
  saveProgress(slug, progress)
  return progress
}

// ── Record boss result ────────────────────────────────────
export function recordBossResult(slug, passed) {
  const progress = loadProgress(slug) || initProgress(slug)
  progress.badgeEarned = passed
  progress.completedAt = Date.now()
  saveProgress(slug, progress)
  return progress
}

// ── Check level unlock ────────────────────────────────────
export function isLevelUnlocked(slug, level) {
  const progress = loadProgress(slug)
  if (!progress) return level === 1
  return progress.levelsUnlocked.includes(level)
}

// ── Record blitz answer ───────────────────────────────────
export function recordBlitzAnswer(slug, { id, statement, correct, timeMs }) {
  const progress = loadProgress(slug) || initProgress(slug)
  if (!progress.blitz) progress.blitz = []
  progress.blitz = progress.blitz.filter(b => b.id !== id)
  progress.blitz.push({ id, statement, correct, timeMs, lastSeen: Date.now() })
  saveProgress(slug, progress)
  return progress
}

// ── Record boss answer ────────────────────────────────────
export function recordBossAnswer(slug, { id, correct, timeMs }) {
  const progress = loadProgress(slug) || initProgress(slug)
  if (!progress.boss) progress.boss = []
  progress.boss = progress.boss.filter(b => b.id !== id)
  progress.boss.push({
    id, correct, timeMs,
    system1Trap: !correct && timeMs < 6000,
    lastSeen: Date.now()
  })
  saveProgress(slug, progress)
  return progress
}

// ── Get level score ───────────────────────────────────────
export function getLevelScore(slug, level) {
  const progress = loadProgress(slug)
  if (!progress) return null
  return progress.levelScores[level]
}