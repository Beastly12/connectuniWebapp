import { useNavigate } from 'react-router-dom'
import {
  Bell,
  MessageCircle,
  Users,
  Calendar,
  Briefcase,
  BookOpen,
  Heart,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn, formatRelativeTime, getInitials } from '@/lib/utils'
import type { Notification } from '@/lib/types'

interface NotificationItemProps {
  notification: Notification
  onMarkRead: (id: number) => void
}

function getTypeIcon(type: string): React.ElementType {
  if (type.includes('message') || type.includes('reply') || type.includes('chat')) return MessageCircle
  if (type.includes('mentorship') || type.includes('mentor')) return Users
  if (type.includes('event')) return Calendar
  if (type.includes('career') || type.includes('job')) return Briefcase
  if (type.includes('resource')) return BookOpen
  if (type.includes('reaction') || type.includes('like')) return Heart
  return Bell
}

function getTypeRoute(type: string, referenceId: number | null): string | null {
  if (type.includes('message') || type.includes('reply') || type.includes('chat')) return '/community'
  if (type.includes('mentorship') || type.includes('mentor')) return '/mentorship'
  if (type.includes('event')) return referenceId ? `/events` : '/events'
  if (type.includes('career') || type.includes('job')) return '/careers'
  if (type.includes('resource')) return '/resources'
  return null
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const navigate = useNavigate()
  const Icon = getTypeIcon(notification.type)

  function handleClick() {
    if (!notification.is_read) onMarkRead(notification.id)
    const route = getTypeRoute(notification.type, notification.reference_id)
    if (route) navigate(route)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all hover:bg-muted/30',
        !notification.is_read && 'bg-accent/20'
      )}
    >
      {/* Avatar or icon */}
      <div className="relative mt-0.5 shrink-0">
        <Avatar className="h-9 w-9">
          <AvatarImage src={notification.sender_avatar ?? undefined} />
          <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
            {getInitials(notification.sender_name)}
          </AvatarFallback>
        </Avatar>
        {/* Type icon badge */}
        <div className={cn(
          'absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-background',
          notification.is_read ? 'bg-muted' : 'gradient-primary'
        )}>
          <Icon className={cn('h-2.5 w-2.5', notification.is_read ? 'text-muted-foreground' : 'text-white')} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm leading-snug',
          !notification.is_read ? 'font-semibold text-foreground' : 'text-foreground/75'
        )}>
          {notification.body}
        </p>
        <p className="text-[10px] text-muted-foreground/50 mt-1">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>

      {!notification.is_read && (
        <div className="mt-2 h-2 w-2 shrink-0 rounded-full gradient-primary shadow-glow-sm" />
      )}
    </button>
  )
}
