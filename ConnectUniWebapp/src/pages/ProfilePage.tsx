import { useState, useRef } from 'react'
import { Camera, GraduationCap, Building, Pencil, Check, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { VerificationBadge } from '@/components/ui/VerificationBadge'
import { useAuth } from '@/hooks/useAuth'
import { useFullProfile } from '@/hooks/useOnboarding'
import { api } from '@/lib/api'
import { getInitials } from '@/lib/utils'

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const { data: fullProfile } = useFullProfile()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!fileInputRef.current) return
    fileInputRef.current.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB')
      return
    }

    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await api.putForm('/profiles/me/avatar', formData)
      await refreshProfile()
      toast.success('Profile picture updated!')
    } catch {
      toast.error('Failed to upload profile picture')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const [headline, setHeadline] = useState(profile?.headline ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [university, setUniversity] = useState(profile?.university ?? '')
  const [major, setMajor] = useState(profile?.major ?? '')
  const [graduationYear, setGraduationYear] = useState(String(profile?.graduation_year ?? ''))
  const [company, setCompany] = useState(profile?.company ?? '')
  const [jobTitle, setJobTitle] = useState(profile?.job_title ?? '')
  const [goals, setGoals] = useState(profile?.goals ?? '')

  function startEdit() {
    setHeadline(profile?.headline ?? '')
    setBio(profile?.bio ?? '')
    setUniversity(profile?.university ?? '')
    setMajor(profile?.major ?? '')
    setGraduationYear(String(profile?.graduation_year ?? ''))
    setCompany(profile?.company ?? '')
    setJobTitle(profile?.job_title ?? '')
    setGoals(profile?.goals ?? '')
    setEditing(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await api.patch('/profiles/me', {
        headline: headline || null,
        bio: bio || null,
        university: university || null,
        graduation_year: graduationYear ? Number(graduationYear) : null,
        major: major || null,
        company: company || null,
        job_title: jobTitle || null,
        goals: goals || null,
      })
      await refreshProfile()
      setEditing(false)
      toast.success('Profile saved!')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="relative p-6 space-y-5 max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
            {fullProfile && <VerificationBadge status={fullProfile.verification_status} />}
          </div>
          {!editing ? (
            <Button variant="outline" size="sm" className="h-8 text-xs border-border/50 hover:border-primary/30" onClick={startEdit}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" className="h-8 text-xs border-border/50" onClick={() => setEditing(false)}>
                <X className="mr-1 h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs font-semibold gradient-primary border-0 text-white shadow-glow-sm hover:opacity-90"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving…
                  </span>
                ) : (
                  <>
                    <Check className="mr-1 h-3.5 w-3.5" />
                    Save
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Avatar + name */}
        <Card>
          <CardContent className="p-5 flex items-center gap-5">
            <div className="relative shrink-0">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="text-lg font-medium bg-accent text-accent-foreground">
                  {getInitials(profile?.full_name ?? 'U')}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                type="button"
                disabled={uploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {uploadingAvatar
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <Camera className="h-3 w-3" />
                }
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold">{profile?.full_name}</h2>
              {editing ? (
                <Input
                  className="mt-1.5 h-8 text-xs"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Software Engineer at Google"
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {profile?.headline ?? (profile?.job_title && profile?.company
                    ? `${profile.job_title} at ${profile.company}`
                    : profile?.job_title ?? 'Add a headline')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-medium">About</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 px-5 pb-5">
            {editing ? (
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community about yourself…"
                rows={3}
                className="resize-none text-sm"
              />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profile?.bio ?? 'No bio yet. Click Edit to add one.'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
              Education
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 px-5 pb-5 space-y-3">
            {editing ? (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">University</Label>
                  <Input className="h-9" value={university} onChange={(e) => setUniversity(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Major</Label>
                    <Input className="h-9" value={major} onChange={(e) => setMajor(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Graduation Year</Label>
                    <Input
                      className="h-9"
                      type="number"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="2024"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-0.5 text-sm">
                <p className="font-medium">{profile?.university ?? '—'}</p>
                <p className="text-muted-foreground text-xs">
                  {profile?.major}
                  {profile?.graduation_year ? ` · Class of ${profile.graduation_year}` : ''}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Career */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building className="h-3.5 w-3.5 text-muted-foreground" />
              Career
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 px-5 pb-5">
            {editing ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Job Title</Label>
                  <Input className="h-9" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Company</Label>
                  <Input className="h-9" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
              </div>
            ) : (
              <p className="text-sm">
                {profile?.job_title ? (
                  <>
                    <span className="font-medium">{profile.job_title}</span>
                    {profile?.company && <span className="text-muted-foreground"> at {profile.company}</span>}
                  </>
                ) : (
                  <span className="text-muted-foreground">No career info yet</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-medium">Goals</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 px-5 pb-5">
            {editing ? (
              <Textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="What are you hoping to achieve through ConnectUni?"
                rows={3}
                className="resize-none text-sm"
              />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profile?.goals ?? 'No goals set yet.'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
