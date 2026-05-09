import { useState } from 'react'
import { Shield, Bell, Lock, LogOut, AlertTriangle, Sun, Moon, User, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout, C, AvatarCircle, useDarkMode } from '@/components/layouts/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { api, getErrorMessage } from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'profile',       label: 'Profile',        icon: User },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'privacy',       label: 'Privacy',        icon: Shield },
  { id: 'security',      label: 'Security',       icon: Lock },
] as const

type SectionId = typeof SECTIONS[number]['id']

// ─── Helpers ─────────────────────────────────────────────────────────────────
const inputStyle = (dark: boolean): React.CSSProperties => ({
  width: '100%', borderRadius: 12, border: `1.5px solid ${dark ? '#333' : C.border}`,
  padding: '10px 14px', fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif',
  color: dark ? C.darkText : C.charcoal, background: dark ? '#0E0E0E' : '#FAFAF8',
  outline: 'none', boxSizing: 'border-box',
})

function ToggleRow({ label, sub, checked, onChange, dark }: {
  label: string; sub: string; checked: boolean; onChange: (v: boolean) => void; dark: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: `1px solid ${dark ? '#1E1E1E' : '#F5F3EE'}` }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: dark ? C.darkText : C.charcoal }}>{label}</div>
        <div style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{sub}</div>
      </div>
      <button onClick={() => onChange(!checked)}
        style={{ width: 44, height: 26, borderRadius: 100, border: 'none', background: checked ? C.orange : (dark ? '#333' : '#D4D4D4'), cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
        <div style={{ position: 'absolute', top: 3, left: checked ? 22 : 3, width: 20, height: 20, borderRadius: '50%', background: C.white, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
      </button>
    </div>
  )
}

function FieldLabel({ label }: { label: string }) {
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: C.secondary, marginBottom: 7 }}>{label}</div>
}

function PasswordStrength({ password }: { password: string }) {
  const strength = Math.min(4, [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length)
  const colors = ['#F2F2F2', '#EF4B24', '#F5C842', '#7AB87A', '#4A9A4A']
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  if (!password) return null
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map(i => (<div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= strength ? colors[strength] : '#F2F2F2', transition: 'background 0.2s' }} />))}
      </div>
      <div style={{ fontSize: 11, color: colors[strength] || C.tertiary, fontWeight: 600 }}>{labels[strength]}</div>
    </div>
  )
}

// ─── Section: Profile ─────────────────────────────────────────────────────────
function ProfileSection({ dark }: { dark: boolean }) {
  const { profile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    headline: profile?.headline ?? '',
    bio: profile?.bio ?? '',
  })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch('/profiles/me', form)
      toast.success('Profile updated!')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update profile'))
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSave}>
      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28 }}>
        <div style={{ position: 'relative' }}>
          <AvatarCircle name={profile?.full_name ?? 'U'} size={72} />
          <label style={{ position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, borderRadius: '50%', background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `2px solid ${dark ? '#0E0E0E' : C.white}` }}>
            <Camera style={{ width: 11, height: 11, color: C.white }} />
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => {
              const file = e.target.files?.[0]
              if (!file) return
              const fd = new FormData(); fd.append('file', file)
              try { await api.putForm('/profiles/me/avatar', fd); toast.success('Avatar updated!') } catch (err) { toast.error(getErrorMessage(err, 'Failed to upload avatar')) }
            }} />
          </label>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: dark ? C.darkText : C.charcoal }}>{profile?.full_name ?? 'Your Name'}</div>
          <div style={{ fontSize: 13, color: C.secondary }}>{profile?.university ?? 'University'}</div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <FieldLabel label="Display Name" />
        <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} style={inputStyle(dark)} placeholder="Your full name" />
      </div>
      <div style={{ marginBottom: 16 }}>
        <FieldLabel label="Headline" />
        <input value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} style={inputStyle(dark)} placeholder="e.g. Software Engineer at Acme" />
      </div>
      <div style={{ marginBottom: 24 }}>
        <FieldLabel label="Bio" />
        <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={4} style={{ ...inputStyle(dark), resize: 'vertical', lineHeight: 1.6 } as React.CSSProperties} placeholder="Tell others about yourself…" />
      </div>

      <button type="submit" disabled={saving}
        style={{ padding: '11px 28px', borderRadius: 100, border: 'none', background: saving ? C.mint : C.orange, color: saving ? C.charcoal : C.white, fontSize: 14, fontWeight: 700, cursor: saving ? 'default' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'background 0.2s' }}>
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}

