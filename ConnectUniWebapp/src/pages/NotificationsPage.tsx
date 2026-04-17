import { Bell, CheckCheck } from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/hooks/useAuth'
import type { Notification } from '@/lib/types'
import { isToday, isThisWeek } from 'date-fns'

export default function NotificationsPage() {
  const { profile } = useAuth()
  const { notifications, isLoading, markRead, markAllRead } = useNotifications(profile?.user_id)

  const today = notifications.filter((n) => isToday(new Date(n.created_at)))
  const thisWeek = notifications.filter(
    (n) => !isToday(new Date(n.created_at)) && isThisWeek(new Date(n.created_at))
  )
  const earlier = notifications.filter((n) => !isThisWeek(new Date(n.created_at)))

  const hasUnread = notifications.some((n) => !n.is_read)

  function renderGroup(title: string, items: Notification[]) {
    if (items.length === 0) return null
    return (
      <div>
        <p className="px-1 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
        <div className="glass-card rounded-xl overflow-hidden divide-y divide-border/40">
          {items.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={(id: number) => markRead.mutate(id)}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="relative p-6 space-y-6 max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-5 w-5 items-center justify-center rounded-md gradient-primary">
                <Bell className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Notifications</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="mt-1 text-sm text-muted-foreground">Stay up to date with your activity</p>
          </div>
          {hasUnread && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs border-border/50 hover:border-primary/30 hover:text-primary"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card className="border-dashed border-border/40 bg-muted/10">
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary-subtle border border-primary/20">
                <Bell className="h-7 w-7 text-primary/60" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">No notifications yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  You'll see updates about mentorships and more here
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-5">
            {renderGroup('Today', today)}
            {renderGroup('This Week', thisWeek)}
            {renderGroup('Earlier', earlier)}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
