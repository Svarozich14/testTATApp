import clsx from 'clsx'
import { useId, useMemo, useRef, useState } from 'react'
import { Popover } from '../Popover/Popover'
import styles from './combobox.module.css'

export type ComboboxItem = {
  key: string
  label: string
  meta?: React.ReactNode
  leading?: React.ReactNode
}

export type ComboboxProps = {
  label?: string
  placeholder?: string

  items: ComboboxItem[]
  loading?: boolean
  errorText?: string | null
  emptyText?: string

  /** Selected item is controlled by parent (recommended). */
  value: ComboboxItem | null
  onChange: (item: ComboboxItem | null) => void

  /** Query may be controlled or uncontrolled. */
  query?: string
  onQueryChange?: (q: string) => void

  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Combobox({
  label,
  placeholder,
  items,
  loading,
  errorText,
  emptyText = 'No results',
  value,
  onChange,
  query: controlledQuery,
  onQueryChange,
  open: controlledOpen,
  onOpenChange,
}: ComboboxProps) {
  const listboxId = useId()

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen

  const [uncontrolledQuery, setUncontrolledQuery] = useState('')
  const query = controlledQuery ?? uncontrolledQuery
  const setQuery = onQueryChange ?? setUncontrolledQuery

  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const optionIds = useMemo(
    () => items.map((_, idx) => `${listboxId}-opt-${idx}`),
    [items, listboxId]
  )

  function setOpenAndReset(next: boolean) {
    setOpen(next)
    if (!next) setActiveIndex(-1)
  }

  const activeDescendant = activeIndex >= 0 ? optionIds[activeIndex] : undefined

  function commitSelection(item: ComboboxItem) {
    onChange(item)
    setOpenAndReset(false)
    // keep text aligned to selection
    setQuery(item.label)
    inputRef.current?.focus()
  }

  function clear() {
    onChange(null)
    setQuery('')
    setOpenAndReset(true)
    inputRef.current?.focus()
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) setOpen(true)
      setActiveIndex((i) => Math.min(items.length - 1, i + 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) setOpen(true)
      setActiveIndex((i) => Math.max(0, i <= 0 ? 0 : i - 1))
      return
    }
    if (e.key === 'Enter') {
      if (!open) return
      const item = items[activeIndex]
      if (item) {
        e.preventDefault()
        commitSelection(item)
      } else {
        // Allow form submit when nothing is actively selected.
        setOpenAndReset(false)
      }
      return
    }
    if (e.key === 'Escape') {
      if (!open) return
      e.preventDefault()
      setOpenAndReset(false)
      return
    }
  }

  const reference = (
    <div className={styles.inputWrap}>
      <input
        ref={inputRef}
        className={styles.input}
        placeholder={placeholder}
        value={query}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-activedescendant={activeDescendant}
        onChange={(e) => {
          setQuery(e.target.value)
          if (!open) setOpenAndReset(true)
        }}
        onFocus={() => setOpenAndReset(true)}
        onKeyDown={onKeyDown}
      />
      {query ? (
        <button
          className={styles.clear}
          type="button"
          aria-label="Clear input"
          onClick={clear}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M3 3L11 11M11 3L3 11"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}
    </div>
  )

  return (
    <div className={styles.control}>
      {label ? <div className={styles.label}>{label}</div> : null}
      <Popover
        open={open}
        onOpenChange={setOpenAndReset}
        contentId={listboxId}
        reference={reference}
      >
        <div className={styles.menu} role="listbox" id={listboxId}>
        {errorText ? <div className={clsx(styles.row, styles.muted)}>{errorText}</div> : null}
        {!errorText && loading ? (
          <div className={clsx(styles.row, styles.muted)}>Loading…</div>
        ) : null}
        {!errorText && !loading && items.length === 0 ? (
          <div className={clsx(styles.row, styles.muted)}>{emptyText}</div>
        ) : null}

        {!errorText && items.length > 0
          ? items.map((it, idx) => {
              const active = idx === activeIndex
              const selected = value?.key === it.key
              return (
                <div
                  key={it.key}
                  id={optionIds[idx]}
                  role="option"
                  aria-selected={selected}
                  className={clsx(styles.row, active && styles.active)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => e.preventDefault()} // keep input focus
                  onClick={() => commitSelection(it)}
                >
                  {it.leading ? <span className={styles.leading}>{it.leading}</span> : null}
                  <span className={styles.text}>{it.label}</span>
                  {it.meta ? <span className={styles.meta}>{it.meta}</span> : null}
                </div>
              )
            })
          : null}
        </div>
      </Popover>
    </div>
  )
}

