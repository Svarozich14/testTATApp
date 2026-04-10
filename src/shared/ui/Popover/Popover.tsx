import {
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  flip,
  size,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  type Placement,
} from '@floating-ui/react'
import { useCallback, useId } from 'react'
import styles from './popover.module.css'

export type PopoverProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  placement?: Placement
  reference: React.ReactNode
  children: React.ReactNode
  /** Used for aria-controls when rendering a listbox/dialog inside. */
  contentId?: string
}

export function Popover({
  open,
  onOpenChange,
  placement = 'bottom-start',
  reference,
  children,
  contentId,
}: PopoverProps) {
  const fallbackId = useId()
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange,
    placement,
    middleware: [
      offset(6),
      flip(),
      shift({ padding: 8 }),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          })
        },
      }),
    ],
  })

  // Execution owner for open/close is the parent component.
  // Popover only provides positioning + dismiss on outside press / Escape.
  const dismiss = useDismiss(context, { referencePress: false })
  const role = useRole(context, { role: 'dialog' })
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss, role])

  const setReference = useCallback(
    (node: HTMLElement | null) => {
      refs.setReference(node)
    },
    [refs]
  )
  const setFloating = useCallback(
    (node: HTMLElement | null) => {
      refs.setFloating(node)
    },
    [refs]
  )

  return (
    <>
      <span
        ref={setReference}
        {...getReferenceProps({
          'aria-expanded': open,
          'aria-controls': contentId ?? fallbackId,
        })}
      >
        {reference}
      </span>

      {open ? (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
            <div
              id={contentId ?? fallbackId}
              ref={setFloating}
              style={floatingStyles}
              className={styles.panel}
              {...getFloatingProps()}
            >
              {children}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      ) : null}
    </>
  )
}