// ─── Section: Notifications ───────────────────────────────────────────────────
function NotificationsSection({ dark }: { dark: boolean }) {
  const [state, setState] = useState({
    email: true, mentorship: true, events: true,
    messages: true, reactions: false, weekly: true,
  })
  const toggle = (key: keyof typeof state) => setState(s => ({ ...s, [key]: !s[key] }))

  return (
    <div>
      <div style={{ fontSize: 15, color: dark ? C.darkText : C.charcoal, marginBottom: 20, lineHeight: 1.5 }}>
        Control when and how you receive notifications.
      </div>
      <ToggleRow label="Email notifications" sub="Receive updates via email" checked={state.email} onChange={() => toggle('email')} dark={dark} />
      <ToggleRow label="Mentorship alerts" sub="New requests and session reminders" checked={state.mentorship} onChange={() => toggle('mentorship')} dark={dark} />
      <ToggleRow label="Event reminders" sub="RSVP confirmations and upcoming events" checked={state.events} onChange={() => toggle('events')} dark={dark} />
      <ToggleRow label="Community messages" sub="New messages in your communities" checked={state.messages} onChange={() => toggle('messages')} dark={dark} />
      <ToggleRow label="Reactions" sub="When someone reacts to your posts" checked={state.reactions} onChange={() => toggle('reactions')} dark={dark} />
      <div style={{ paddingTop: 12 }}>
        <ToggleRow label="Weekly digest" sub="A summary of activity each week" checked={state.weekly} onChange={() => toggle('weekly')} dark={dark} />
      </div>
    </div>
  )
}

// ─── Section: Privacy ─────────────────────────────────────────────────────────
function PrivacySection({ dark }: { dark: boolean }) {
  const [state, setState] = useState({ publicProfile: true, showUniversity: true, showActivity: false, discoverableMentor: true })
  const toggle = (key: keyof typeof state) => setState(s => ({ ...s, [key]: !s[key] }))

  return (
    <div>
      <div style={{ fontSize: 15, color: dark ? C.darkText : C.charcoal, marginBottom: 20, lineHeight: 1.5 }}>
        Manage who can see your information and how you appear on ConnectUni.
      </div>
      <ToggleRow label="Public profile" sub="Allow others to find and view your profile" checked={state.publicProfile} onChange={() => toggle('publicProfile')} dark={dark} />
      <ToggleRow label="Show university" sub="Display your institution on your profile" checked={state.showUniversity} onChange={() => toggle('showUniversity')} dark={dark} />
      <ToggleRow label="Show activity" sub="Let others see when you're active" checked={state.showActivity} onChange={() => toggle('showActivity')} dark={dark} />
      <div style={{ paddingTop: 12 }}>
        <ToggleRow label="Discoverable as mentor" sub="Appear in mentor search results" checked={state.discoverableMentor} onChange={() => toggle('discoverableMentor')} dark={dark} />
      </div>
    </div>
  )
}

