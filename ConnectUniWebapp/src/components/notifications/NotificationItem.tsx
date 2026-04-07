import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { Notification } from '@/lib/types'

interface NotificationItemProps {
  notification: Notification
  onMarkRead: (id: string) => void
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const navigate = useNavigate()

  function handleClick() {
    if (!notification.is_read) onMarkRead(notification.id)
    if (notification.action_url) navigate(notification.action_url)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all hover:bg-muted/30 group',
        !notification.is_read && 'bg-accent/20'
      )}
    >
      <div className={cn(
        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all',
        notification.is_read
          ? 'bg-muted/60'
          : 'gradient-primary shadow-glow-sm'
      )}>
        <Bell className={cn(
          'h-3.5 w-3.5',
          notification.is_read ? 'text-muted-foreground/50' : 'text-white'
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm leading-snug',
          !notification.is_read ? 'font-semibold text-foreground' : 'text-foreground/75'
        )}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground/70 line-clamp-1 mt-0.5">{notification.message}</p>
        <p className="text-[10px] text-muted-foreground/50 mt-1">{formatRelativeTime(notification.created_at)}</p>
      </div>
      {!notification.is_read && (
        <div className="mt-2 h-2 w-2 shrink-0 rounded-full gradient-primary shadow-glow-sm" />
      )}
    </button>
  )
}
