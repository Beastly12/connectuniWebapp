import { cn, formatRelativeTime } from '@/lib/utils'
import type { Message } from '@/lib/types'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[70%] space-y-1', isOwn ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2 text-sm',
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted text-foreground rounded-bl-sm'
          )}
        >
          {message.content}
        </div>
        <p className={cn('text-[10px] text-muted-foreground px-1', isOwn && 'text-right')}>
          {formatRelativeTime(message.created_at)}
          {isOwn && (
            <span className="ml-1">{message.is_read ? '✓✓' : '✓'}</span>
          )}
        </p>
      </div>
    </div>
  )
}
