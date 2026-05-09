import { useState } from 'react'
import { Bell, CheckCheck, Users, Calendar, MessageSquare, Briefcase } from 'lucide-react'
import { DashboardLayout, C, AvatarCircle, useDarkMode } from '@/components/layouts/DashboardLayout'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/hooks/useAuth'
import type { Notification } from '@/lib/types'
import { isToday, isThisWeek } from 'date-fns'

// ─── Tab Config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'all',        label: 'All',         icon: Bell },
  { id: 'mentorship', label: 'Mentorship',  icon: Users },
  { id: 'events',     label: 'Events',      icon: Calendar },
  { id: 'messages',   label: 'Messages',    icon: MessageSquare },
  { id: 'jobs',       label: 'Jobs',        icon: Briefcase },
] as const

type TabId = typeof TABS[number]['id']

function matchesTab(n: Notification, tab: TabId): boolean {
  if (tab === 'all') return true
  const t = (n.type ?? '').toLowerCase()
  if (tab === 'mentorship') return t.includes('mentor') || t.includes('session') || t.includes('relationship') || t.includes('request')
  if (tab === 'events') return t.includes('event')
  if (tab === 'messages') return t.includes('message') || t.includes('reaction') || t.includes('comment')
  if (tab === 'jobs') return t.includes('job') || t.includes('career')
  return true
}

// ─── Notification Row ─────────────────────────────────────────────────────────
function NotifRow({ notification, dark, onMarkRead }: {
  notification: Notification
  dark: boolean
  onMarkRead: (id: number) => void
}) {
  const rowBg = !notification.is_read
    ? (dark ? 'rgba(212,232,184,0.07)' : 'rgba(212,232,184,0.22)')
    : 'transparent'

  const typeKey = (notification.type ?? '').toLowerCase()
  const isMentorship = typeKey.includes('mentor') || typeKey.includes('session') || typeKey.includes('request')

  return (
    <div
      onClick={() => !notification.is_read && onMarkRead(notification.id)}
      style={{
        display: 'flex', gap: 14, padding: '14px 18px',
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
        <div style={{ fontSize: 14, color: dark ? C.darkText : C.charcoal, lineHeight: 1.45, marginBottom: 4 }}>
          <span style={{ fontWeight: notification.is_read ? 500 : 700 }}>
            {notification.sender_name ?? 'ConnectUni'}
          </span>{' '}
          <span style={{ color: C.secondary }}>{notification.body}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
          <span style={{ fontSize: 12, color: C.tertiary }}>
            {new Date(notification.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
          {notification.type && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: dark ? '#2A2A2A' : '#F0EDE6', color: C.tertiary, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
              {notification.type.replace(/_/g, ' ')}
            </span>
          )}
        </div>
        {/* Action buttons for mentorship requests */}
        {isMentorship && typeKey.includes('request') && !notification.is_read && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={e => { e.stopPropagation(); onMarkRead(notification.id) }}
              style={{ padding: '6px 16px', borderRadius: 100, border: 'none', background: C.orange, color: C.white, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Accept
            </button>
            <button onClick={e => { e.stopPropagation(); onMarkRead(notification.id) }}
              style={{ padding: '6px 16px', borderRadius: 100, border: `1.5px solid ${dark ? '#333' : C.border}`, background: 'transparent', color: C.secondary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Decline
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function SectionGroup({ title, items, dark, onMarkRead }: {
  title: string; items: Notification[]; dark: boolean; onMarkRead: (id: number) => void
}) {
  if (items.length === 0) return null
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.tertiary, marginBottom: 8, padding: '0 4px' }}>
        {title}
      </div>
      <div style={{ background: dark ? '#161616' : C.white, borderRadius: 18, border: `1px solid ${dark ? '#2A2A2A' : C.border}`, overflow: 'hidden' }}>
        {items.map((n) => (
          <NotifRow key={n.id} notification={n} dark={dark} onMarkRead={onMarkRead} />
        ))}
      </div>
    </div>
  )
}

function NotificationsPageContent() {
  const { user } = useAuth()
  const { dark } = useDarkMode()
  const { notifications, isLoading, markRead, markAllRead } = useNotifications(user?.id)
  const [activeTab, setActiveTab] = useState<TabId>('all')

  const filtered = notifications.filter(n => matchesTab(n, activeTab))
  const today    = filtered.filter(n => isToday(new Date(n.created_at)))
  const thisWeek = filtered.filter(n => !isToday(new Date(n.created_at)) && isThisWeek(new Date(n.created_at)))
  const earlier  = filtered.filter(n => !isThisWeek(new Date(n.created_at)))
  const hasUnread = notifications.some(n => !n.is_read)

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ color: C.orange, fontSize: 14 }}>•</span>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.secondary }}>Inbox</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: dark ? C.darkText : C.charcoal, letterSpacing: '-0.01em', margin: 0 }}>
            Notifications
          </h1>
        </div>
        {hasUnread && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 100, background: 'transparent', border: `1.5px solid ${dark ? '#333' : C.border}`, fontSize: 13, fontWeight: 600, color: C.secondary, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <CheckCheck style={{ width: 14, height: 14 }} />
            Mark all read
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: dark ? '#161616' : C.white, borderRadius: 14, padding: '4px', border: `1px solid ${dark ? '#2A2A2A' : C.border}`, overflowX: 'auto', scrollbarWidth: 'none' as const }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          const tabCount = notifications.filter(n => matchesTab(n, tab.id) && !n.is_read).length
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10, border: 'none',
                background: isActive ? C.orange : 'transparent',
                color: isActive ? C.white : (dark ? '#A0A0A0' : C.secondary),
                fontSize: 13, fontWeight: isActive ? 700 : 500,
                cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                transition: 'background 0.15s', flexShrink: 0,
                whiteSpace: 'nowrap' as const,
              }}
            >
              <tab.icon style={{ width: 13, height: 13 }} />
              {tab.label}
              {tabCount > 0 && (
                <span style={{ background: isActive ? 'rgba(255,255,255,0.3)' : C.orange, color: C.white, fontSize: 10, fontWeight: 700, borderRadius: 100, padding: '1px 6px', minWidth: 16, textAlign: 'center' }}>
                  {tabCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ height: 72, borderRadius: 16, background: dark ? '#1A1A1A' : '#F0EDE6', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, transparent 0%, ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)'} 50%, transparent 100%)`, animation: 'shimmer 1.2s infinite' }} />
            </div>
          ))}
          <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ borderRadius: 24, border: `1.5px dashed ${dark ? '#333' : C.border}`, background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '72px 40px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: dark ? '#1A1A1A' : '#F0EDE6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
            <Bell style={{ width: 28, height: 28, color: C.orange }} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: dark ? C.darkText : C.charcoal, marginBottom: 8 }}>
            {activeTab === 'all' ? 'No notifications yet' : `No ${activeTab} notifications`}
          </div>
          <div style={{ fontSize: 14, color: C.secondary }}>
            {activeTab === 'all' ? "You'll see updates about mentorships and activity here" : `Switch to "All" to see everything`}
          </div>
        </div>
      ) : (
        <div>
          <SectionGroup title="Today" items={today} dark={dark} onMarkRead={id => markRead.mutate(id)} />
          <SectionGroup title="This Week" items={thisWeek} dark={dark} onMarkRead={id => markRead.mutate(id)} />
          <SectionGroup title="Earlier" items={earlier} dark={dark} onMarkRead={id => markRead.mutate(id)} />
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
