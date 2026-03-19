import Fuse from 'fuse.js'
import { courses } from '../data/courses'

// ── Synonyms — STEM-specific expansions ──────────────────────────────────────
// Left side: what users type. Right side: what we search for.
const SYNONYMS = {
    // Physics abbreviations
    'qm': 'quantum mechanics',
    'em': 'electromagnetism',
    'thermo': 'thermodynamics',
    'stat mech': 'statistical mechanics',
    'gr': 'general relativity',
    'sr': 'special relativity',
    'cm': 'classical mechanics',
    'e&m': 'electromagnetism',
    'e and m': 'electromagnetism',

    // Physics concepts
    'gravity': 'gravitation',
    'gravity waves': 'gravitational waves',
    'grav waves': 'gravitational waves',
    'light speed': 'speed of light',
    'speed of light': 'special relativity',
    'e=mc2': 'special relativity',
    'emc2': 'special relativity',
    'f=ma': 'newtons laws',
    'fma': 'newtons laws',
    'newton': 'newtons laws',
    'newtons': 'newtons laws',
    'ohm': 'dc circuits',
    'ohms law': 'dc circuits',
    'kirchhoff': 'dc circuits',
    'faraday': 'electromagnetic induction',
    'maxwell': 'maxwells equations',
    'lorentz': 'magnetism',
    'schrodinger': 'quantum mechanics',
    'heisenberg': 'quantum mechanics',
    'planck': 'quantum mechanics',
    'boltzmann': 'statistical mechanics',
    'carnot': 'thermodynamics',
    'kepler': 'gravitation',
    'archimedes': 'fluids',
    'bernoulli': 'fluids',
    'doppler': 'waves sound',
    'snell': 'geometric optics',
    'bragg': 'wave optics',
    'bohr': 'atomic structure',
    'rutherford': 'atomic structure',
    'coulomb': 'electrostatics',
    'gauss': 'electrostatics',
    'ampere': 'magnetism',
    'lenz': 'electromagnetic induction',
    'pauli': 'quantum mechanics',
    'fermi': 'quantum statistics',
    'bose': 'quantum statistics',
    'higgs': 'particle physics',
    'dirac': 'quantum mechanics',

    // Math abbreviations
    'calc': 'calculus',
    'diffeq': 'differential equations',
    'ode': 'differential equations',
    'odes': 'differential equations',
    'pde': 'differential equations',
    'pdes': 'differential equations',
    'linalg': 'linear algebra',
    'lin alg': 'linear algebra',
    'prob': 'probability',
    'stats': 'statistics',
    'stat': 'statistics',
    'trig': 'trigonometry',
    'geo': 'geometry',
    'alg': 'algebra',
    'analysis': 'real analysis',
    'fourier': 'fourier analysis',
    'fft': 'fourier analysis',
    'dft': 'fourier analysis',
    'set': 'set theory',
    'sets': 'set theory',
    'combinatorics': 'combinatorics',
    'combo': 'combinatorics',
    'graph': 'graph theory',
    'graphs': 'graph theory',
    'number theory': 'number theory',
    'nt': 'number theory',
    'info theory': 'information theory',
    'bayes': 'bayes theorem',
    'bayesian': 'bayes theorem',
    'nash': 'game theory',
    'chaos': 'dynamical systems chaos',
    'fractals': 'dynamical systems chaos',
    'lorenz': 'dynamical systems chaos',
    'abstract alg': 'abstract algebra',
    'group theory': 'abstract algebra',
    'complex analysis': 'complex analysis',
    'complex numbers': 'complex analysis',
    'imaginary numbers': 'complex analysis',
    'taylor': 'multivariable calculus series',
    'taylor series': 'multivariable calculus series',
    'maclaurin': 'multivariable calculus series',
    'eigen': 'linear algebra',
    'eigenvalues': 'linear algebra',
    'matrices': 'linear algebra',
    'matrix': 'linear algebra',
    'vectors': 'linear algebra',
    'gradient': 'multivariable calculus series',
    'partial derivatives': 'multivariable calculus series',

    // Biology abbreviations
    'bio': 'biology',
    'mol bio': 'molecular genetics',
    'molecular biology': 'dna genetic code',
    'genetics': 'mendelian genetics',
    'gen': 'mendelian genetics',
    'evo': 'natural selection',
    'evolution': 'natural selection',
    'cell bio': 'cell structure',
    'micro': 'bacteria viruses',
    'microbio': 'bacteria viruses',
    'biochem': 'protein synthesis',
    'eco': 'ecosystems',
    'ecology': 'ecosystems energy flow',
    'dna': 'dna genetic code',
    'rna': 'dna genetic code',
    'mrna': 'protein synthesis',
    'pcr': 'dna genetic code',
    'crispr': 'molecular genetics',
    'stem cells': 'development stem cells',
    'mitosis': 'cell division',
    'meiosis': 'cell division',
    'mendel': 'mendelian genetics',
    'darwin': 'natural selection',
    'photosynthesis': 'photosynthesis',
    'atp': 'digestion metabolism',
    'immune': 'immune system',
    'immunity': 'immune system',
    'vaccine': 'immune system',
    'vaccines': 'immune system',
    'hormone': 'endocrine system',
    'hormones': 'endocrine system',
    'insulin': 'endocrine system',
    'diabetes': 'endocrine system',
    'cancer': 'cell division',
    'neuron': 'neuron action potential',
    'neurons': 'neuron action potential',
    'synapse': 'synaptic transmission',
    'dopamine': 'synaptic transmission',
    'serotonin': 'synaptic transmission',
    'brain': 'brain anatomy',
    'memory': 'learning memory',
    'sleep': 'sleep consciousness',
    'addiction': 'drugs addiction',
    'alzheimer': 'neurological disorders',
    'parkinson': 'neurological disorders',

    // Chemistry abbreviations
    'chem': 'chemistry',
    'ochem': 'organic chemistry',
    'orgo': 'organic chemistry',
    'organic chem': 'organic chemistry',
    'pchem': 'thermochemistry',
    'physical chem': 'thermochemistry',
    'inorganic': 'periodic table',
    'analytical': 'stoichiometry',
    'quantum chem': 'atomic structure quantum',
    'periodic table': 'periodic table trends',
    'bonding': 'chemical bonding',
    'bonds': 'chemical bonding',
    'ionic': 'chemical bonding',
    'covalent': 'chemical bonding',
    'equilibrium': 'chemical equilibrium',
    'kinetics': 'chemical kinetics',
    'thermo chem': 'thermochemistry',
    'enthalpy': 'thermochemistry',
    'entropy chem': 'thermochemistry',
    'gibbs': 'thermochemistry',
    'redox': 'electrochemistry',
    'oxidation': 'electrochemistry',
    'reduction': 'electrochemistry',
    'battery': 'electrochemistry',
    'batteries': 'electrochemistry',
    'acid': 'acid base chemistry',
    'acids': 'acid base chemistry',
    'base': 'acid base chemistry',
    'bases': 'acid base chemistry',
    'ph': 'acid base chemistry',
    'buffer': 'acid base chemistry',
    'nuclear': 'nuclear chemistry',
    'fission': 'nuclear chemistry',
    'fusion': 'nuclear chemistry',
    'radioactive': 'nuclear chemistry',
    'radioactivity': 'nuclear chemistry',

    // Computer science abbreviations
    'cs': 'computer science',
    'compsci': 'computer science',
    'algo': 'algorithms',
    'algos': 'algorithms',
    'dsa': 'data structures',
    'ds': 'data structures',
    'os': 'operating systems',
    'networking': 'computer networks',
    'networks': 'computer networks',
    'net': 'computer networks',
    'db': 'databases',
    'sql': 'databases',
    'nosql': 'databases',
    'crypto': 'cryptography security',
    'security': 'cryptography security',
    'encryption': 'cryptography security',
    'ml': 'machine learning',
    'dl': 'machine learning',
    'deep learning': 'machine learning',
    'nn': 'machine learning',
    'neural net': 'machine learning',
    'neural networks': 'machine learning',
    'ai': 'artificial intelligence',
    'llm': 'machine learning',
    'llms': 'machine learning',
    'gpt': 'machine learning',
    'transformer': 'machine learning',
    'transformers': 'machine learning',
    'backprop': 'machine learning',
    'gradient descent': 'machine learning',
    'big o': 'algorithms complexity',
    'bigo': 'algorithms complexity',
    'complexity': 'algorithms complexity',
    'p vs np': 'algorithms complexity',
    'turing': 'theory of computation',
    'automata': 'theory of computation',
    'cpu': 'computer architecture',
    'processor': 'computer architecture',
    'gpu': 'computer graphics',
    'graphics': 'computer graphics',
    'ray tracing': 'computer graphics',
    'oop': 'programming paradigms',
    'functional': 'programming paradigms',
    'paradigm': 'programming paradigms',

    // Neuroscience
    'neuro': 'neuroscience',
    'cog sci': 'cognitive neuroscience',
    'cognitive science': 'cognitive neuroscience',
    'cognitive': 'cognitive neuroscience',
    'plasticity': 'neuroplasticity',
    'ltp': 'learning memory',
    'action potential': 'neuron action potential',

    // Earth and Space
    'astro': 'stellar physics',
    'astronomy': 'stellar physics',
    'astrophysics': 'stellar physics',
    'cosmology': 'cosmology',
    'dark matter': 'cosmology dark matter',
    'dark energy': 'cosmology dark matter',
    'black hole': 'stellar physics',
    'black holes': 'stellar physics',
    'galaxy': 'galaxies',
    'galaxies': 'galaxies',
    'milky way': 'galaxies',
    'solar system': 'solar system',
    'planets': 'solar system',
    'stars': 'stellar physics',
    'big bang': 'cosmology',
    'universe': 'cosmology',
    'climate': 'climate science',
    'global warming': 'climate science',
    'greenhouse': 'climate science',
    'tectonic': 'plate tectonics',
    'tectonics': 'plate tectonics',
    'earthquake': 'plate tectonics',
    'volcano': 'plate tectonics',
    'ocean': 'oceanography',
    'atmosphere': 'atmospheric science',
    'weather': 'atmospheric science',
    'astrobio': 'astrobiology',
    'aliens': 'astrobiology',
    'extraterrestrial': 'astrobiology',
    'exoplanet': 'astrobiology',
    'gravitational waves': 'gravitational waves',
    'ligo': 'gravitational waves',

    // Engineering
    'eng': 'engineering',
    'mech eng': 'structural engineering',
    'civil eng': 'civil engineering',
    'elec eng': 'electrical engineering',
    'aero': 'aerospace engineering',
    'aerospace': 'aerospace engineering',
    'robots': 'robotics',
    'robotics': 'robotics mechatronics',
    'biomedical': 'biomedical engineering',
    'materials': 'materials science',
    'control': 'control systems',
    'pid': 'control systems',
    'fluid': 'fluid engineering',
    'fluids': 'fluid engineering',
    'thermodynamic eng': 'thermodynamic engineering',
    'heat engine': 'thermodynamic engineering',
    'turbine': 'thermodynamic engineering',

    // General STEM
    'quantum': 'quantum mechanics',
    'relativity': 'special relativity',
    'mechanics': 'classical mechanics',
    'optics': 'geometric optics',
    'waves': 'mechanical waves sound',
    'sound': 'mechanical waves sound',
    'light': 'wave optics',
    'electricity': 'electrostatics',
    'electric': 'electrostatics',
    'magnetic': 'magnetism',
    'magnetism': 'magnetism',
    'circuit': 'dc circuits',
    'circuits': 'dc circuits',
    'nuclear physics': 'atomic nuclear structure',
    'particle': 'particle physics',
    'particles': 'particle physics',
    'standard model': 'particle physics',
    'string theory': 'general relativity',
    'spacetime': 'special relativity',
    'wavefunction': 'quantum mechanics',
    'superposition': 'quantum mechanics',
    'entanglement': 'quantum mechanics',
}

