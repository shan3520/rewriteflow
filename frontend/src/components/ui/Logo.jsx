import { cn } from '../../lib/cn'

export default function Logo({ className }) {
  return (
    <div className={cn("flex items-center gap-3.5 group cursor-default select-none", className)}>
      <div className="relative w-11 h-11 flex items-center justify-center">
        <div className="absolute inset-0 rounded-md border border-oxford dark:border-white opacity-25 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="font-display italic text-2xl text-oxford dark:text-white group-hover:scale-110 transition-transform duration-500">R</div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-oxford dark:text-white leading-none">
          Rewrite
        </span>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-oxford dark:text-white leading-none">
          Flow
        </span>
      </div>
    </div>
  )
}
