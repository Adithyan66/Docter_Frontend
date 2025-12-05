import { useState, useRef, cloneElement, isValidElement } from 'react'
import DropdownFilter from '@components/common/DropdownFilter'
import { FilterIcon } from '@assets/Icons'
import type { PageHeaderProps, FilterDrawerRenderProps } from './PageHeader.types'

export default function PageHeader({
  title,
  description,
  image,
  actionButton,
  actionButtons,
  searchSlot,
  filterControls = [],
  filterButton,
  filterDrawerContent,
  onApplyFilters,
  onClearFilters,
  hasPendingChanges = false,
  applyButtonLabel = 'Apply',
  clearButtonLabel = 'Clear All',
}: PageHeaderProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const moreFiltersButtonRef = useRef<HTMLButtonElement>(null)

  const handleFilterToggle = (filterId: string) => {
    setOpenDropdown(openDropdown === filterId ? null : filterId)
  }

  const handleMoreFiltersClick = () => {
    setFilterDrawerOpen(true)
    filterButton?.onClick?.()
  }

  const handleFilterDrawerClose = () => {
    setFilterDrawerOpen(false)
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-md bg-white/60 p-6 backdrop-blur-sm dark:bg-slate-900 lg:flex-row lg:items-center lg:gap-6">
        {image && (
          <img
            src={image.src}
            alt={image.alt}
            className={image.className || 'w-[120px] h-[120px]'}
          />
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>
          {description && (
            <p className="text-slate-600 dark:text-slate-300">{description}</p>
          )}
          {(actionButton || actionButtons) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {actionButton && (
                <button
                  type="button"
                  onClick={actionButton.onClick}
                  disabled={actionButton.disabled || actionButton.isLoading}
                  className={
                    actionButton.className ||
                    'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-100 to-green-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-green-200 hover:to-green-300 disabled:cursor-not-allowed disabled:opacity-60 dark:from-green-800/30 dark:to-green-700/30 dark:text-slate-200 dark:hover:from-green-700/40 dark:hover:to-green-600/40'
                  }
                >
                  {actionButton.isLoading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-transparent dark:border-slate-200"></span>
                  )}
                  {actionButton.icon}
                  {actionButton.isLoading && actionButton.loadingLabel
                    ? actionButton.loadingLabel
                    : actionButton.label}
                </button>
              )}
              {actionButtons?.map((button, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={button.onClick}
                  disabled={button.disabled || button.isLoading}
                  className={
                    button.className ||
                    'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-100 to-green-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-green-200 hover:to-green-300 disabled:cursor-not-allowed disabled:opacity-60 dark:from-green-800/30 dark:to-green-700/30 dark:text-slate-200 dark:hover:from-green-700/40 dark:hover:to-green-600/40'
                  }
                >
                  {button.isLoading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-transparent dark:border-slate-200"></span>
                  )}
                  {button.icon}
                  {button.isLoading && button.loadingLabel ? button.loadingLabel : button.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {(searchSlot || filterButton || filterControls.length > 0) && (
          <div className="flex w-full flex-col gap-3 lg:max-w-xl">
            {(searchSlot || filterButton) && (
              <div className="flex items-center gap-2">
                {searchSlot}
                {filterButton && (
                  <button
                    ref={moreFiltersButtonRef}
                    type="button"
                    onClick={handleMoreFiltersClick}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap ${
                      filterButton.activeCount > 0
                        ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                        : ''
                    }`}
                  >
                    <FilterIcon />
                    More Filters
                    {filterButton.activeCount > 0 && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white dark:bg-blue-500">
                        {filterButton.activeCount}
                      </span>
                    )}
                  </button>
                )}
              </div>
            )}
            {(filterControls.length > 0 || onApplyFilters || onClearFilters) && (
              <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible scrollbar-hide">
                {filterControls.map((filter) => {
                  if (filter.type === 'dropdown') {
                    return (
                      <DropdownFilter
                        key={filter.id}
                        label={filter.label}
                        value={filter.value}
                        options={filter.options}
                        onChange={filter.onChange}
                        isOpen={openDropdown === filter.id}
                        onToggle={() => handleFilterToggle(filter.id)}
                        onClose={() => setOpenDropdown(null)}
                        buttonRef={filter.buttonRef}
                        buttonClassName={filter.buttonClassName}
                        disabled={filter.disabled}
                      />
                    )
                  }
                  if (filter.type === 'date') {
                    return (
                      <input
                        key={filter.id}
                        type="date"
                        value={filter.value}
                        onChange={(e) => filter.onChange(e.target.value)}
                        placeholder={filter.placeholder}
                        disabled={filter.disabled}
                        className={
                          filter.className ||
                          'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'
                        }
                      />
                    )
                  }
                  if (filter.type === 'custom') {
                    return <div key={filter.id}>{filter.render()}</div>
                  }
                  return null
                })}
                {onApplyFilters && (
                  <button
                    type="button"
                    onClick={onApplyFilters}
                    disabled={!hasPendingChanges}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400 max-w-[calc((100%-2rem)/5)] min-w-0 whitespace-nowrap"
                  >
                    <span className="truncate">{applyButtonLabel}</span>
                  </button>
                )}
                {onClearFilters && (
                  <button
                    type="button"
                    onClick={onClearFilters}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 max-w-[calc((100%-2rem)/5)] min-w-0 whitespace-nowrap"
                  >
                    <span className="truncate">{clearButtonLabel}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {filterDrawerContent &&
        (typeof filterDrawerContent === 'function'
          ? filterDrawerContent({
              isOpen: filterDrawerOpen,
              onClose: handleFilterDrawerClose,
              buttonRef: moreFiltersButtonRef,
            })
          : isValidElement(filterDrawerContent)
            ? cloneElement(filterDrawerContent, {
                isOpen: filterDrawerOpen,
                onClose: handleFilterDrawerClose,
                buttonRef: moreFiltersButtonRef,
              } as Partial<FilterDrawerRenderProps>)
            : filterDrawerContent)}
    </>
  )
}