// ── Stop words — stripped before any search ──────────────────────────────────
const STOP_WORDS = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
    'why', 'what', 'how', 'when', 'where', 'who', 'which', 'whose',
    'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'into',
    'through', 'about', 'and', 'or', 'but', 'so', 'yet', 'nor',
    'i', 'me', 'my', 'we', 'us', 'our', 'you', 'your', 'it', 'its',
    'this', 'that', 'these', 'those', 'there', 'here',
    'not', 'no', 'never', 'always', 'just', 'very', 'really', 'quite',
    'happen', 'make', 'go', 'get', 'come', 'give', 'explain',
    'tell', 'show', 'help', 'understand', 'learn', 'know', 'mean', 'means',
])

function expandSynonyms(query) {
    // Try full query first
    if (SYNONYMS[query]) return SYNONYMS[query]
    // Try word-by-word
    return query.split(' ')
        .map(word => SYNONYMS[word] || word)
        .join(' ')
}

function cleanQuery(raw) {
    const expanded = expandSynonyms(raw.toLowerCase().trim())
    return expanded
        .split(/\s+/)
        .filter(word => !STOP_WORDS.has(word) && word.length > 1)
        .join(' ')
}

// ── Search history ───────────────────────────────────────────────────────────
const HISTORY_KEY = 'sf_search_history'

