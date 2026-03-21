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

// ── Favorites ─────────────────────────────────────────────
const FAVORITES_KEY = 'sf_favorites'

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || { courses: [], questions: [] }
  } catch { return { courses: [], questions: [] } }
}

function saveFavorites(data) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(data))
}

export function getFavorites() {
  return loadFavorites()
}

export function isCourseFavorited(slug) {
  return loadFavorites().courses.some(c => c.slug === slug)
}

export function toggleCourseFavorite(slug) {
  const favs = loadFavorites()
  const exists = favs.courses.some(c => c.slug === slug)
  if (exists) {
    favs.courses = favs.courses.filter(c => c.slug !== slug)
  } else {
    favs.courses.push({ slug, savedAt: Date.now() })
  }
  saveFavorites(favs)
  return !exists // returns new state: true = now favorited
}

export function isQuestionFavorited(courseSlug, questionId) {
  return loadFavorites().questions.some(
    q => q.courseSlug === courseSlug && q.questionId === questionId
  )
}

export function toggleQuestionFavorite({ courseSlug, questionId, questionText, courseTitle }) {
  const favs = loadFavorites()
  const exists = favs.questions.some(
    q => q.courseSlug === courseSlug && q.questionId === questionId
  )
  if (exists) {
    favs.questions = favs.questions.filter(
      q => !(q.courseSlug === courseSlug && q.questionId === questionId)
    )
  } else {
    favs.questions.push({ courseSlug, questionId, questionText, courseTitle, savedAt: Date.now() })
  }
  saveFavorites(favs)
  return !exists
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

// ── Get all course progress (for My Learning screen) ─────
export function getAllProgress() {
  const all = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k.startsWith('sf_course_')) {
      try {
        const data = JSON.parse(localStorage.getItem(k))
        if (data?.course) all.push(data)
      } catch { }
    }
  }
  return all
}

// ── Compute resume route for a course ────────────────────
export function getResumeRoute(slug, domain, topic) {
  const p = loadProgress(slug)
  const base = `/${domain}/${topic}/${slug}`
  if (!p) return `${base}/story`

  // Boss done
  if (p.completedAt) return `${base}/result`

  // All 3 levels scored, go to boss
  if (p.levelScores[3] !== null) return `${base}/boss`

  // Level 3 unlocked
  if (p.levelsUnlocked.includes(3) && p.levelScores[3] === null) return `${base}/quiz/level-3`

  // Blitz done = blitz array has 10+ entries
  const blitzDone = (p.blitz || []).length >= 10

  // Level 2 unlocked
  if (p.levelsUnlocked.includes(2)) {
    if (p.levelScores[2] === null) return `${base}/quiz/level-2`
  }

  // Level 1 scored, blitz not done
  if (p.levelScores[1] !== null && !blitzDone) return `${base}/blitz`

  // Level 1 in progress or not started
  if (p.levelScores[1] === null) return `${base}/quiz/level-1`

  return `${base}/story`
}

// ── Cross-course aggregate profile ────────────────────────
export function getAggregateProfile() {
  const allProgress = getAllProgress()
  const completed = allProgress.filter(p => (p.questions || []).length > 0)

  const allQuestions = completed.flatMap(p => p.questions || [])
  const totalCourses = completed.length

  if (allQuestions.length === 0) return { totalCourses: 0, totalQuestions: 0 }

  const wrong = allQuestions.filter(q => !q.correct)
  const knewIt = q => q.confidence === 'knew_it' || q.confidence === 'got_it'

  const overconfidenceIndex = wrong.length > 0
    ? wrong.filter(q => knewIt(q)).length / wrong.length : 0

  const system1Vulnerability = wrong.length > 0
    ? wrong.filter(q => q.system1Trap).length / wrong.length : 0

  const calibrated = allQuestions.filter(q =>
    (q.correct && knewIt(q)) || (!q.correct && q.confidence === 'guessed')
  )
  const calibrationScore = allQuestions.length > 0
    ? calibrated.length / allQuestions.length : 0

  const anchorQs = allQuestions.filter(q =>
    q.anchorSusceptible !== null && q.anchorSusceptible !== undefined
  )
  const anchorSusceptible = anchorQs.length > 0
    ? anchorQs.filter(q => q.anchorSusceptible).length / anchorQs.length : null

  const misconceptions = [...new Set(
    allQuestions.filter(q => !q.correct && q.misconceptionTag).map(q => q.misconceptionTag)
  )]

  const conceptMastery = {}
  allQuestions.forEach(q => {
    (q.conceptTags || []).forEach(tag => {
      if (!conceptMastery[tag]) conceptMastery[tag] = { correct: 0, total: 0 }
      conceptMastery[tag].total++
      if (q.correct) conceptMastery[tag].correct++
    })
  })

  const FAST = 8000
  const quadrant = {
    fastCorrect: allQuestions.filter(q => q.timeMs < FAST && q.correct).length,
    fastWrong: allQuestions.filter(q => q.timeMs < FAST && !q.correct).length,
    slowCorrect: allQuestions.filter(q => q.timeMs >= FAST && q.correct).length,
    slowWrong: allQuestions.filter(q => q.timeMs >= FAST && !q.correct).length,
  }

  const crtQs = allQuestions.filter(q => q.type === 'crt')
  const crtScore = crtQs.length > 0
    ? crtQs.filter(q => q.correct).length / crtQs.length : null

  return {
    totalCourses,
    totalQuestions: allQuestions.length,
    overconfidenceIndex,
    system1Vulnerability,
    calibrationScore,
    anchorSusceptible,
    anchorTotal: anchorQs.length,
    misconceptions,
    conceptMastery,
    quadrant,
    crtScore,
    crtTotal: crtQs.length,
  }
}

