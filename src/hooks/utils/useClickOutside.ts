import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

type UseClickOutsideOptions = {
  isEnabled?: boolean
  refs: Array<RefObject<HTMLElement | null>>
  handler: () => void
}

export function useClickOutside({ isEnabled = true, refs, handler }: UseClickOutsideOptions) {
  const refsRef = useRef(refs)
  const handlerRef = useRef(handler)

  useEffect(() => {
    refsRef.current = refs
    handlerRef.current = handler
  }, [refs, handler])

  useEffect(() => {
    if (!isEnabled) return

    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutside = refsRef.current.every(
        (ref) => ref.current && !ref.current.contains(event.target as Node)
      )

      if (clickedOutside) {
        handlerRef.current()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isEnabled])
}