export function getSearchHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    } catch {
        return []
    }
}

export function saveSearchHistory(rawQuery) {
    if (!rawQuery.trim() || rawQuery.trim().length < 2) return
    const history = getSearchHistory()
    const updated = [rawQuery.trim(), ...history.filter(q => q !== rawQuery.trim())].slice(0, 6)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
}

export function clearSearchHistory() {
    localStorage.removeItem(HISTORY_KEY)
}

// ── Alias index built from all course tags.aliases ───────────────────────────
const aliasIndex = {}
for (const course of courses) {
    for (const alias of (course.tags?.aliases || [])) {
        const key = alias.toLowerCase().trim()
        if (!aliasIndex[key]) aliasIndex[key] = []
        aliasIndex[key].push(course.slug)
    }
}

// ── Fuse instances ───────────────────────────────────────────────────────────
const fuseTitles = new Fuse(courses, {
    keys: [
        { name: 'titleDisplay', weight: 0.35 },
        { name: 'titleFormal', weight: 0.30 },
        { name: 'tags.concept', weight: 0.25 },
        { name: 'tagline', weight: 0.10 },
    ],
    threshold: 0.40,
    includeScore: true,
})

const fuseMisconceptions = new Fuse(courses, {
    keys: [
        { name: 'tags.misconceptions', weight: 0.7 },
        { name: 'tags.aliases', weight: 0.3 },
    ],
    threshold: 0.40,
    includeScore: true,
})

