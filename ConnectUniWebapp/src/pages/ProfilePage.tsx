import { useState, useRef } from 'react'
import {
  Camera, GraduationCap, Building, Pencil, Check, X, Loader2,
  Briefcase, Award, Heart, Target, Link, Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout, C, avatarBg, useDarkMode } from '@/components/layouts/DashboardLayout'
import { VerificationBadge } from '@/components/ui/VerificationBadge'
import { useAuth } from '@/hooks/useAuth'
import {
  useFullProfile, useProfileCompletion,
  useCreateStudentProfile, useCreateAlumniProfile, useCreateProfessionalProfile,
} from '@/hooks/useOnboarding'
import { api, getErrorMessage } from '@/lib/api'

// ─── Shared primitives ────────────────────────────────────────────────────────
function SectionCard({ title, icon: IconComp, dark, iconBg, children }: {
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any
  dark: boolean
  iconBg?: string
  children: React.ReactNode
}) {
  return (
    <div style={{
      borderRadius: 20,
      border: `1.5px solid ${dark ? '#2A2A2A' : '#B8DCA0'}`,
      background: dark ? 'rgba(212,232,184,0.04)' : 'rgba(212,232,184,0.06)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 20px',
        borderBottom: `1px solid ${dark ? '#2A2A2A' : '#D8EDCA'}`,
      }}>
        {IconComp && (
          <div style={{
            width: 30, height: 30, borderRadius: 10,
            background: iconBg ?? (dark ? '#1A2A1A' : 'rgba(212,232,184,0.5)'),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconComp style={{ width: 15, height: 15, color: dark ? C.mint : '#4A7A40' }} />
          </div>
        )}
        <span style={{ fontSize: 14, fontWeight: 700, color: dark ? C.darkText : C.charcoal }}>{title}</span>
      </div>
      <div style={{ padding: '16px 20px' }}>
        {children}
      </div>
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

const fieldLabel = (_dark: boolean): React.CSSProperties => ({
  fontSize: 11, fontWeight: 700, color: C.secondary, marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '0.05em',
  display: 'block',
})

// ─── Tag Input ────────────────────────────────────────────────────────────────
function TagInput({ tags, onChange, dark, placeholder }: {
  tags: string[]; onChange: (t: string[]) => void; dark: boolean; placeholder?: string
}) {
  const [input, setInput] = useState('')
  function add() {
    const v = input.trim()
    if (v && !tags.includes(v)) onChange([...tags, v])
    setInput('')
  }
  function remove(t: string) { onChange(tags.filter(x => x !== t)) }
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginBottom: tags.length ? 10 : 0 }}>
        {tags.map(t => (
          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: dark ? '#1A2A1A' : C.mint, color: dark ? '#A0D080' : '#2A6A20' }}>
            {t}
            <button onClick={() => remove(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}>
              <X style={{ width: 11, height: 11 }} />
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder ?? 'Type and press Enter…'}
          style={{ ...inputStyle(dark), flex: 1 }}
        />
        <button onClick={add} style={{ padding: '10px 14px', borderRadius: 12, border: 'none', background: C.orange, color: C.white, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', flexShrink: 0 }}>Add</button>
      </div>
    </div>
  )
}

// ─── Completion Bar ───────────────────────────────────────────────────────────
function CompletionBar({ dark }: { dark: boolean }) {
  const { data } = useProfileCompletion()
  if (!data || data.percentage >= 100) return null
  const pct = data.percentage
  return (
    <div style={{ borderRadius: 18, background: dark ? '#161616' : C.white, border: `1px solid ${dark ? '#2A2A2A' : C.border}`, padding: '16px 20px', marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: dark ? C.darkText : C.charcoal }}>Profile Completion</span>
        <span style={{ fontSize: 20, fontWeight: 800, color: C.orange, letterSpacing: '-0.02em' }}>{pct}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: dark ? '#2A2A2A' : '#F0EDE6', overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${C.orange}, #F87848)`, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
      {data.missing_fields.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
          {data.missing_fields.map(f => (
            <span key={f} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 100, background: dark ? '#1A1A1A' : '#F7F5F0', border: `1px solid ${dark ? '#333' : C.border}`, color: C.secondary }}>
              + {f}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Verification status pill ─────────────────────────────────────────────────
function VerifPill({ status, dark }: { status?: string; dark: boolean }) {
  const map: Record<string, { label: string; bg: string; text: string }> = {
    verified:      { label: '✓ Verified',      bg: C.mint,           text: '#2A6A20' },
    self_declared: { label: '⚡ Self-Declared', bg: 'rgba(239,75,36,0.12)', text: C.orange },
    pending:       { label: '⏳ Pending Review',bg: '#FFF3CD',        text: '#856404' },
    unverified:    { label: 'Unverified',       bg: dark ? '#2A2A2A' : '#F0EDE6', text: C.secondary },
  }
  const s = map[status ?? 'unverified'] ?? map.unverified
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: s.bg, color: s.text }}>{s.label}</span>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function ProfilePageContent() {
  const { profile, refreshProfile } = useAuth()
  const { data: fullProfile, refetch: refetchFull } = useFullProfile()
  const { dark } = useDarkMode()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const certInputRef = useRef<HTMLInputElement>(null)

  // Basic profile fields
  const [headline, setHeadline] = useState(profile?.headline ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [goals, setGoals] = useState(profile?.goals ?? '')
  const [skills, setSkills] = useState<string[]>(profile?.skills ?? [])
  const [interests, setInterests] = useState<string[]>(profile?.interests ?? [])

  // Student profile fields
  const sp = fullProfile?.student_profile
  const [uniName, setUniName] = useState(sp?.university_name ?? '')
  const [courseTitle, setCourseTitle] = useState(sp?.course_title ?? '')
  const [yearOfStudy, setYearOfStudy] = useState(String(sp?.year_of_study ?? ''))
  const [expectedGrad, setExpectedGrad] = useState(String(sp?.expected_graduation ?? ''))

  // Alumni profile fields
  const ap = fullProfile?.alumni_profile
  const [alumniUni, setAlumniUni] = useState(ap?.university_name ?? '')
  const [courseCompleted, setCourseCompleted] = useState(ap?.course_completed ?? '')
  const [alumniGradYear, setAlumniGradYear] = useState(String(ap?.graduation_year ?? ''))

  // Professional profile fields
  const pp = fullProfile?.professional_profile
  const [jobTitle, setJobTitle] = useState(pp?.job_title ?? profile?.job_title ?? '')
  const [company, setCompany] = useState(pp?.company ?? profile?.company ?? '')
  const [industrySector, setIndustrySector] = useState(pp?.industry_sector ?? '')
  const [yearsExp, setYearsExp] = useState(String(pp?.years_of_experience ?? ''))
  const [linkedinUrl, setLinkedinUrl] = useState(pp?.linkedin_url ?? '')

  const updateStudent = useCreateStudentProfile()
  const updateAlumni = useCreateAlumniProfile()
  const updateProfessional = useCreateProfessionalProfile()

  function startEdit() {
    setHeadline(profile?.headline ?? '')
    setBio(profile?.bio ?? '')
    setGoals(profile?.goals ?? '')
    setSkills(profile?.skills ?? [])
    setInterests(profile?.interests ?? [])
    const sp2 = fullProfile?.student_profile
    setUniName(sp2?.university_name ?? '')
    setCourseTitle(sp2?.course_title ?? '')
    setYearOfStudy(String(sp2?.year_of_study ?? ''))
    setExpectedGrad(String(sp2?.expected_graduation ?? ''))
    const ap2 = fullProfile?.alumni_profile
    setAlumniUni(ap2?.university_name ?? '')
    setCourseCompleted(ap2?.course_completed ?? '')
    setAlumniGradYear(String(ap2?.graduation_year ?? ''))
    const pp2 = fullProfile?.professional_profile
    setJobTitle(pp2?.job_title ?? profile?.job_title ?? '')
    setCompany(pp2?.company ?? profile?.company ?? '')
    setIndustrySector(pp2?.industry_sector ?? '')
    setYearsExp(String(pp2?.years_of_experience ?? ''))
    setLinkedinUrl(pp2?.linkedin_url ?? '')
    setEditing(true)
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return }
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      await api.putForm('/profiles/me/avatar', fd)
      await refreshProfile()
      toast.success('Profile picture updated!')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to upload profile picture'))
    } finally { setUploadingAvatar(false) }
  }

  async function handleCertUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (certInputRef.current) certInputRef.current.value = ''
    if (!file || !ap) return
    try {
      await updateAlumni.mutateAsync({
        university_name: ap.university_name,
        course_completed: ap.course_completed,
        graduation_year: ap.graduation_year,
        certificate: file,
      })
      await refetchFull()
      toast.success('Certificate uploaded! Under review.')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to upload certificate'))
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      // Save basic profile
      await api.patch('/profiles/me', {
        headline: headline || null,
        bio: bio || null,
        goals: goals || null,
        skills,
        interests,
      })

      // Save role-specific profile
      const role = fullProfile?.role?.toUpperCase()
      if (role === 'STUDENT' && uniName && courseTitle && yearOfStudy && expectedGrad) {
        await updateStudent.mutateAsync({
          university_name: uniName,
          course_title: courseTitle,
          year_of_study: Number(yearOfStudy),
          expected_graduation: Number(expectedGrad),
        })
      } else if (role === 'ALUMNI' && alumniUni && courseCompleted && alumniGradYear) {
        await updateAlumni.mutateAsync({
          university_name: alumniUni,
          course_completed: courseCompleted,
          graduation_year: Number(alumniGradYear),
        })
      } else if ((role === 'PROFESSIONAL' || role === 'MENTOR') && jobTitle && company && industrySector && yearsExp) {
        await updateProfessional.mutateAsync({
          job_title: jobTitle,
          company,
          industry_sector: industrySector,
          years_of_experience: Number(yearsExp),
          linkedin_url: linkedinUrl || undefined,
        })
      }

      await refreshProfile()
      await refetchFull()
      setEditing(false)
      toast.success('Profile saved!')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save profile'))
    } finally { setSaving(false) }
  }

  const userName = profile?.full_name ?? 'User'
  const role = fullProfile?.role?.toUpperCase()
  const cardBg = dark ? '#1A1A1A' : C.white
  const borderC = dark ? '#2A2A2A' : C.border

  return (
    <div style={{ maxWidth: 620, margin: '0 auto' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Banner + Avatar */}
      <div style={{ position: 'relative', marginBottom: 56 }}>
        <div style={{ height: 175, borderRadius: 24, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, #B87040 0%, #D4935A 40%, #C08060 70%, #8B5030 100%)' }} />
        </div>
        <div style={{ position: 'absolute', left: 28, bottom: -44, zIndex: 10 }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={userName} style={{ width: 90, height: 90, borderRadius: '50%', border: `4px solid ${dark ? '#0E0E0E' : C.pageBg}`, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 90, height: 90, borderRadius: '50%', background: avatarBg(userName), border: `4px solid ${dark ? '#0E0E0E' : C.pageBg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700, color: C.white }}>
                {userName.charAt(0)}
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar} style={{ position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: '50%', background: C.orange, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white }}>
              {uploadingAvatar ? <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> : <Camera style={{ width: 13, height: 13 }} />}
            </button>
          </div>
        </div>
      </div>

      {/* Name row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, paddingLeft: 4 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: dark ? C.darkText : C.charcoal, margin: 0, letterSpacing: '-0.01em' }}>{userName}</h1>
            {fullProfile && <VerificationBadge status={fullProfile.verification_status} />}
            {fullProfile && <VerifPill status={fullProfile.verification_status} dark={dark} />}
          </div>
          <p style={{ fontSize: 13, color: C.secondary, marginTop: 4, marginBottom: 0 }}>
            {profile?.headline || (pp ? `${pp.job_title} at ${pp.company}` : sp ? `${sp.course_title} · Year ${sp.year_of_study}` : ap ? `${ap.course_completed}, ${ap.graduation_year}` : 'Add a headline')}
          </p>
        </div>
        {!editing ? (
          <button onClick={startEdit} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 100, background: cardBg, border: `1.5px solid ${borderC}`, fontSize: 13, fontWeight: 600, color: dark ? C.darkText : C.charcoal, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', flexShrink: 0 }}>
            <Pencil style={{ width: 13, height: 13 }} /> Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={() => setEditing(false)} style={{ padding: '9px 14px', borderRadius: 100, background: 'transparent', border: `1.5px solid ${borderC}`, fontSize: 13, fontWeight: 600, color: C.secondary, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}>
              <X style={{ width: 13, height: 13 }} /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} style={{ padding: '9px 18px', borderRadius: 100, background: saving ? C.mint : C.orange, border: 'none', fontSize: 13, fontWeight: 600, color: saving ? C.charcoal : C.white, cursor: saving ? 'default' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5, transition: 'background 0.25s' }}>
              {saving ? <><span style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />Saving…</> : <><Check style={{ width: 13, height: 13 }} />Save</>}
            </button>
          </div>
        )}
      </div>

      {/* Profile completion */}
      <CompletionBar dark={dark} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* About */}
        <SectionCard title="About" dark={dark}>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={fieldLabel(dark)}>Headline</label>
                <input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. Software Engineer at Google" style={inputStyle(dark)} />
              </div>
              <div>
                <label style={fieldLabel(dark)}>Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell the community about yourself…" rows={3} style={{ ...inputStyle(dark), resize: 'none', lineHeight: 1.55 } as React.CSSProperties} />
              </div>
              <div>
                <label style={fieldLabel(dark)}>Goals</label>
                <textarea value={goals} onChange={e => setGoals(e.target.value)} placeholder="What are you hoping to achieve through ConnectUni?" rows={2} style={{ ...inputStyle(dark), resize: 'none', lineHeight: 1.55 } as React.CSSProperties} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.65, margin: 0 }}>{profile?.bio ?? <span style={{ color: C.tertiary }}>No bio yet — click Edit to add one.</span>}</p>
              {profile?.goals && (
                <div style={{ paddingTop: 12, borderTop: `1px solid ${borderC}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Goals</div>
                  <p style={{ fontSize: 13, color: C.secondary, lineHeight: 1.6, margin: 0 }}>{profile.goals}</p>
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* Skills */}
        <SectionCard title="Skills" icon={Award} dark={dark} iconBg={dark ? '#1A1A2A' : 'rgba(200,184,224,0.4)'}>
          {editing ? (
            <TagInput tags={skills} onChange={setSkills} dark={dark} placeholder="e.g. Python, Product Management…" />
          ) : (
            (profile?.skills ?? []).length === 0
              ? <span style={{ fontSize: 13, color: C.tertiary }}>No skills added yet.</span>
              : <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 7 }}>
                  {(profile?.skills ?? []).map((s: string) => (
                    <span key={s} style={{ padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: dark ? '#1A2A1A' : C.mint, color: dark ? '#A0D080' : '#2A6A20' }}>{s}</span>
                  ))}
                </div>
          )}
        </SectionCard>

        {/* Interests */}
        <SectionCard title="Interests" icon={Heart} dark={dark} iconBg={dark ? '#2A1A1A' : 'rgba(239,75,36,0.10)'}>
          {editing ? (
            <TagInput tags={interests} onChange={setInterests} dark={dark} placeholder="e.g. Startups, AI, Design…" />
          ) : (
            (profile?.interests ?? []).length === 0
              ? <span style={{ fontSize: 13, color: C.tertiary }}>No interests added yet.</span>
              : <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 7 }}>
                  {(profile?.interests ?? []).map((i: string) => (
                    <span key={i} style={{ padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: dark ? '#2A1A1A' : 'rgba(239,75,36,0.10)', color: dark ? '#F87848' : C.orange }}>{i}</span>
                  ))}
                </div>
          )}
        </SectionCard>

        {/* Education — Student */}
        {(role === 'STUDENT' || sp) && (
          <SectionCard title="Education" icon={GraduationCap} dark={dark}>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={fieldLabel(dark)}>University</label>
                  <input value={uniName} onChange={e => setUniName(e.target.value)} style={inputStyle(dark)} placeholder="e.g. University of Oxford" />
                </div>
                <div>
                  <label style={fieldLabel(dark)}>Course / Programme</label>
                  <input value={courseTitle} onChange={e => setCourseTitle(e.target.value)} style={inputStyle(dark)} placeholder="e.g. BSc Computer Science" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={fieldLabel(dark)}>Year of Study</label>
                    <input type="number" min={1} max={10} value={yearOfStudy} onChange={e => setYearOfStudy(e.target.value)} style={inputStyle(dark)} placeholder="e.g. 2" />
                  </div>
                  <div>
                    <label style={fieldLabel(dark)}>Expected Graduation</label>
                    <input type="number" min={2024} max={2040} value={expectedGrad} onChange={e => setExpectedGrad(e.target.value)} style={inputStyle(dark)} placeholder="e.g. 2027" />
                  </div>
                </div>
              </div>
            ) : sp ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: dark ? C.darkText : C.charcoal }}>{sp.university_name}</div>
                <div style={{ fontSize: 13, color: C.secondary }}>{sp.course_title}</div>
                <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 100, background: dark ? '#1A2A1A' : C.mint, color: dark ? '#A0D080' : '#2A6A20', fontWeight: 600 }}>Year {sp.year_of_study}</span>
                  <span style={{ fontSize: 12, color: C.tertiary }}>Graduating {sp.expected_graduation}</span>
                </div>
              </div>
            ) : <span style={{ fontSize: 13, color: C.tertiary }}>No education info yet — click Edit to add.</span>}
          </SectionCard>
        )}

        {/* Education — Alumni */}
        {(role === 'ALUMNI' || ap) && (
          <SectionCard title="Education" icon={GraduationCap} dark={dark}>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={fieldLabel(dark)}>University</label>
                  <input value={alumniUni} onChange={e => setAlumniUni(e.target.value)} style={inputStyle(dark)} placeholder="e.g. University of Oxford" />
                </div>
                <div>
                  <label style={fieldLabel(dark)}>Degree / Course Completed</label>
                  <input value={courseCompleted} onChange={e => setCourseCompleted(e.target.value)} style={inputStyle(dark)} placeholder="e.g. BSc Computer Science" />
                </div>
                <div>
                  <label style={fieldLabel(dark)}>Graduation Year</label>
                  <input type="number" max={2025} value={alumniGradYear} onChange={e => setAlumniGradYear(e.target.value)} style={inputStyle(dark)} placeholder="e.g. 2023" />
                </div>
              </div>
            ) : ap ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: dark ? C.darkText : C.charcoal }}>{ap.university_name}</div>
                <div style={{ fontSize: 13, color: C.secondary }}>{ap.course_completed}</div>
                <div style={{ fontSize: 12, color: C.tertiary, marginTop: 2 }}>Class of {ap.graduation_year}</div>
                {/* Certificate */}
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${borderC}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Verification Certificate</div>
                  {ap.certificate_url ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 100, background: C.mint, color: '#2A6A20' }}>✓ Uploaded</span>
                      <span style={{ fontSize: 11, color: C.tertiary }}>{ap.certificate_uploaded_at ? new Date(ap.certificate_uploaded_at).toLocaleDateString() : ''}</span>
                      <input ref={certInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleCertUpload} />
                      <button onClick={() => certInputRef.current?.click()} style={{ fontSize: 11, color: C.orange, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', textDecoration: 'underline' }}>Replace</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, color: C.tertiary }}>No certificate uploaded</span>
                      <input ref={certInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleCertUpload} />
                      <button onClick={() => certInputRef.current?.click()} style={{ padding: '6px 14px', borderRadius: 100, border: `1px solid ${C.orange}`, background: 'transparent', color: C.orange, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Upload Certificate ↗</button>
                    </div>
                  )}
                </div>
              </div>
            ) : <span style={{ fontSize: 13, color: C.tertiary }}>No education info yet — click Edit to add.</span>}
          </SectionCard>
        )}

        {/* Career — Professional / Alumni / Mentor */}
        {(role === 'PROFESSIONAL' || role === 'MENTOR' || pp) && (
          <SectionCard title="Career" icon={Building} dark={dark} iconBg={dark ? '#2A1A1A' : 'rgba(239,75,36,0.12)'}>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={fieldLabel(dark)}>Job Title</label>
                    <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} style={inputStyle(dark)} placeholder="e.g. Software Engineer" />
                  </div>
                  <div>
                    <label style={fieldLabel(dark)}>Company</label>
                    <input value={company} onChange={e => setCompany(e.target.value)} style={inputStyle(dark)} placeholder="e.g. Google" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={fieldLabel(dark)}>Industry</label>
                    <input value={industrySector} onChange={e => setIndustrySector(e.target.value)} style={inputStyle(dark)} placeholder="e.g. Technology" />
                  </div>
                  <div>
                    <label style={fieldLabel(dark)}>Years of Experience</label>
                    <input type="number" min={0} max={60} value={yearsExp} onChange={e => setYearsExp(e.target.value)} style={inputStyle(dark)} placeholder="e.g. 5" />
                  </div>
                </div>
                <div>
                  <label style={fieldLabel(dark)}>LinkedIn URL</label>
                  <input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} style={inputStyle(dark)} placeholder="https://linkedin.com/in/username" />
                </div>
              </div>
            ) : pp ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: dark ? C.darkText : C.charcoal }}>{pp.job_title} <span style={{ fontWeight: 400, color: C.secondary }}>at {pp.company}</span></div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' as const }}>
                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 100, background: dark ? '#2A1A1A' : 'rgba(239,75,36,0.10)', color: dark ? '#F87848' : C.orange, fontWeight: 600 }}>{pp.industry_sector}</span>
                  <span style={{ fontSize: 12, color: C.tertiary }}>{pp.years_of_experience} yr{pp.years_of_experience !== 1 ? 's' : ''} experience</span>
                </div>
                {pp.linkedin_url && (
                  <a href={pp.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#0A66C2', textDecoration: 'none', marginTop: 4 }}>
                    <Link style={{ width: 12, height: 12 }} /> LinkedIn Profile ↗
                  </a>
                )}
              </div>
            ) : <span style={{ fontSize: 13, color: C.tertiary }}>No career info yet — click Edit to add.</span>}
          </SectionCard>
        )}

        {/* Alumni career (lighter) */}
        {role === 'ALUMNI' && !pp && (
          <SectionCard title="Career" icon={Briefcase} dark={dark} iconBg={dark ? '#2A1A1A' : 'rgba(239,75,36,0.12)'}>
            <p style={{ fontSize: 14, color: C.secondary, margin: 0 }}>
              {profile?.job_title
                ? <><span style={{ fontWeight: 600, color: dark ? C.darkText : C.charcoal }}>{profile.job_title}</span>{profile.company && <span> at {profile.company}</span>}</>
                : <span style={{ color: C.tertiary }}>No career info yet.</span>}
            </p>
          </SectionCard>
        )}

        {/* Mentorship Preferences */}
        {fullProfile?.mentorship_preferences && (
          <SectionCard title="Mentorship" icon={Users} dark={dark} iconBg={dark ? '#1A1A2A' : 'rgba(200,184,224,0.4)'}>
            {(() => {
              const mp = fullProfile.mentorship_preferences!
              const formatMap: Record<string, string> = { chat: '💬 Chat', video: '📹 Video', in_person: '🤝 In Person' }
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {mp.is_mentor && <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100, background: C.mint, color: '#2A6A20' }}>Mentor</span>}
                    {mp.is_mentee && <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100, background: dark ? '#2A1A1A' : 'rgba(239,75,36,0.10)', color: dark ? '#F87848' : C.orange }}>Mentee</span>}
                    <span style={{ fontSize: 12, color: C.tertiary }}>{formatMap[mp.preferred_format] ?? mp.preferred_format}</span>
                    <span style={{ fontSize: 12, color: C.tertiary }}>· {mp.availability_hours_per_week}h/week</span>
                  </div>
                  {mp.areas_of_interest.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                      {mp.areas_of_interest.map(a => (
                        <span key={a} style={{ padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 500, background: dark ? '#1A2A1A' : C.mint, color: dark ? '#A0D080' : '#2A6A20' }}>{a}</span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}
          </SectionCard>
        )}

        {/* Goals (standalone if no bio section merged them) */}
        {!editing && !profile?.goals && !profile?.bio && (
          <SectionCard title="Goals" icon={Target} dark={dark}>
            <span style={{ fontSize: 13, color: C.tertiary }}>No goals set yet — click Edit to add.</span>
          </SectionCard>
        )}

      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <ProfilePageContent />
    </DashboardLayout>
  )
}
