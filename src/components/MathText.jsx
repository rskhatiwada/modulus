import katex from 'katex'
import 'katex/dist/katex.min.css'

// Renders a string that may contain inline math wrapped in $...$
// Example: "Force is $F = ma$ where m is mass"
export default function MathText({ text, className = '' }) {
  if (!text) return null

  // Split on $...$ pattern
  const parts = text.split(/(\$[^$]+\$)/g)

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const latex = part.slice(1, -1)
          try {
            const html = katex.renderToString(latex, {
              throwOnError: false,
              displayMode: false
            })
            return (
              <span
                key={i}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            )
          } catch {
            return <span key={i}>{part}</span>
          }
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}