const TIER1_CUTOFF = 0.22

function splitTiers(fuseResults, excludeSlugs = new Set()) {
    const filtered = fuseResults.filter(r => !excludeSlugs.has(r.item.slug))
    const tier1 = filtered.filter(r => r.score <= TIER1_CUTOFF).map(r => r.item)
    const tier2 = filtered.filter(r => r.score > TIER1_CUTOFF).slice(0, 6).map(r => r.item)
    return { tier1, tier2 }
}

// ── Exact concept tag match ──────────────────────────────────────────────────
function exactTagMatch(cleaned) {
    const asTag = cleaned.replace(/\s+/g, '-')
    const asWords = cleaned
    return courses.filter(c =>
        c.tags?.concept?.some(tag =>
            tag === asTag ||
            tag.replace(/-/g, ' ') === asWords
        )
    )
}

// ── "Did you mean?" — find closest alias ────────────────────────────────────
const allAliases = Object.keys(aliasIndex)
const fuseAliases = new Fuse(allAliases, { threshold: 0.35, includeScore: true })

export function didYouMean(rawQuery) {
    const cleaned = rawQuery.toLowerCase().trim()
    const results = fuseAliases.search(cleaned)
    if (!results.length || results[0].score > 0.30) return null
    if (results[0].item === cleaned) return null
    return results[0].item
}

