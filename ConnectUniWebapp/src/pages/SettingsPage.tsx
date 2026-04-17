import { useState } from 'react'
import { Shield, Bell, Lock, LogOut, AlertTriangle, Sun, Moon } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'

export default function SettingsPage() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [mentorshipAlerts, setMentorshipAlerts] = useState(true)
  const [messageAlerts, setMessageAlerts] = useState(true)
  const [profileVisible, setProfileVisible] = useState(true)

  const [isDarkMode, setIsDarkMode] = useState(
    () => !document.documentElement.classList.contains('light')
  )

  function handleThemeToggle(dark: boolean) {
    setIsDarkMode(dark)
    if (dark) {
      document.documentElement.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.add('light')
      localStorage.setItem('theme', 'light')
    }
  }

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  async function handleChangePassword(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setChangingPassword(true)
    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      toast.success('Password updated!')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch {
      toast.error('Failed to update password')
    } finally {
      setChangingPassword(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const SwitchRow = ({
    label,
    description,
    checked,
    onCheckedChange,
  }: {
    label: string
    description: string
    checked: boolean
    onCheckedChange: (v: boolean) => void
  }) => (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )

  return (
    <DashboardLayout>
      <div className="relative p-6 space-y-5 max-w-xl mx-auto">
        {/* Header */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-5 w-5 items-center justify-center rounded-md gradient-primary">
              <Shield className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Settings</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your account preferences</p>
        </div>

        {/* Account info */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-medium">Account</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 px-5 pb-5 space-y-3">
            <div className="space-y-0.5">
              <Label className="text-xs text-muted-foreground">Name</Label>
              <p className="text-sm font-medium">{profile?.full_name}</p>
            </div>
            <Separator className="opacity-50" />
            <div className="space-y-0.5">
              <Label className="text-xs text-muted-foreground">University</Label>
              <p className="text-sm">{profile?.university ?? '—'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {isDarkMode ? <Moon className="h-3.5 w-3.5 text-muted-foreground" /> : <Sun className="h-3.5 w-3.5 text-muted-foreground" />}
              Appearance
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 px-5 pb-5">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Dark mode</p>
                <p className="text-xs text-muted-foreground">Switch between dark and light theme</p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-3.5 w-3.5 text-muted-foreground" />
                <Switch checked={isDarkMode} onCheckedChange={handleThemeToggle} />
                <Moon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-3.5 w-3.5 text-muted-foreground" />
              Notifications
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 px-5 pb-5 space-y-4">
            <SwitchRow
              label="Email notifications"
              description="Receive updates via email"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
            <Separator className="opacity-40" />
            <SwitchRow
              label="Mentorship alerts"
              description="New requests and status changes"
              checked={mentorshipAlerts}
              onCheckedChange={setMentorshipAlerts}
            />
            <Separator className="opacity-40" />
            <SwitchRow
              label="Message alerts"
              description="New community messages"
              checked={messageAlerts}
              onCheckedChange={setMessageAlerts}
            />
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              Privacy
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 px-5 pb-5">
            <SwitchRow
              label="Public profile"
              description="Allow others to find your profile"
              checked={profileVisible}
              onCheckedChange={setProfileVisible}
            />
          </CardContent>
        </Card>

        {/* Change password */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              Change Password
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 px-5 pb-5">
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Current Password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="h-9"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="h-8 text-xs font-semibold gradient-primary border-0 text-white shadow-glow-sm hover:opacity-90 disabled:opacity-40"
                disabled={changingPassword || !newPassword || !currentPassword}
              >
                {changingPassword ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Updating…
                  </span>
                ) : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-destructive/20">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <Separator className="border-destructive/20" />
          <CardContent className="pt-4 px-5 pb-5">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Sign out</p>
                <p className="text-xs text-muted-foreground">Sign out of your account on this device</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive shrink-0"
                onClick={handleSignOut}
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