// ─── Section: Security ────────────────────────────────────────────────────────
function SecuritySection({ dark }: { dark: boolean }) {
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' })
  const [changing, setChanging] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.newPw !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.newPw.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setChanging(true)
    try {
      await api.post('/auth/change-password', { current_password: form.current, new_password: form.newPw })
      toast.success('Password updated!')
      setForm({ current: '', newPw: '', confirm: '' })
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update password'))
    } finally { setChanging(false) }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <FieldLabel label="Current Password" />
        <input type="password" value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} style={inputStyle(dark)} autoComplete="current-password" />
      </div>
      <div>
        <FieldLabel label="New Password" />
        <input type="password" value={form.newPw} onChange={e => setForm(f => ({ ...f, newPw: e.target.value }))} style={inputStyle(dark)} autoComplete="new-password" />
        <PasswordStrength password={form.newPw} />
      </div>
      <div>
        <FieldLabel label="Confirm New Password" />
        <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} style={inputStyle(dark)} autoComplete="new-password" />
      </div>
      <button type="submit" disabled={changing || !form.newPw || !form.current}
        style={{ padding: '11px 28px', borderRadius: 100, border: 'none', background: changing ? C.mint : C.orange, color: changing ? C.charcoal : C.white, fontSize: 14, fontWeight: 700, cursor: (changing || !form.newPw || !form.current) ? 'default' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: (!form.newPw || !form.current) ? 0.5 : 1, transition: 'background 0.2s', alignSelf: 'flex-start' }}>
        {changing ? 'Updating…' : 'Update Password'}
      </button>
    </form>
  )
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
function SettingsPageContent() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const { dark, toggleDark } = useDarkMode()
  const [activeSection, setActiveSection] = useState<SectionId>('profile')

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const sectionContent: Record<SectionId, React.ReactNode> = {
    profile:       <ProfileSection dark={dark} />,
    notifications: <NotificationsSection dark={dark} />,
    privacy:       <PrivacySection dark={dark} />,
    security:      <SecuritySection dark={dark} />,
  }

  const sectionTitles: Record<SectionId, string> = {
    profile:       'Profile',
    notifications: 'Notifications',
    privacy:       'Privacy',
    security:      'Security',
  }

  const railBg = dark ? '#161616' : C.white
  const contentBg = dark ? '#161616' : C.white

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ color: C.orange, fontSize: 14 }}>•</span>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.secondary }}>Settings</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: dark ? C.darkText : C.charcoal, letterSpacing: '-0.01em', margin: 0 }}>Preferences</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left Rail Nav */}
        <div style={{ background: railBg, borderRadius: 20, border: `1px solid ${dark ? '#2A2A2A' : C.border}`, overflow: 'hidden', position: 'sticky', top: 20 }}>
          {SECTIONS.map(section => {
            const isActive = activeSection === section.id
            const IconComp = section.icon
            return (
              <button key={section.id} onClick={() => setActiveSection(section.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: 'none', background: isActive ? (dark ? 'rgba(239,75,36,0.12)' : 'rgba(239,75,36,0.08)') : 'transparent', borderLeft: `3px solid ${isActive ? C.orange : 'transparent'}`, color: isActive ? C.orange : (dark ? '#A0A0A0' : C.secondary), fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: 'pointer', textAlign: 'left', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'background 0.15s' }}>
                <IconComp style={{ width: 15, height: 15, flexShrink: 0 }} />
                {section.label}
              </button>
            )
          })}
          <div style={{ height: 1, background: dark ? '#2A2A2A' : C.border, margin: '4px 0' }} />
          {/* Dark mode toggle in rail */}
          <button onClick={toggleDark}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: 'none', background: 'transparent', borderLeft: '3px solid transparent', color: dark ? '#A0A0A0' : C.secondary, fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {dark ? <Sun style={{ width: 15, height: 15, flexShrink: 0 }} /> : <Moon style={{ width: 15, height: 15, flexShrink: 0 }} />}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <div style={{ height: 1, background: dark ? '#2A2A2A' : C.border, margin: '4px 0' }} />
          <button onClick={handleSignOut}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: 'none', background: 'transparent', borderLeft: '3px solid transparent', color: C.orange, fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <LogOut style={{ width: 15, height: 15, flexShrink: 0 }} />
            Sign Out
          </button>
        </div>

        {/* Right Content Area */}
        <div style={{ background: contentBg, borderRadius: 20, border: `1px solid ${dark ? '#2A2A2A' : C.border}`, padding: '28px 32px' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: dark ? C.darkText : C.charcoal, marginBottom: 24 }}>
            {sectionTitles[activeSection]}
          </div>
          {sectionContent[activeSection]}

          {/* Danger zone (only on security section) */}
          {activeSection === 'security' && (
            <div style={{ marginTop: 32, borderRadius: 16, border: '1.5px solid rgba(239,75,36,0.25)', background: 'rgba(239,75,36,0.04)', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <AlertTriangle style={{ width: 14, height: 14, color: C.orange }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.orange }}>Sign Out</span>
                </div>
                <div style={{ fontSize: 13, color: C.secondary }}>Sign out of your account on this device</div>
              </div>
              <button onClick={handleSignOut}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 100, background: 'transparent', border: '1.5px solid rgba(239,75,36,0.4)', fontSize: 13, fontWeight: 600, color: C.orange, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', flexShrink: 0 }}>
                <LogOut style={{ width: 14, height: 14 }} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <SettingsPageContent />
    </DashboardLayout>
  )
}
