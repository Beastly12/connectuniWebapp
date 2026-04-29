import { useState } from 'react'
import { Shield, Bell, Lock, LogOut, AlertTriangle, Sun, Moon, User } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout, C, useDarkMode } from '@/components/layouts/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { api, getErrorMessage } from '@/lib/api'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function SectionCard({ title, icon: IconComp, dark, children }: {
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any
  dark: boolean
  children: React.ReactNode
}) {
  return (
    <div style={{
      borderRadius: 20,
      border: `1.5px solid ${dark ? '#2A2A2A' : '#B8DCA0'}`,
      background: dark ? 'rgba(212,232,184,0.04)' : 'rgba(212,232,184,0.06)',
      overflow: 'hidden',
      marginBottom: 16,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 20px',
        borderBottom: `1px solid ${dark ? '#2A2A2A' : '#D8EDCA'}`,
      }}>
        {IconComp && (
          <div style={{
            width: 30, height: 30, borderRadius: 10,
            background: dark ? '#1A2A1A' : 'rgba(212,232,184,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconComp style={{ width: 14, height: 14, color: dark ? C.mint : '#4A7A40' }} />
          </div>
        )}
        <span style={{ fontSize: 14, fontWeight: 700, color: dark ? C.darkText : C.charcoal }}>{title}</span>
      </div>
      <div style={{ padding: '18px 20px' }}>
        {children}
      </div>
    </div>
  )
}

function ToggleRow({ label, sub, checked, onChange, dark }: {
  label: string; sub: string; checked: boolean
  onChange: (v: boolean) => void; dark: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '10px 0' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: dark ? C.darkText : C.charcoal }}>{label}</div>
        <div style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{sub}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 26, borderRadius: 100, border: 'none',
          background: checked ? C.orange : (dark ? '#333' : '#D4D4D4'),
          cursor: 'pointer', position: 'relative', flexShrink: 0,
          transition: 'background 0.2s',
        }}
      >
        <div style={{
          position: 'absolute', top: 3, left: checked ? 22 : 3,
          width: 20, height: 20, borderRadius: '50%', background: C.white,
          transition: 'left 0.2s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  )
}

const inputStyle = (dark: boolean): React.CSSProperties => ({
  width: '100%', borderRadius: 12,
  border: `1.5px solid ${dark ? '#333' : C.border}`,
  padding: '10px 14px', fontSize: 14,
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  color: dark ? C.darkText : C.charcoal,
  background: dark ? '#0E0E0E' : '#FAFAF8',
  outline: 'none', boxSizing: 'border-box',
})

function PasswordStrength({ password }: { password: string }) {
  const strength = Math.min(4, [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length)

  const colors = ['#F2F2F2', '#EF4B24', '#F5C842', '#7AB87A', '#4A9A4A']
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  if (!password) return null
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= strength ? colors[strength] : '#F2F2F2', transition: 'background 0.2s' }} />
        ))}
      </div>
      <div style={{ fontSize: 11, color: colors[strength] || C.tertiary, fontWeight: 600 }}>{labels[strength]}</div>
    </div>
  )
}

function SettingsPageContent() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const { dark, toggleDark } = useDarkMode()

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [mentorshipAlerts, setMentorshipAlerts] = useState(true)
  const [messageAlerts, setMessageAlerts] = useState(true)
  const [profileVisible, setProfileVisible] = useState(true)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setChangingPassword(true)
    try {
      await api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword })
      toast.success('Password updated!')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update password'))
    } finally {
      setChangingPassword(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ color: C.orange, fontSize: 14 }}>•</span>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.secondary }}>Settings</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: dark ? C.darkText : C.charcoal, letterSpacing: '-0.01em', margin: 0 }}>
            Preferences
          </h1>
        </div>

        {/* Account */}
        <SectionCard title="Account" icon={User} dark={dark}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.secondary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Name</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: dark ? C.darkText : C.charcoal }}>{profile?.full_name ?? '—'}</div>
            </div>
            <div style={{ height: 1, background: dark ? '#222' : '#F0EDE6' }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.secondary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>University</div>
              <div style={{ fontSize: 15, color: dark ? C.darkText : C.charcoal }}>{profile?.university ?? '—'}</div>
            </div>
          </div>
        </SectionCard>

        {/* Appearance */}
        <SectionCard title="Appearance" icon={dark ? Moon : Sun} dark={dark}>
          <div>
            <ToggleRow
              label="Dark Mode"
              sub="Switch to the dark theme"
              checked={dark}
              onChange={toggleDark}
              dark={dark}
            />
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard title="Notifications" icon={Bell} dark={dark}>
          <div>
            <ToggleRow label="Email notifications" sub="Receive updates via email" checked={emailNotifications} onChange={setEmailNotifications} dark={dark} />
            <div style={{ height: 1, background: dark ? '#222' : '#F0EDE6', margin: '0 -1px' }} />
            <ToggleRow label="Mentorship alerts" sub="New requests and status changes" checked={mentorshipAlerts} onChange={setMentorshipAlerts} dark={dark} />
            <div style={{ height: 1, background: dark ? '#222' : '#F0EDE6', margin: '0 -1px' }} />
            <ToggleRow label="Message alerts" sub="New community messages" checked={messageAlerts} onChange={setMessageAlerts} dark={dark} />
          </div>
        </SectionCard>

        {/* Privacy */}
        <SectionCard title="Privacy" icon={Shield} dark={dark}>
          <ToggleRow label="Public profile" sub="Allow others to find your profile" checked={profileVisible} onChange={setProfileVisible} dark={dark} />
        </SectionCard>

        {/* Security / Change password */}
        <SectionCard title="Security" icon={Lock} dark={dark}>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.secondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Current Password</div>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={inputStyle(dark)} autoComplete="current-password" />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.secondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>New Password</div>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle(dark)} autoComplete="new-password" />
              <PasswordStrength password={newPassword} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.secondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Confirm Password</div>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle(dark)} autoComplete="new-password" />
            </div>
            <button
              type="submit"
              disabled={changingPassword || !newPassword || !currentPassword}
              style={{
                padding: '11px', borderRadius: 100, border: 'none',
                background: changingPassword ? C.mint : C.orange,
                color: changingPassword ? C.charcoal : C.white,
                fontSize: 14, fontWeight: 700,
                cursor: (changingPassword || !newPassword || !currentPassword) ? 'default' : 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                opacity: (!newPassword || !currentPassword) ? 0.5 : 1,
                transition: 'background 0.2s',
              }}
            >
              {changingPassword ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </SectionCard>

        {/* Danger zone */}
        <div style={{
          borderRadius: 20,
          border: `1.5px solid rgba(239,75,36,0.3)`,
          background: 'rgba(239,75,36,0.04)',
          padding: '18px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <AlertTriangle style={{ width: 14, height: 14, color: C.orange }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: C.orange }}>Danger Zone</span>
            </div>
            <div style={{ fontSize: 13, color: C.secondary }}>Sign out of your account on this device</div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 100,
              background: 'transparent',
              border: `1.5px solid rgba(239,75,36,0.4)`,
              fontSize: 13, fontWeight: 600, color: C.orange,
              cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
              flexShrink: 0,
            }}
          >
            <LogOut style={{ width: 14, height: 14 }} />
            Sign out
          </button>
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
