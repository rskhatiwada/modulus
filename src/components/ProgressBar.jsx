export default function ProgressBar({ current, total, color = "bg-blue-500" }) {
  const percent = Math.round((current / total) * 100)

  return (
    <div className="w-full bg-gray-800 rounded-full h-2">
      <div
        className={`${color} h-2 rounded-full transition-all duration-300`}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}