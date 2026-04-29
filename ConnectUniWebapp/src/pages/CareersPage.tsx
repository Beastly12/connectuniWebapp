import { useState } from 'react'
import { Search, MapPin, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout, C, avatarBg, useDarkMode } from '@/components/layouts/DashboardLayout'
import { useJobs, useMyApplications } from '@/hooks/useCareers'
import type { Job } from '@/hooks/useCareers'
import { useAuth } from '@/hooks/useAuth'
import { api, getErrorMessage } from '@/lib/api'

const JOB_FILTERS = ['All', 'Full-time', 'Part-time', 'Internship', 'Contract', 'Remote']
const TYPE_COLORS: Record<string, string> = { 'full-time': C.charcoal, 'internship': C.orange, 'contract': '#8B5A2A', 'part-time': '#5A4A8A', 'remote': '#3A7A6A' }

function Eyebrow({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <span style={{ color: C.orange, fontSize: 14, lineHeight: 1 }}>•</span>
      <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: C.secondary }}>{label}</span>
    </div>
  )
}

// ─── Apply Modal ──────────────────────────────────────────────────────────────
function ApplyModal({ job, dark, onClose }: { job: Job; dark: boolean; onClose: () => void }) {
  const [cover, setCover] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    try {
      await api.post(`/jobs/${job.id}/apply`, { cover_letter: cover })
      setSubmitted(true)
      toast.success('Application submitted!')
      setTimeout(onClose, 1200)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to submit application'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 500, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 600, width: 'min(480px, calc(100vw - 32px))', background: dark ? '#161616' : C.white, borderRadius: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.2)', animation: 'fadeUp 0.22s ease-out' }}>
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translate(-50%,-46%); } to { opacity:1; transform:translate(-50%,-50%); } }`}</style>
        <div style={{ padding: '24px 24px 20px', borderBottom: `1px solid ${dark ? '#2A2A2A' : C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: dark ? C.darkText : C.charcoal }}>{job.title}</div>
            <div style={{ fontSize: 13, color: C.secondary }}>{job.company}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: `1px solid ${dark ? '#333' : C.border}`, borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.secondary, fontSize: 18 }}>×</button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <Eyebrow label="Cover Letter (Optional)" />
          <textarea value={cover} onChange={e => setCover(e.target.value)}
            placeholder="Tell us why you're a great fit for this role…"
            style={{ width: '100%', borderRadius: 14, border: `1.5px solid ${dark ? '#2A2A2A' : C.border}`, padding: '14px', fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', color: dark ? C.darkText : C.charcoal, resize: 'none' as const, height: 120, outline: 'none', lineHeight: 1.55, background: dark ? '#1A1A1A' : '#FAFAF8', marginBottom: 16, boxSizing: 'border-box' as const }} />
          <button onClick={handleSubmit} disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: 100, border: 'none', background: submitted ? C.mint : C.orange, color: submitted ? '#2A6A20' : C.white, fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'background 0.25s' }}>
            {submitted ? '✓ Application Submitted' : loading ? 'Submitting…' : <>Submit Application <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle' }}><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></>}
          </button>
          {job.apply_url && (
            <button onClick={() => window.open(job.apply_url, '_blank')} style={{ width: '100%', marginTop: 10, padding: '12px', borderRadius: 100, border: `1.5px solid ${dark ? '#333' : C.border}`, background: 'transparent', color: C.secondary, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              Apply on {job.company} site <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </button>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, dark, onSelect }: { job: Job; dark: boolean; onSelect: (j: Job) => void }) {
  const [hov, setHov] = useState(false)
  const typeKey = (job.job_type ?? '').toLowerCase()
  const typeColor = TYPE_COLORS[typeKey] ?? C.secondary
  const bg = dark ? '#1A1A1A' : C.white

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onSelect(job)}
      style={{ background: bg, borderRadius: 18, border: `1px solid ${dark ? '#2A2A2A' : C.border}`, padding: '20px 22px', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', transform: hov ? 'translateY(-3px)' : 'none', boxShadow: hov ? `0 10px 28px rgba(0,0,0,${dark ? 0.25 : 0.09})` : 'none', display: 'flex', gap: 16, alignItems: 'flex-start' }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 14, background: avatarBg(job.company), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18, fontWeight: 800, color: C.white }}>
        {job.company.charAt(0)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: dark ? C.darkText : C.charcoal }}>{job.title}</div>
            <div style={{ fontSize: 13, color: C.secondary }}>
              {job.company}
              <span style={{ display: 'inline-block', marginLeft: 8, padding: '2px 9px', borderRadius: 100, fontSize: 11, fontWeight: 600, border: `1px solid ${typeColor}`, color: typeColor }}>{job.job_type}</span>
            </div>
          </div>
          <button onClick={e => { e.stopPropagation(); onSelect(job) }} style={{ display: 'flex', alignItems: 'center', gap: 5, background: C.orange, color: C.white, border: 'none', borderRadius: 100, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Apply <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
          </button>
        </div>
        <p style={{ fontSize: 13, color: C.secondary, lineHeight: 1.55, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' as const }}>{job.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' as const }}>
          {job.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.tertiary }}><MapPin style={{ width: 12, height: 12 }} />{job.location}</span>}
          {job.salary_range && <span style={{ fontSize: 12, color: C.tertiary }}>{job.salary_range}</span>}
        </div>
      </div>
    </div>
  )
}

// ─── Job Detail ───────────────────────────────────────────────────────────────
function JobDetailView({ job, dark, onBack }: { job: Job; dark: boolean; onBack: () => void }) {
  const [applyOpen, setApplyOpen] = useState(false)
  const cardBg = dark ? '#1A1A1A' : C.white

  return (
    <div style={{ maxWidth: 760 }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: C.secondary, fontSize: 13, fontWeight: 600, marginBottom: 20, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        <ChevronLeft style={{ width: 16, height: 16 }} /> Back to Jobs
      </button>
      <div style={{ borderRadius: 24, overflow: 'hidden', background: cardBg, boxShadow: `0 4px 24px rgba(0,0,0,${dark ? 0.25 : 0.07})` }}>
        <div style={{ height: 200, position: 'relative', background: 'linear-gradient(145deg, #4A6A8A 0%, #6A8FAA 40%, #5A7A9A 70%, #3A5A7A 100%)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.55) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', bottom: 20, left: 24, display: 'flex', alignItems: 'flex-end', gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: avatarBg(job.company), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: C.white, border: '3px solid white' }}>{job.company.charAt(0)}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.white, lineHeight: 1.1 }}>{job.title}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{job.company}</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const, marginBottom: 24 }}>
            {[
              { icon: '💼', label: job.job_type },
              ...(job.location ? [{ icon: '📍', label: job.location }] : []),
              ...(job.salary_range ? [{ icon: '💰', label: job.salary_range }] : []),
            ].map(p => (
              <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 100, border: `1.5px solid ${dark ? '#2A5A2A' : '#A8CC88'}`, background: dark ? 'rgba(212,232,184,0.08)' : 'rgba(212,232,184,0.2)', fontSize: 13, fontWeight: 600, color: dark ? '#7AB87A' : '#3A6A30' }}>
                {p.label}
              </div>
            ))}
          </div>
          <Eyebrow label="About this Role" />
          <p style={{ fontSize: 15, color: C.secondary, lineHeight: 1.7, marginBottom: 24 }}>{job.description}</p>
          <div style={{ height: 1, background: dark ? '#2A2A2A' : C.border, marginBottom: 24 }} />
          <button onClick={() => setApplyOpen(true)} style={{ width: '100%', padding: '16px', borderRadius: 100, border: 'none', background: C.orange, color: C.white, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            Apply for this Role <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
          </button>
          {job.apply_url && <button onClick={() => window.open(job.apply_url, '_blank')} style={{ width: '100%', marginTop: 10, padding: '14px', borderRadius: 100, border: `1.5px solid ${dark ? '#333' : C.border}`, background: 'transparent', color: C.secondary, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Apply on {job.company} site ↗</button>}
        </div>
      </div>
      {applyOpen && <ApplyModal job={job} dark={dark} onClose={() => setApplyOpen(false)} />}
    </div>
  )
}

// ─── My Applications ──────────────────────────────────────────────────────────
function MyApplicationsView({ dark }: { dark: boolean }) {
  const { profile } = useAuth()
  const { data: applications = [] } = useMyApplications(profile?.user_id)
  const bg = dark ? '#1A1A1A' : C.white
  const textColor = dark ? C.darkText : C.charcoal
  const STEPS = ['Applied', 'Reviewing', 'Interview', 'Offer', 'Decision']

  if (applications.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: dark ? '#2A2A2A' : '#F0EDE6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: dark ? C.darkText : C.charcoal, marginBottom: 8 }}>No applications yet</div>
      <div style={{ fontSize: 14, color: C.secondary }}>Start applying to track your progress here</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {applications.map(app => (
        <div key={app.id} style={{ background: bg, borderRadius: 20, border: `1px solid ${dark ? '#2A2A2A' : C.border}`, padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: avatarBg(app.job?.company ?? 'C'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: C.white }}>
              {(app.job?.company ?? 'C').charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: textColor }}>{app.job?.title ?? 'Role'}</div>
              <div style={{ fontSize: 13, color: C.secondary }}>{app.job?.company ?? 'Company'}</div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: app.status === 'accepted' ? C.mint : app.status === 'rejected' ? 'rgba(220,50,50,0.1)' : (dark ? '#2A2A2A' : '#F0EDE6'), color: app.status === 'accepted' ? '#3A8A30' : app.status === 'rejected' ? '#D04040' : C.secondary, textTransform: 'capitalize' as const }}>
              {app.status}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 0 }}>
            {STEPS.map((step, i) => {
              const stepIdx = i + 1
              const done = stepIdx < 2
              const active = stepIdx === 2
              return (
                <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
                  {i < STEPS.length - 1 && <div style={{ position: 'absolute', left: '50%', top: 13, width: '100%', height: 2, background: done ? C.mint : (dark ? '#2A2A2A' : C.border), zIndex: 0 }} />}
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: done ? C.mint : active ? C.orange : 'transparent', border: `2px solid ${done ? C.mint : active ? C.orange : (dark ? '#2A2A2A' : C.border)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, flexShrink: 0 }}>
                    {done && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polyline points="2 5 4 7 8 3" stroke="#2A6A20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.white }} />}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: done || active ? 700 : 500, color: done ? '#3A8A30' : active ? C.orange : C.tertiary, textAlign: 'center', lineHeight: 1.2 }}>{step}</div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Post Job ─────────────────────────────────────────────────────────────────
function PostJobView({ dark }: { dark: boolean }) {
  const [form, setForm] = useState({ title: '', company: '', type: 'Full-time', desc: '', location: '', salaryMin: '', salaryMax: '', externalUrl: '' })
  const [published, setPublished] = useState(false)
  const [loading, setLoading] = useState(false)
  const cardBg = dark ? '#1A1A1A' : C.white
  const textColor = dark ? C.darkText : C.charcoal

  const inputStyle: React.CSSProperties = { width: '100%', borderRadius: 12, border: `1.5px solid ${dark ? '#2A2A2A' : C.border}`, padding: '12px 14px', fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', color: textColor, background: dark ? '#161616' : '#FAFAF8', outline: 'none', lineHeight: 1.5, boxSizing: 'border-box' as const }

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.secondary, marginBottom: 7, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>{label}</div>
      {children}
    </div>
  )

  const Divider = ({ label }: { label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '28px 0 22px' }}>
      <div style={{ flex: 1, height: 1.5, background: dark ? '#2A5A2A' : '#C8E8A8', borderRadius: 2 }} />
      <Eyebrow label={label} />
      <div style={{ flex: 1, height: 1.5, background: dark ? '#2A5A2A' : '#C8E8A8', borderRadius: 2 }} />
    </div>
  )

  async function handlePublish() {
    if (!form.title || !form.company) { toast.error('Please fill in title and company'); return }
    setLoading(true)
    try {
      await api.post('/jobs', { title: form.title, company: form.company, job_type: form.type, description: form.desc, location: form.location, salary_range: form.salaryMin && form.salaryMax ? `${form.salaryMin}–${form.salaryMax}` : undefined, apply_url: form.externalUrl || undefined })
      setPublished(true)
      toast.success('Job published!')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to publish job'))
    } finally { setLoading(false) }
  }

  if (published) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 40px', textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2A6A20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: dark ? C.darkText : C.charcoal, marginBottom: 10 }}>Job Published!</div>
      <div style={{ fontSize: 15, color: C.secondary, maxWidth: 360 }}>Your listing for <strong>{form.title}</strong> at <strong>{form.company}</strong> is now live.</div>
      <button onClick={() => { setPublished(false); setForm({ title: '', company: '', type: 'Full-time', desc: '', location: '', salaryMin: '', salaryMax: '', externalUrl: '' }) }} style={{ marginTop: 24, padding: '12px 28px', borderRadius: 100, border: 'none', background: C.orange, color: C.white, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Post Another Job ↗</button>
    </div>
  )

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ background: cardBg, borderRadius: 24, border: `1px solid ${dark ? '#2A2A2A' : C.border}`, padding: '32px' }}>
        <Divider label="Basics" />
        <Field label="Job Title"><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Product Designer" style={inputStyle} /></Field>
        <Field label="Company"><input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="e.g. Acme Corp" style={inputStyle} /></Field>
        <Field label="Job Type">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            {['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'].map(t => (
              <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{ padding: '8px 16px', borderRadius: 100, border: `1.5px solid ${form.type === t ? C.orange : (dark ? '#333' : C.border)}`, background: form.type === t ? 'rgba(239,75,36,0.08)' : 'transparent', color: form.type === t ? C.orange : textColor, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t}</button>
            ))}
          </div>
        </Field>
        <Divider label="Details" />
        <Field label="Description"><textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="Describe the role, responsibilities, and ideal candidate…" style={{ ...inputStyle, height: 120, resize: 'none' } as React.CSSProperties} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Location"><input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. London / Remote" style={inputStyle} /></Field>
          <Field label="Salary Range">
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={form.salaryMin} onChange={e => setForm(f => ({ ...f, salaryMin: e.target.value }))} placeholder="Min" style={inputStyle} />
              <input value={form.salaryMax} onChange={e => setForm(f => ({ ...f, salaryMax: e.target.value }))} placeholder="Max" style={inputStyle} />
            </div>
          </Field>
        </div>
        <Divider label="Application" />
        <Field label="External Application URL (Optional)"><input value={form.externalUrl} onChange={e => setForm(f => ({ ...f, externalUrl: e.target.value }))} placeholder="https://yourcompany.com/careers/…" style={inputStyle} /></Field>
        <button onClick={handlePublish} disabled={loading} style={{ width: '100%', marginTop: 8, padding: '16px', borderRadius: 100, border: 'none', background: loading ? C.mint : C.orange, color: loading ? C.charcoal : C.white, fontSize: 16, fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          {loading ? 'Publishing…' : <>Publish Job <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></>}
        </button>
      </div>
    </div>
  )
}

// ─── Browse Jobs ──────────────────────────────────────────────────────────────
function BrowseJobsView({ dark, canPost }: { dark: boolean; canPost: boolean }) {
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Job | null>(null)
  const [subPage, setSubPage] = useState<'browse' | 'applications' | 'post'>('browse')
  const { data: jobs = [], isLoading } = useJobs()
  const textColor = dark ? C.darkText : C.charcoal

  const filtered = jobs.filter(j => {
    if (filter !== 'All' && j.job_type.toLowerCase() !== filter.toLowerCase()) return false
    if (query && !j.title.toLowerCase().includes(query.toLowerCase()) && !j.company.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  const tabs = ['browse', 'applications', ...(canPost ? ['post'] : [])] as const
  const tabLabels: Record<string, string> = { browse: 'Browse Jobs', applications: 'My Applications', post: 'Post a Job' }

  if (selected) return <JobDetailView job={selected} dark={dark} onBack={() => setSelected(null)} />

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' as const }}>
        {tabs.map(p => (
          <button key={p} onClick={() => setSubPage(p as typeof subPage)}
            style={{ padding: '9px 20px', borderRadius: 100, border: `1.5px solid ${subPage === p ? C.orange : (dark ? '#333' : C.border)}`, background: subPage === p ? 'rgba(239,75,36,0.08)' : 'transparent', color: subPage === p ? C.orange : textColor, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {tabLabels[p]}
          </button>
        ))}
      </div>

      {subPage === 'applications' ? <MyApplicationsView dark={dark} /> : subPage === 'post' ? <PostJobView dark={dark} /> : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 100, background: dark ? '#1A1A1A' : C.white, border: `1.5px solid ${dark ? '#2A2A2A' : C.border}`, marginBottom: 16 }}>
            <Search style={{ width: 16, height: 16, color: C.tertiary, flexShrink: 0 }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search jobs, companies…"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: textColor, fontFamily: 'Plus Jakarta Sans, sans-serif' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 24 }}>
            {JOB_FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '7px 16px', borderRadius: 100, border: `1.5px solid ${filter === f ? C.orange : (dark ? '#333' : C.border)}`, background: filter === f ? C.orange : 'transparent', color: filter === f ? C.white : textColor, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{f}</button>
            ))}
          </div>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Array.from({ length: 3 }).map((_, i) => <div key={i} style={{ height: 120, borderRadius: 18, background: dark ? '#1A1A1A' : '#F0EDE6' }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: C.tertiary, fontSize: 15 }}>No jobs match your search.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(j => <JobCard key={j.id} job={j} dark={dark} onSelect={setSelected} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function CareersPageContent() {
  const { dark } = useDarkMode()
  const { role } = useAuth()
  const canPost = role === 'ALUMNI' || role === 'MENTOR' || role === 'PROFESSIONAL'
  return <BrowseJobsView dark={dark} canPost={canPost} />
}

export default function CareersPage() {
  return (
    <DashboardLayout>
      <CareersPageContent />
    </DashboardLayout>
  )
}
