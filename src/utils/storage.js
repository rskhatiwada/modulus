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

// ── Load progress for a course ────────────────────────────
export function loadProgress(slug) {
  const raw = localStorage.getItem(key(slug))
  if (!raw) return null
  return JSON.parse(raw)
}

// ── Save progress for a course ────────────────────────────
export function saveProgress(slug, data) {
  localStorage.setItem(key(slug), JSON.stringify(data))
}

// ── Initialise a fresh progress object for a course ───────
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
    profile: {
      overconfidenceIndex: 0,
      system1Vulnerability: 0,
      misconceptionsDetected: [],
      calibrationScore: 0
    }
  }
  saveProgress(slug, fresh)
  return fresh
}

// ── Record a single question answer ───────────────────────
export function recordAnswer(slug, {
  id, type, misconception, correct,
  confidence, timeMs, level
}) {
  const progress = loadProgress(slug) || initProgress(slug)

  const system1Trap =
    !correct &&
    confidence === 'got_it' &&
    timeMs < 8000

  const entry = {
    id,
    type,
    misconception: misconception || null,
    correct,
    confidence,
    timeMs,
    level,
    system1Trap,
    lastSeen: Date.now()
  }

  // Remove previous answer for this question if re-attempting
  progress.questions = progress.questions.filter(q => q.id !== id)
  progress.questions.push(entry)

  // ── Recompute diagnostic profile ──────────────────────
  const answered = progress.questions
  const wrong = answered.filter(q => !q.correct)
  const wrongConfident = wrong.filter(q => q.confidence === 'got_it')
  const fastWrong = wrong.filter(q => q.timeMs < 8000)

  progress.profile.overconfidenceIndex =
    wrong.length > 0 ? wrongConfident.length / wrong.length : 0

  progress.profile.system1Vulnerability =
    wrong.length > 0 ? fastWrong.length / wrong.length : 0

  // Track unique misconceptions detected
  const detected = answered
    .filter(q => !q.correct && q.misconception)
    .map(q => q.misconception)
  progress.profile.misconceptionsDetected = [...new Set(detected)]

  // Calibration: proportion where confidence matched outcome
  const calibrated = answered.filter(q =>
    (q.correct && q.confidence === 'got_it') ||
    (!q.correct && q.confidence === 'guessed')
  )
  progress.profile.calibrationScore =
    answered.length > 0 ? calibrated.length / answered.length : 0

  saveProgress(slug, progress)
  return progress
}

// ── Record level score and unlock next level if >= 70% ────
export function recordLevelScore(slug, level, score) {
  const progress = loadProgress(slug) || initProgress(slug)
  progress.levelScores[level] = score

  if (score >= 0.7) {
    if (level < 3 && !progress.levelsUnlocked.includes(level + 1)) {
      progress.levelsUnlocked.push(level + 1)
    }
  }

  saveProgress(slug, progress)
  return progress
}

// ── Record boss battle result and award badge ─────────────
export function recordBossResult(slug, passed) {
  const progress = loadProgress(slug) || initProgress(slug)
  progress.badgeEarned = passed
  progress.completedAt = Date.now()
  saveProgress(slug, progress)
  return progress
}

// ── Check if a level is unlocked ──────────────────────────
export function isLevelUnlocked(slug, level) {
  const progress = loadProgress(slug)
  if (!progress) return level === 1
  return progress.levelsUnlocked.includes(level)
}

// ── Record a single blitz answer ──────────────────────────
export function recordBlitzAnswer(slug, {
  id, statement, correct, timeMs
}) {
  const progress = loadProgress(slug) || initProgress(slug)

  if (!progress.blitz) progress.blitz = []

  // Remove previous attempt for this statement if re-attempting
  progress.blitz = progress.blitz.filter(b => b.id !== id)

  progress.blitz.push({
    id,
    statement,
    correct,
    timeMs,
    lastSeen: Date.now()
  })

  saveProgress(slug, progress)
  return progress
}

// ── Record a single boss answer ───────────────────────────
export function recordBossAnswer(slug, {
  id, correct, timeMs
}) {
  const progress = loadProgress(slug) || initProgress(slug)

  if (!progress.boss) progress.boss = []

  progress.boss = progress.boss.filter(b => b.id !== id)

  progress.boss.push({
    id,
    correct,
    timeMs,
    // Fast + wrong in Boss = strongest possible System 1 signal
    // No confidence tap in Boss so we use time as proxy
    system1Trap: !correct && timeMs < 6000,
    lastSeen: Date.now()
  })

  saveProgress(slug, progress)
  return progress
}

// ── Get score for a specific level ────────────────────────
export function getLevelScore(slug, level) {
  const progress = loadProgress(slug)
  if (!progress) return null
  return progress.levelScores[level]
}