// ── Keyword fallback ─────────────────────────────────────────────────────────
function keywordFallback(cleanedQuery) {
    const words = cleanedQuery.split(/\s+/).filter(w => w.length > 2)
    if (!words.length) return { tier1: [], tier2: [] }

    const scoreMap = {}
    for (const word of words) {
        const hits = fuseTitles.search(word)
        for (const hit of hits) {
            const slug = hit.item.slug
            if (scoreMap[slug] === undefined || hit.score < scoreMap[slug]) {
                scoreMap[slug] = hit.score
            }
        }
    }

    const sorted = Object.entries(scoreMap)
        .sort(([, a], [, b]) => a - b)
        .slice(0, 8)

    const tier1 = sorted
        .filter(([, s]) => s <= TIER1_CUTOFF)
        .map(([slug]) => courses.find(c => c.slug === slug))
        .filter(Boolean)

    const tier2 = sorted
        .filter(([, s]) => s > TIER1_CUTOFF)
        .slice(0, 5)
        .map(([slug]) => courses.find(c => c.slug === slug))
        .filter(Boolean)

    return { tier1, tier2 }
}

// ── Matched terms — for highlighting ────────────────────────────────────────
// Returns which concept tags from a course match the current query
export function getMatchedTags(course, cleanedQuery) {
    if (!cleanedQuery || !course.tags?.concept) return []
    const queryWords = cleanedQuery.split(/\s+/)
    return course.tags.concept.filter(tag => {
        const tagWords = tag.replace(/-/g, ' ')
        return queryWords.some(word =>
            tagWords.includes(word) || word.includes(tagWords)
        )
    })
}

// ── Main export ──────────────────────────────────────────────────────────────
export function searchCourses(rawQuery, domainFilter = null) {
    if (!rawQuery.trim()) return { tier1: [], tier2: [], cleanedQuery: '' }

    const cleaned = cleanQuery(rawQuery)
    if (!cleaned) return { tier1: [], tier2: [], cleanedQuery: '' }

    let tier1 = []
    let tier2 = []

    // ── Layer 0: exact concept tag match → guaranteed tier 1 ────────────────
    const exactMatches = exactTagMatch(cleaned)
    const exactSlugs = new Set(exactMatches.map(c => c.slug))
    if (exactMatches.length) tier1.push(...exactMatches)

    // ── Layer 1: alias exact match ───────────────────────────────────────────
    const aliasSlugs =
        aliasIndex[cleaned] ||
        aliasIndex[rawQuery.toLowerCase().trim()] ||
        aliasIndex[expandSynonyms(rawQuery.toLowerCase().trim())]

    if (aliasSlugs?.length) {
        const aliasMatches = aliasSlugs
            .map(slug => courses.find(c => c.slug === slug))
            .filter(c => c && !exactSlugs.has(c.slug))
        tier1.push(...aliasMatches)
        aliasMatches.forEach(c => exactSlugs.add(c.slug))
    }

    // ── Layer 2: fuzzy on titles + concept tags ──────────────────────────────
    const fuzzyResults = fuseTitles.search(cleaned)
    if (fuzzyResults.length) {
        const { tier1: ft1, tier2: ft2 } = splitTiers(fuzzyResults, exactSlugs)
        ft1.forEach(c => { if (!exactSlugs.has(c.slug)) { tier1.push(c); exactSlugs.add(c.slug) } })
        tier2.push(...ft2.filter(c => !exactSlugs.has(c.slug)))
    }

    // ── Layer 3: misconception catch ─────────────────────────────────────────
    if (!tier1.length && !tier2.length) {
        const miscResults = fuseMisconceptions.search(cleaned)
        const { tier1: mt1, tier2: mt2 } = splitTiers(miscResults, exactSlugs)
        tier1.push(...mt1)
        tier2.push(...mt2)
    }

    // ── Layer 4: keyword fallback ────────────────────────────────────────────
    if (!tier1.length && !tier2.length) {
        const fallback = keywordFallback(cleaned)
        tier1.push(...fallback.tier1)
        tier2.push(...fallback.tier2)
    }

    // ── Domain filter (applied after all layers) ─────────────────────────────
    if (domainFilter) {
        tier1 = tier1.filter(c => c.domain === domainFilter)
        tier2 = tier2.filter(c => c.domain === domainFilter)
    }

    return { tier1, tier2, cleanedQuery: cleaned }
}