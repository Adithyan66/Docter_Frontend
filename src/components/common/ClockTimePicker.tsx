import { useState, useEffect, useRef } from 'react'

type ClockTimePickerProps = {
  value: string
  onChange: (time: string) => void
  label?: string
  required?: boolean
}

export default function ClockTimePicker({
  value,
  onChange,
  label,
  required,
}: ClockTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'hour' | 'minute'>('hour')
  const clockRef = useRef<HTMLDivElement>(null)

  const [hours, minutes] = value ? value.split(':').map(Number) : [9, 0]

  const handleTimeChange = (newHours: number, newMinutes: number) => {
    const formattedTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
    onChange(formattedTime)
  }

  const getHourPosition = (hour: number) => {
    const hour12 = hour % 12
    const angle = hour12 * 30 - 90
    const isOuter = hour >= 12
    const radius = isOuter ? 80 : 60
    const x = Math.cos((angle * Math.PI) / 180) * radius
    const y = Math.sin((angle * Math.PI) / 180) * radius
    return { x, y, isOuter }
  }

  const getMinutePosition = (minute: number) => {
    const angle = minute * 6 - 90
    const radius = 80
    const x = Math.cos((angle * Math.PI) / 180) * radius
    const y = Math.sin((angle * Math.PI) / 180) * radius
    return { x, y }
  }

  const handleClockClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!clockRef.current) return

    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const centerX = 100
    const centerY = 100
    const svgX = ((e.clientX - rect.left) / rect.width) * 200
    const svgY = ((e.clientY - rect.top) / rect.height) * 200
    const x = svgX - centerX
    const y = svgY - centerY

    const angle = Math.atan2(y, x) * (180 / Math.PI) + 90
    const normalizedAngle = angle < 0 ? angle + 360 : angle
    const distance = Math.sqrt(x * x + y * y)

    if (mode === 'hour') {
      let hour12 = Math.round(normalizedAngle / 30) % 12
      if (hour12 === 0) hour12 = 12
      const isOuter = distance > 70
      const newHour = isOuter ? hour12 + 12 : hour12 === 12 ? 0 : hour12
      handleTimeChange(newHour, minutes)
    } else {
      const newMinute = Math.round(normalizedAngle / 6) % 60
      handleTimeChange(hours, newMinute)
    }
  }

  const hourHandAngle = (hours % 12) * 30 + minutes * 0.5 - 90
  const minuteHandAngle = minutes * 6 - 90

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clockRef.current && !clockRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setMode('hour')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative">
      {label && (
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          {value || '00:00'}
        </button>

        {isOpen && (
          <div
            ref={clockRef}
            className="absolute z-50 mt-2 rounded-lg border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('hour')}
                  className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                    mode === 'hour'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  Hour
                </button>
                <button
                  type="button"
                  onClick={() => setMode('minute')}
                  className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                    mode === 'minute'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  Minute
                </button>
              </div>

              <div className="relative">
                <svg
                  width="200"
                  height="200"
                  viewBox="0 0 200 200"
                  className="cursor-pointer"
                  onClick={handleClockClick}
                >
                  <circle
                    cx="100"
                    cy="100"
                    r="95"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-slate-200 dark:text-slate-700"
                  />

                  {mode === 'hour' ? (
                    <>
                      {Array.from({ length: 24 }, (_, i) => {
                        const { x, y, isOuter } = getHourPosition(i)
                        const isSelected = hours === i
                        const displayHour = isOuter ? i : (i === 0 ? 12 : i)
                        return (
                          <g key={i}>
                            <text
                              x={100 + x}
                              y={100 + y + (isOuter ? 7 : 6)}
                              textAnchor="middle"
                              fontSize={isOuter ? '16' : '14'}
                              fontWeight={isSelected ? 'bold' : 'normal'}
                              fill="currentColor"
                              className={`${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}
                            >
                              {displayHour}
                            </text>
                          </g>
                        )
                      })}
                      <line
                        x1="100"
                        y1="100"
                        x2={100 + Math.cos((hourHandAngle * Math.PI) / 180) * 50}
                        y2={100 + Math.sin((hourHandAngle * Math.PI) / 180) * 50}
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </>
                  ) : (
                    <>
                      {Array.from({ length: 60 }, (_, i) => {
                        if (i % 5 !== 0) return null
                        const { x, y } = getMinutePosition(i)
                        const isSelected = minutes === i
                        return (
                          <g key={i}>
                            <text
                              x={100 + x}
                              y={100 + y + 6}
                              textAnchor="middle"
                              fontSize="14"
                              fontWeight={isSelected ? 'bold' : 'normal'}
                              fill="currentColor"
                              className={`${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}
                            >
                              {i}
                            </text>
                          </g>
                        )
                      })}
                      <line
                        x1="100"
                        y1="100"
                        x2={100 + Math.cos((minuteHandAngle * Math.PI) / 180) * 70}
                        y2={100 + Math.sin((minuteHandAngle * Math.PI) / 180) * 70}
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </>
                  )}

                  <circle cx="100" cy="100" r="4" fill="#3b82f6" />
                </svg>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setMode('hour')
                }}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

