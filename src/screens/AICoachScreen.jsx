import { useState, useEffect, useRef } from 'react'
import { buildCoachContext } from '../utils/storage'
import { courses } from '../data/courses'

const API_KEY = 'YOUR_API_KEY_HERE' // replace before going live
const MODEL = 'claude-sonnet-4-20250514'

function buildSystemPrompt(ctx) {
    if (!ctx) return `You are the ScientificFREAK AI Coach — a sharp, precise learning coach built into a science education app. 

The user hasn't completed enough courses yet for you to have diagnostic data. Your job right now is to warmly introduce yourself, explain what you'll be able to do once they have data (identify their misconceptions, overconfidence patterns, System 1 traps, weakest concepts), and encourage them to complete at least 2-3 courses. Be specific about what insights await them. Keep it short, compelling, and honest. Don't be generic.`

    const courseNames = (slugs) => slugs
        .map(s => courses.find(c => c.slug === s)?.titleDisplay || s)
        .join(', ')

    return `You are the ScientificFREAK AI Coach — a sharp, precise, Kahneman-informed learning coach.

You have full access to this user's cognitive diagnostic data from their quiz performance. Use it specifically and precisely. Never be generic.

## User's Cognitive Profile

**Questions answered:** ${ctx.totalQuestions}
**Insight Score:** ${ctx.insightScore}
**Calibration Score:** ${ctx.calibrationScore}% (how well confidence matched correctness)
**Overconfidence Index:** ${ctx.overconfidenceIndex}% (wrong answers where they said "Knew it")
**System 1 Vulnerability:** ${ctx.system1Vulnerability}% (fast wrong answers)

## Course Progress
**Completed:** ${ctx.completedCourses.length > 0 ? courseNames(ctx.completedCourses) : 'None yet'}
**In Progress:** ${ctx.inProgressCourses.length > 0 ? courseNames(ctx.inProgressCourses) : 'None'}

## Misconceptions Detected
${ctx.misconceptions.length > 0
            ? ctx.misconceptions.map(m => `- ${m.replace(/-/g, ' ')}`).join('\n')
            : 'None detected yet'}

## Weakest Concepts (by accuracy)
${ctx.weakConcepts.length > 0
            ? ctx.weakConcepts.map(c => `- ${c.tag.replace(/-/g, ' ')}: ${c.pct}% correct`).join('\n')
            : 'Not enough data yet'}

## Overconfident Mistakes (wrong + "Knew it")
${ctx.overconfidentExamples.length > 0
            ? ctx.overconfidentExamples.map(e => `- ${e.replace(/-/g, ' ')}`).join('\n')
            : 'None yet'}

## Your Behavior Rules
- Be sharp and specific. Reference actual data points from above, not generic advice.
- Lead with the most surprising or actionable insight from their data.
- You understand Kahneman's System 1/System 2 distinction deeply — use it naturally.
- You know the science content (physics, math, biology, chemistry, CS, neuroscience) at PhD level.
- Be conversational but precise. Never waffle. Max 3 sentences per response unless they ask for more.
- If they ask about a concept, teach it in ELI12 style then connect it to their specific gap.
- Never say "Great question!" or use filler phrases. Just answer.
- You can see their data but treat it as a shared conversation, not a lecture.`
}

function buildOpeningPrompt(ctx) {
    if (!ctx) {
        return `Introduce yourself as the ScientificFREAK AI Coach. Explain what you'll unlock once the user completes more courses — be specific about the kinds of insights (misconceptions, overconfidence, System 1 traps). Tell them what you need from them. Keep it under 4 sentences. Be compelling, not generic.`
    }

    const topWeakness = ctx.weakConcepts[0]?.tag?.replace(/-/g, ' ')
    const topMisconception = ctx.misconceptions[0]?.replace(/-/g, ' ')
    const isOverconfident = ctx.overconfidenceIndex > 30

    return `Generate a single opening message to hook this user immediately. 

Rules:
- Start with ONE specific surprising insight from their data — the most striking one.
- Reference their actual numbers or concept names, not generic descriptions.
- End with one specific question that invites them to go deeper.
- Max 3 sentences total. No filler. No "Hi I'm your coach" opener — just dive in.

Their most striking data points to choose from:
${topWeakness ? `- Weakest concept: "${topWeakness}"` : ''}
${topMisconception ? `- Detected misconception: "${topMisconception}"` : ''}
${isOverconfident ? `- Overconfidence index: ${ctx.overconfidenceIndex}% (they say "Knew it" on ${ctx.overconfidenceIndex}% of wrong answers)` : ''}
- Calibration: ${ctx.calibrationScore}%
- System 1 vulnerability: ${ctx.system1Vulnerability}%

Pick the most striking one and lead with it.`
}

