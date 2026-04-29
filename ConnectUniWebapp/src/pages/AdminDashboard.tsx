import { useState } from 'react'
import { Users, Shield, Zap } from 'lucide-react'
import { DashboardLayout, C, useDarkMode } from '@/components/layouts/DashboardLayout'

const TABS = ['Overview', 'Verification', 'Users'] as const
type Tab = typeof TABS[number]

function PlaceholderStat({ label, sublabel, icon: IconComp }: {
  label: string
  sublabel: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
}) {
  return (
    <div style={{
      borderRadius: 20, border: `1.5px dashed #A8CC88`,
      background: 'rgba(212, 232, 184, 0.12)',
      padding: '22px',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12,
          background: 'rgba(212,232,184,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IconComp style={{ width: 18, height: 18, color: '#5A9A5A' }} />
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
          color: '#7AB87A', background: 'rgba(212,232,184,0.4)',
          padding: '3px 10px', borderRadius: 100,
        }}>
          Coming Soon
        </span>
      </div>
      <div>
        <div style={{ fontSize: 36, fontWeight: 800, color: '#C8D8C0', letterSpacing: '-0.02em', lineHeight: 1 }}>—</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#4A7A40', marginTop: 6 }}>{label}</div>
        <div style={{ fontSize: 12, color: '#7AAA7A', marginTop: 2 }}>{sublabel}</div>
      </div>
    </div>
  )
}

function OverviewTab({ dark }: { dark: boolean }) {
  return (
    <div>
      {/* Hero banner */}
      <div style={{
        borderRadius: 24, background: C.charcoal,
        padding: '28px 32px', marginBottom: 28,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 220, height: 220, borderRadius: '50%', background: 'rgba(239,75,36,0.12)' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -60, width: 160, height: 160, borderRadius: '50%', background: 'rgba(212,232,184,0.08)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <span style={{ color: C.orange, fontSize: 14 }}>•</span>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.secondary }}>
            Platform Overview
          </span>
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: C.white, letterSpacing: '-0.01em', lineHeight: 1.15, maxWidth: 480 }}>
          ConnectUni is growing.<br />
          <span style={{ color: C.orange }}>Full analytics</span> arrive soon.
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 10 }}>
          In the meantime, monitor your platform status below.
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ color: C.orange, fontSize: 14 }}>•</span>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.secondary }}>
            Platform Metrics
          </span>
        </div>
        <div style={{ fontSize: 13, color: C.secondary, marginBottom: 16 }}>
          Live data will populate here. Early access for verified admins.
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 28 }}>
        <PlaceholderStat label="Total Users" sublabel="Students, alumni, professionals" icon={Users} />
        <PlaceholderStat label="Active Mentorships" sublabel="Ongoing mentor-mentee pairs" icon={Users} />
        <PlaceholderStat label="Communities" sublabel="Groups and interest clusters" icon={Shield} />
        <PlaceholderStat label="Events This Month" sublabel="Webinars, meetups, sessions" icon={Zap} />
      </div>

      {/* Waitlist CTA */}
      <div style={{
        borderRadius: 20, background: dark ? '#1A1A1A' : '#F7F5F0',
        border: `1px solid ${dark ? '#2A2A2A' : C.border}`,
        padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 16, background: C.orange,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Zap style={{ width: 22, height: 22, color: C.white }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: dark ? C.darkText : C.charcoal }}>
            Get early access to Admin Analytics
          </div>
          <div style={{ fontSize: 13, color: C.secondary, marginTop: 2 }}>Join 24 other admins on the waitlist.</div>
        </div>
        <button style={{
          background: C.orange, color: C.white, border: 'none',
          borderRadius: 100, padding: '10px 20px',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'Plus Jakarta Sans, sans-serif', whiteSpace: 'nowrap',
        }}>
          Join Waitlist ↗
        </button>
      </div>
    </div>
  )
}

function ComingSoonTab({ icon: IconComp, title, description, cta, dark }: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
  title: string
  description: string
  cta: string
  dark: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 40px', textAlign: 'center' }}>
      <div style={{ width: 180, height: 140, borderRadius: 24, marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: dark ? '#1A1A1A' : 'linear-gradient(145deg, #F0EDE6 0%, #E8E3D8 100%)' }} />
        <div style={{ position: 'absolute', top: 20, left: 20, width: 60, height: 60, borderRadius: '50%', background: C.mint, opacity: 0.6 }} />
        <div style={{ position: 'absolute', bottom: 16, right: 16, width: 50, height: 50, borderRadius: 16, background: C.orange, opacity: 0.3, transform: 'rotate(15deg)' }} />
        <div style={{ position: 'absolute', top: 40, right: 30, width: 36, height: 36, borderRadius: '50%', background: C.lavender, opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconComp style={{ width: 36, height: 36, color: C.orange }} />
        </div>
      </div>

      <div style={{ fontSize: 24, fontWeight: 800, color: dark ? C.darkText : C.charcoal, letterSpacing: '-0.01em', marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ fontSize: 15, color: C.secondary, lineHeight: 1.6, maxWidth: 340, marginBottom: 28 }}>
        {description}
      </div>

      <div style={{
        background: dark ? '#1A1A1A' : '#F7F5F0', borderRadius: 16, padding: '16px 20px',
        maxWidth: 340, width: '100%', marginBottom: 16,
        border: `1px solid ${dark ? '#2A2A2A' : C.border}`,
      }}>
        <div style={{ fontSize: 12, color: C.secondary, marginBottom: 10 }}>+19 admins waiting · Feature in development</div>
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i < 3 ? C.mint : '#F2F2F2' }} />
          ))}
        </div>
        <div style={{ fontSize: 12, color: C.tertiary, marginTop: 6 }}>~4 weeks out</div>
      </div>

      <button style={{
        background: C.orange, color: C.white, border: 'none',
        borderRadius: 100, padding: '12px 28px',
        fontSize: 14, fontWeight: 600, cursor: 'pointer',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      }}>
        {cta} ↗
      </button>
    </div>
  )
}

function AdminDashboardContent() {
  const [tab, setTab] = useState<Tab>('Overview')
  const { dark } = useDarkMode()

  return (
    <div>
      {/* Tab nav */}
      <div style={{ display: 'inline-flex', background: dark ? '#1A1A1A' : '#F0EDE6', borderRadius: 100, padding: 4, gap: 2, marginBottom: 28 }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 20px', borderRadius: 100, border: 'none',
              background: tab === t ? (dark ? '#2A2A2A' : C.white) : 'transparent',
              color: tab === t ? (dark ? C.darkText : C.charcoal) : C.secondary,
              fontSize: 13, fontWeight: tab === t ? 700 : 500,
              cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
              boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && <OverviewTab dark={dark} />}
      {tab === 'Verification' && (
        <ComingSoonTab
          icon={Shield}
          title="Verification Centre"
          description="Review and approve student, alumni and professional identity verifications. Manage badge tiers and institution partnerships."
          cta="Join Waitlist"
          dark={dark}
        />
      )}
      {tab === 'Users' && (
        <ComingSoonTab
          icon={Users}
          title="User Management"
          description="Browse, search and manage all ConnectUni users. Suspend accounts, assign roles, and view connection activity across the platform."
          cta="Get Early Access"
          dark={dark}
        />
      )}
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <AdminDashboardContent />
    </DashboardLayout>
  )
}
