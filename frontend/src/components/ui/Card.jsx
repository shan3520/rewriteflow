import { cn } from '../../lib/cn.js'

// Double-Bezel surface: an outer mat board (.bezel) framing an inset inner
// surface (.bezel-inner) with a bevel highlight and an ink-tinted recess, so
// the edge reads as a matted document rather than a flat box. Pass
// `interactive` for the hover lift + focus ring (use on clickable cards).
// `innerClassName` styles the content surface; `className` styles the frame.
export default function Card({
  as: Tag = 'div',
  interactive = false,
  className,
  innerClassName,
  children,
  ...props
}) {
  return (
    <Tag className={cn('bezel', interactive && 'bezel-interactive', className)} {...props}>
      <div className={cn('bezel-inner', innerClassName)}>{children}</div>
    </Tag>
  )
}