// ── Message bubble ────────────────────────────────────────
function MessageBubble({ role, content }) {
    const isUser = role === 'user'
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            {!isUser && (
                <div className="w-7 h-7 rounded-full bg-blue-950 border border-blue-800
                        flex items-center justify-center text-xs mr-2 shrink-0 mt-0.5">
                    ⚡
                </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isUser
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-tl-sm'}`}>
                {content}
            </div>
        </div>
    )
}

// ── Typing indicator ──────────────────────────────────────
function TypingIndicator() {
    return (
        <div className="flex justify-start mb-4">
            <div className="w-7 h-7 rounded-full bg-blue-950 border border-blue-800
                      flex items-center justify-center text-xs mr-2 shrink-0 mt-0.5">
                ⚡
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map(i => (
                        <div key={i}
                            className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"
                            style={{ animationDelay: `${i * 150}ms` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

// ── Main Screen ───────────────────────────────────────────
export default function AICoachScreen() {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [initializing, setInitializing] = useState(true)
    const bottomRef = useRef(null)
    const inputRef = useRef(null)
    const systemPromptRef = useRef('')

    // Build context once on mount
    useEffect(() => {
        const ctx = buildCoachContext()
        systemPromptRef.current = buildSystemPrompt(ctx)
        generateOpeningMessage(ctx)
    }, [])

    // Auto scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    async function callClaude(userMessages) {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-client-side-api-key-flag': 'true',
            },
            body: JSON.stringify({
                model: MODEL,
                max_tokens: 1024,
                system: systemPromptRef.current,
                messages: userMessages,
            }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error?.message || 'API error')
        return data.content[0].text
    }

    async function generateOpeningMessage(ctx) {
        setInitializing(true)
        try {
            const openingPrompt = buildOpeningPrompt(ctx)
            const reply = await callClaude([{ role: 'user', content: openingPrompt }])
            setMessages([{ role: 'assistant', content: reply }])
        } catch (err) {
            setMessages([{
                role: 'assistant',
                content: "I'm having trouble connecting right now. Check your API key and try again."
            }])
        } finally {
            setInitializing(false)
        }
    }

    async function handleSend() {
        const text = input.trim()
        if (!text || loading) return

        const newMessages = [...messages, { role: 'user', content: text }]
        setMessages(newMessages)
        setInput('')
        setLoading(true)

        try {
            // Send full conversation history (opening message was AI-generated,
            // so we skip it from history to avoid the "user prompt" confusion)
            const historyForAPI = newMessages.filter((_, i) => i > 0 || newMessages[0].role === 'user')
            const reply = await callClaude(historyForAPI)
            setMessages(prev => [...prev, { role: 'assistant', content: reply }])
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Something went wrong. Check your connection and try again."
            }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-screen bg-gray-950 text-white">

            {/* Header */}
            <div className="shrink-0 border-b border-gray-800 px-4 h-14
                      flex items-center justify-between
                      bg-gray-950/95 backdrop-blur-sm">
                <div>
                    <p className="text-white font-bold text-sm">AI Coach</p>
                    <p className="text-gray-500 text-[10px]">Powered by your diagnostic data</p>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    <span className="text-blue-400 text-xs font-medium">Online</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
                {initializing ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-950 border border-blue-800
                            flex items-center justify-center text-xl animate-pulse">
                            ⚡
                        </div>
                        <p className="text-gray-500 text-sm">Analyzing your data...</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, i) => (
                            <MessageBubble key={i} role={msg.role} content={msg.content} />
                        ))}
                        {loading && <TypingIndicator />}
                        <div ref={bottomRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-gray-800 px-4 py-3
                      bg-gray-950 pb-safe">
                <div className="flex gap-2 items-end max-w-2xl mx-auto">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSend()
                            }
                        }}
                        placeholder="Ask about your results, a concept, or your weak areas..."
                        rows={1}
                        className="flex-1 bg-gray-900 border border-gray-800 rounded-xl
                       px-4 py-2.5 text-white text-sm placeholder-gray-600
                       focus:outline-none focus:border-blue-500
                       resize-none transition-colors duration-200
                       max-h-32 overflow-y-auto"
                        style={{ lineHeight: '1.5' }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="shrink-0 w-10 h-10 rounded-xl bg-blue-600
                       hover:bg-blue-500 disabled:bg-gray-800
                       disabled:text-gray-600 text-white
                       flex items-center justify-center
                       transition-all duration-200 active:scale-95"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                        </svg>
                    </button>
                </div>
                <p className="text-gray-700 text-[10px] text-center mt-2">
                    Enter to send · Shift+Enter for new line
                </p>
            </div>

        </div>
    )
}