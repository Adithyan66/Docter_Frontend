import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useClickOutside } from '@hooks/utils/useClickOutside'

type DropdownFilterProps = {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  buttonRef: React.RefObject<HTMLButtonElement | null>
  buttonClassName?: string
  disabled?: boolean
}

export default function DropdownFilter({
  label,
  value,
  options,
  onChange,
  isOpen,
  onToggle,
  onClose,
  buttonRef,
  buttonClassName = '',
  disabled = false,
}: DropdownFilterProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })

  useClickOutside({
    isEnabled: isOpen,
    refs: [dropdownRef, buttonRef],
    handler: onClose,
  })

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
  }, [isOpen, buttonRef])

  const selectedOption = options.find((opt) => opt.value === value)
  const displayText = selectedOption ? selectedOption.label : label

  const dropdownContent = isOpen ? (
    <div
      ref={dropdownRef}
      className="fixed z-[100] w-48 rounded-lg border border-slate-300 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
      style={{ top: position.top, left: position.left }}
    >
      <div className="max-h-60 overflow-y-auto scrollbar-tiny p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onChange(option.value)
              onClose()
            }}
            className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
              value === option.value
                ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  ) : null

  return (
    <div className="relative flex-shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={disabled ? undefined : onToggle}
        disabled={disabled}
        className={`flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${buttonClassName} ${
          value ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20' : ''
        } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <span className="truncate min-w-0">{displayText}</span>
        <svg
          className={`h-4 w-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
    </div>
  )
}

