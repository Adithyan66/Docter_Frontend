import type { ReactNode } from 'react'

export type FilterControlConfig =
  | {
      id: string
      type: 'dropdown'
      label: string
      value: string
      options: Array<{ value: string; label: string }>
      onChange: (value: string) => void
      buttonRef: React.RefObject<HTMLButtonElement | null>
      buttonClassName?: string
      disabled?: boolean
    }
  | {
      id: string
      type: 'date'
      label: string
      value: string
      onChange: (value: string) => void
      placeholder?: string
      className?: string
      disabled?: boolean
    }
  | {
      id: string
      type: 'custom'
      render: () => ReactNode
    }

export type ActionButtonConfig = {
  label: string
  onClick: () => void
  icon?: ReactNode
  className?: string
  disabled?: boolean
  isLoading?: boolean
  loadingLabel?: string
}

export type FilterButtonConfig = {
  activeCount: number
  onClick?: () => void
}

export type FilterDrawerRenderProps = {
  isOpen: boolean
  onClose: () => void
  buttonRef: React.RefObject<HTMLButtonElement | null>
}

export type PageHeaderProps = {
  title: string
  description?: string
  image?: {
    src: string
    alt: string
    className?: string
  }
  actionButton?: ActionButtonConfig
  actionButtons?: ActionButtonConfig[]
  searchSlot?: ReactNode
  filterControls?: FilterControlConfig[]
  filterButton?: FilterButtonConfig
  filterDrawerContent?: ReactNode | ((props: FilterDrawerRenderProps) => ReactNode)
  onApplyFilters?: () => void
  onClearFilters?: () => void
  hasPendingChanges?: boolean
  applyButtonLabel?: string
  clearButtonLabel?: string
}