// ── Activity log (for Learning Pulse) ─────────────────────
const ACTIVITY_KEY = 'sf_activity'

export function logActivity() {
  const today = new Date().toISOString().slice(0, 10) // "2026-03-20"
  try {
    const log = JSON.parse(localStorage.getItem(ACTIVITY_KEY)) || {}
    log[today] = (log[today] || 0) + 1
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(log))
  } catch { }
}

export function getActivityLog() {
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_KEY)) || {}
  } catch { return {} }
}

// ── Insight Score ─────────────────────────────────────────
export function computeInsightScore(allProgress) {
  let score = 0
  allProgress.forEach(p => {
    (p.questions || []).forEach(q => {
      const diff = q.difficultyEstimate || 3
      const knewIt = q.confidence === 'knew_it' || q.confidence === 'got_it'
      const guessed = q.confidence === 'guessed'

      if (q.correct && knewIt) score += diff * 10   // high insight
      else if (q.correct && !guessed) score += diff * 6    // solid
      else if (q.correct && guessed) score += diff * 2    // lucky
      else if (!q.correct && knewIt) score -= diff * 4    // overconfident — penalty
      else if (!q.correct) score += 1           // honest gap, minimal credit
    })
      ; (p.boss || []).forEach(q => {
        if (q.correct) score += 15   // boss questions always hard
        else score -= 2
      })
  })
  return Math.max(0, score) // never negative overall
}

// ── Achievements ──────────────────────────────────────────
export function computeAchievements(allProgress) {
  const achievements = []
  const allQuestions = allProgress.flatMap(p => p.questions || [])
  const knewIt = q => q.confidence === 'knew_it' || q.confidence === 'got_it'

  // Boss Slayer — passed any boss battle
  const bossSlayer = allProgress.some(p => p.badgeEarned)
  if (bossSlayer) achievements.push({
    id: 'boss-slayer',
    emoji: '⚔️',
    title: 'Boss Slayer',
    description: 'Defeated a Boss Battle.',
  })

  // FREAK — completed 5 courses
  const completed = allProgress.filter(p => p.completedAt).length
  if (completed >= 5) achievements.push({
    id: 'freak',
    emoji: '🧬',
    title: 'FREAK',
    description: 'Completed 5 courses. You are the anomaly.',
  })

  // Ghost Buster — correct on a misconception_probe
  const ghostBuster = allQuestions.some(q => q.type === 'misconception_probe' && q.correct)
  if (ghostBuster) achievements.push({
    id: 'ghost-buster',
    emoji: '👻',
    title: 'Ghost Buster',
    description: 'Caught a common misconception before it caught you.',
  })

  // System 1 Slayer — correct on CRT + Knew it
  const sys1Slayer = allQuestions.some(
    q => q.type === 'crt' && q.correct && knewIt(q)
  )
  if (sys1Slayer) achievements.push({
    id: 'system1-slayer',
    emoji: '🪞',
    title: 'System 1 Slayer',
    description: 'Answered a cognitive trap correctly — and knew it.',
  })

  // Myth Busted — correct on misconception_probe for a tag
  // you previously got wrong
  const wrongMisconTags = new Set(
    allQuestions
      .filter(q => !q.correct && q.misconceptionTag)
      .map(q => q.misconceptionTag)
  )
  const mythBusted = allQuestions.some(
    q => q.correct && q.misconceptionTag && wrongMisconTags.has(q.misconceptionTag)
  )
  if (mythBusted) achievements.push({
    id: 'myth-busted',
    emoji: '💥',
    title: 'Myth Busted',
    description: 'Overcame a misconception you previously fell for.',
  })

  // You Caught Yourself — wrong + knew_it, then correct on same question later
  const overconfidentIds = new Set(
    allQuestions
      .filter(q => !q.correct && knewIt(q))
      .map(q => `${q.id}`)
  )
  const caughtYourself = allQuestions.some(
    q => q.correct && overconfidentIds.has(`${q.id}`)
  )
  if (caughtYourself) achievements.push({
    id: 'caught-yourself',
    emoji: '🎯',
    title: 'You Caught Yourself',
    description: 'Got a question wrong confidently — then came back and nailed it.',
  })

  // Calibration Achieved — calibration score >= 75% with 20+ questions
  const wellCalibrated = allProgress.some(p => {
    const qs = p.questions || []
    if (qs.length < 20) return false
    const calibrated = qs.filter(q =>
      (q.correct && knewIt(q)) || (!q.correct && q.confidence === 'guessed')
    )
    return calibrated.length / qs.length >= 0.75
  })
  if (wellCalibrated) achievements.push({
    id: 'calibration-achieved',
    emoji: '🎯',
    title: 'Calibration Achieved',
    description: 'Your confidence matched your correctness 75%+ of the time.',
  })

  return achievements
}