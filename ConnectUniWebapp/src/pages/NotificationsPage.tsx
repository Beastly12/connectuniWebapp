import { Bell, CheckCheck } from 'lucide-react'
import { DashboardLayout, C, AvatarCircle, useDarkMode } from '@/components/layouts/DashboardLayout'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/hooks/useAuth'
import type { Notification } from '@/lib/types'
import { isToday, isThisWeek } from 'date-fns'

function NotifRow({ notification, dark, onMarkRead }: {
  notification: Notification
  dark: boolean
  onMarkRead: (id: number) => void
}) {
  const rowBg = !notification.is_read
    ? (dark ? 'rgba(212,232,184,0.06)' : 'rgba(212,232,184,0.2)')
    : 'transparent'

  return (
    <div
      onClick={() => !notification.is_read && onMarkRead(notification.id)}
      style={{
        display: 'flex', gap: 14, padding: '14px 16px',
        background: rowBg,
        borderBottom: `1px solid ${dark ? '#1E1E1E' : '#F0EDE6'}`,
        position: 'relative', cursor: !notification.is_read ? 'pointer' : 'default',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <AvatarCircle name={notification.sender_name ?? 'CU'} size={40} />
        {!notification.is_read && (
          <div style={{
            position: 'absolute', top: -2, right: -2,
            width: 10, height: 10, borderRadius: '50%',
            background: C.orange,
            border: `2px solid ${dark ? '#0E0E0E' : C.pageBg}`,
          }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: dark ? C.darkText : C.charcoal, lineHeight: 1.45, marginBottom: 3 }}>
          <span style={{ fontWeight: notification.is_read ? 400 : 700 }}>
            {notification.sender_name ?? 'ConnectUni'}
          </span>{' '}
          <span style={{ color: C.secondary }}>{notification.body}</span>
        </div>
        <div style={{ fontSize: 12, color: C.tertiary }}>
          {new Date(notification.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

function SectionGroup({ title, items, dark, onMarkRead }: {
  title: string
  items: Notification[]
  dark: boolean
  onMarkRead: (id: number) => void
}) {
  if (items.length === 0) return null
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.tertiary, marginBottom: 10, padding: '0 4px' }}>
        {title}
      </div>
      <div style={{
        background: dark ? '#161616' : C.white,
        borderRadius: 20,
        border: `1px solid ${dark ? '#2A2A2A' : C.border}`,
        overflow: 'hidden',
      }}>
        {items.map((n) => (
          <NotifRow key={n.id} notification={n} dark={dark} onMarkRead={onMarkRead} />
        ))}
      </div>
    </div>
  )
}

function NotificationsPageContent() {
  const { profile } = useAuth()
  const { dark } = useDarkMode()
  const { notifications, isLoading, markRead, markAllRead } = useNotifications(profile?.user_id)

  const today    = notifications.filter((n) => isToday(new Date(n.created_at)))
  const thisWeek = notifications.filter((n) => !isToday(new Date(n.created_at)) && isThisWeek(new Date(n.created_at)))
  const earlier  = notifications.filter((n) => !isThisWeek(new Date(n.created_at)))
  const hasUnread = notifications.some((n) => !n.is_read)

  return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ color: C.orange, fontSize: 14 }}>•</span>
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.secondary }}>
                Notifications
              </span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: dark ? C.darkText : C.charcoal, letterSpacing: '-0.01em', margin: 0 }}>
              Activity
            </h1>
          </div>
          {hasUnread && (
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', borderRadius: 100,
                background: 'transparent',
                border: `1.5px solid ${dark ? '#333' : C.border}`,
                fontSize: 13, fontWeight: 600, color: C.secondary,
                cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              <CheckCheck style={{ width: 14, height: 14 }} />
              Mark all read
            </button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{
                height: 72, borderRadius: 16,
                background: dark ? '#1A1A1A' : '#F0EDE6',
                overflow: 'hidden', position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `linear-gradient(90deg, transparent 0%, ${dark ? 'rgba(212,232,184,0.05)' : 'rgba(212,232,184,0.3)'} 50%, transparent 100%)`,
                  animation: 'shimmer 1.2s infinite',
                }} />
              </div>
            ))}
            <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{
            borderRadius: 24, border: `1.5px dashed ${dark ? '#333' : C.border}`,
            background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '64px 40px', textAlign: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: dark ? '#1A1A1A' : '#F0EDE6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20,
            }}>
              <Bell style={{ width: 28, height: 28, color: C.orange }} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: dark ? C.darkText : C.charcoal, marginBottom: 8 }}>
              No notifications yet
            </div>
            <div style={{ fontSize: 14, color: C.secondary }}>
              You'll see updates about mentorships and activity here
            </div>
          </div>
        ) : (
          <div>
            <SectionGroup
              title="Today"
              items={today}
              dark={dark}
              onMarkRead={(id) => markRead.mutate(id)}
            />
            <SectionGroup
              title="This Week"
              items={thisWeek}
              dark={dark}
              onMarkRead={(id) => markRead.mutate(id)}
            />
            <SectionGroup
              title="Earlier"
              items={earlier}
              dark={dark}
              onMarkRead={(id) => markRead.mutate(id)}
            />
          </div>
        )}
      </div>
  )
}

export default function NotificationsPage() {
  return (
    <DashboardLayout>
      <NotificationsPageContent />
    </DashboardLayout>
  )
}
