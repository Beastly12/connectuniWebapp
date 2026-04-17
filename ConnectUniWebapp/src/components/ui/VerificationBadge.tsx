import { cn } from '@/lib/utils'

type VerificationStatus = 'verified' | 'pending' | 'unverified' | 'self_declared'

interface VerificationBadgeProps {
  status: VerificationStatus | string
  className?: string
}

const statusConfig: Record<VerificationStatus, { label: string; className: string }> = {
  verified: {
    label: 'Verified',
    className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
  },
  pending: {
    label: 'Pending review',
    className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
  },
  unverified: {
    label: 'Unverified',
    className: 'bg-muted text-muted-foreground border-border/60',
  },
  self_declared: {
    label: 'Self-declared',
    className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25',
  },
}

export function VerificationBadge({ status, className }: VerificationBadgeProps) {
  const config = statusConfig[status as VerificationStatus] ?? statusConfig.unverified
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
