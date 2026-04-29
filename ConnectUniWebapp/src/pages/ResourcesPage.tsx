import { useState } from 'react'
import { BookOpen, Link as LinkIcon, FileText, Video, Settings, Search, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout, C, AvatarCircle, useDarkMode } from '@/components/layouts/DashboardLayout'
import { useResources, useCreateResource } from '@/hooks/useResources'
import type { Resource } from '@/hooks/useResources'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'

const CATEGORIES = ['All', 'Career', 'Academics', 'Tech', 'Finance', 'Wellbeing', 'Other']
const RESOURCE_TYPES = ['Link', 'PDF', 'Video', 'Article', 'Tool']

const TYPE_ICON: Record<string, React.ElementType> = { Link: LinkIcon, PDF: FileText, Video: Video, Article: BookOpen, Tool: Settings }
const TYPE_COLOR: Record<string, string> = { link: '#6B7FA3', pdf: '#C4705A', video: C.orange, article: '#8B6FA8', tool: '#4A8A6A' }

function ShareModal({ onClose, dark }: { onClose: () => void; dark: boolean }) {
  const { profile } = useAuth()
  const createResource = useCreateResource()
  const [form, setForm] = useState({ title: '', url: '', category: 'career', type: 'link', desc: '' })
  const [shared, setShared] = useState(false)

  const inputStyle: React.CSSProperties = {
    width: '100%', borderRadius: 12,
    border: `1.5px solid ${dark ? '#333' : C.border}`,
    padding: '10px 14px', fontSize: 14,
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    color: dark ? C.darkText : C.charcoal,
    background: dark ? '#0E0E0E' : '#FAFAF8',
    outline: 'none', boxSizing: 'border-box',
  }

  async function handleShare() {
    if (!profile || !form.title || !form.url) return
    try {
      await createResource.mutateAsync({
        uploadedBy: profile.user_id,
        title: form.title,
        description: form.desc || undefined,
        url: form.url,
        category: form.category,
        fileType: form.type,
      })
      setShared(true)
      toast.success('Resource shared!')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to share resource'))
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 500, backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 600, width: 500,
        background: dark ? '#161616' : C.white,
        borderRadius: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
        animation: 'fadeUp 0.22s ease-out',
      }}>
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translate(-50%,-46%); } to { opacity:1; transform:translate(-50%,-50%); } }`}</style>
        <div style={{
          padding: '22px 24px 18px',
          borderBottom: `1px solid ${dark ? '#2A2A2A' : C.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: dark ? C.darkText : C.charcoal }}>Share a Resource</div>
          <button onClick={onClose} style={{ background: 'none', border: `1px solid ${dark ? '#333' : C.border}`, borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X style={{ width: 14, height: 14, color: C.secondary }} />
          </button>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          {['Title', 'URL'].map(field => (
            <div key={field} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.secondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{field}</div>
              <input
                value={(form as Record<string, string>)[field.toLowerCase()]}
                onChange={e => setForm(f => ({ ...f, [field.toLowerCase()]: e.target.value }))}
                placeholder={field === 'URL' ? 'https://…' : 'Resource title…'}
                style={inputStyle}
              />
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.secondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</div>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...inputStyle, appearance: 'none' }}>
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.secondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Type</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {RESOURCE_TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => setForm(f => ({ ...f, type: t.toLowerCase() }))}
                    style={{
                      padding: '5px 11px', borderRadius: 100,
                      border: `1.5px solid ${form.type === t.toLowerCase() ? C.orange : (dark ? '#333' : C.border)}`,
                      background: form.type === t.toLowerCase() ? 'rgba(239,75,36,0.08)' : 'transparent',
                      color: form.type === t.toLowerCase() ? C.orange : (dark ? C.darkText : C.charcoal),
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.secondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Description (Optional)</div>
            <textarea
              value={form.desc}
              onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
              placeholder="Why is this resource useful?"
              style={{ ...inputStyle, height: 80, resize: 'none', lineHeight: 1.55 } as React.CSSProperties}
            />
          </div>

          <button
            onClick={handleShare}
            disabled={createResource.isPending}
            style={{
              width: '100%', padding: 14, borderRadius: 100, border: 'none',
              background: shared ? C.mint : C.orange,
              color: shared ? '#2A6A20' : C.white,
              fontSize: 15, fontWeight: 700,
              cursor: shared ? 'default' : 'pointer',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              transition: 'background 0.25s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {shared ? '✓ Resource Shared!' : 'Share Resource ↗'}
          </button>
        </div>
      </div>
    </>
  )
}

function ResourceCard({ resource, dark }: { resource: Resource; dark: boolean }) {
  const [hov, setHov] = useState(false)
  const typeKey = (resource.file_type ?? 'link').toLowerCase()
  const color = TYPE_COLOR[typeKey] ?? C.secondary
  const IconComp = TYPE_ICON[resource.file_type ?? 'link'] ?? LinkIcon

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: dark ? '#1A1A1A' : C.white,
        borderRadius: 20,
        border: `1px solid ${dark ? '#2A2A2A' : C.border}`,
        padding: 20,
        display: 'flex', flexDirection: 'column', gap: 12,
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? `0 12px 32px rgba(0,0,0,${dark ? 0.25 : 0.09})` : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          background: color + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IconComp style={{ width: 17, height: 17, color }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: color + '18', color, textTransform: 'uppercase' }}>
            {resource.file_type ?? 'Link'}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: dark ? '#2A2A2A' : '#F0EDE6', color: C.secondary, textTransform: 'capitalize' }}>
            {resource.category}
          </span>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: dark ? C.darkText : C.charcoal, marginBottom: 6, lineHeight: 1.3 }}>
          {resource.title}
        </div>
        {resource.description && (
          <p style={{
            fontSize: 13, color: C.secondary, lineHeight: 1.55, margin: 0,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {resource.description}
          </p>
        )}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 'auto', paddingTop: 12,
        borderTop: `1px solid ${dark ? '#2A2A2A' : '#F0EDE6'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <AvatarCircle name={resource.uploader?.full_name ?? 'U'} size={24} />
          <span style={{ fontSize: 12, color: C.tertiary }}>
            {formatRelativeTime(resource.created_at)}
          </span>
        </div>
        <button
          onClick={() => window.open(resource.url, '_blank')}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '7px 14px', borderRadius: 100, border: 'none',
            background: C.orange, color: C.white,
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        >
          Open ↗
        </button>
      </div>
    </div>
  )
}

function ResourcesPageContent() {
  const { dark } = useDarkMode()
  const [cat, setCat] = useState('All')
  const [query, setQuery] = useState('')
  const [shareOpen, setShareOpen] = useState(false)
  const { data: resources = [], isLoading } = useResources(cat !== 'All' ? cat.toLowerCase() : undefined)

  const filtered = resources.filter(r => {
    if (!query) return true
    const q = query.toLowerCase()
    return r.title.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
  })

  return (
    <>
      <div>
        {/* Search bar + share button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 18px', borderRadius: 100,
            background: dark ? '#1A1A1A' : C.white,
            border: `1.5px solid ${dark ? '#2A2A2A' : C.border}`,
          }}>
            <Search style={{ width: 16, height: 16, color: C.tertiary, flexShrink: 0 }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search resources…"
              style={{
                flex: 1, border: 'none', outline: 'none',
                background: 'transparent', fontSize: 14,
                color: dark ? C.darkText : C.charcoal,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            />
          </div>
          <button
            onClick={() => setShareOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '12px 20px', borderRadius: 100, border: 'none',
              background: C.orange, color: C.white,
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Plus Jakarta Sans, sans-serif', flexShrink: 0,
            }}
          >
            <Plus style={{ width: 14, height: 14 }} /> Share Resource
          </button>
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              style={{
                padding: '7px 16px', borderRadius: 100,
                border: `1.5px solid ${cat === c ? C.orange : (dark ? '#333' : C.border)}`,
                background: cat === c ? C.orange : 'transparent',
                color: cat === c ? C.white : (dark ? C.darkText : C.charcoal),
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                transition: 'all 0.15s',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: 200, borderRadius: 20, background: dark ? '#1A1A1A' : '#F0EDE6' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: 24,
              background: dark ? '#2A2A2A' : '#F0EDE6',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
            }}>
              <BookOpen style={{ width: 36, height: 36, color: C.orange }} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: dark ? C.darkText : C.charcoal, marginBottom: 8 }}>
              No resources found
            </div>
            <div style={{ fontSize: 14, color: C.secondary, marginBottom: 24 }}>
              {query ? 'Try different keywords' : 'Be the first to share something useful.'}
            </div>
            <button
              onClick={() => setShareOpen(true)}
              style={{
                padding: '12px 28px', borderRadius: 100, border: 'none',
                background: C.orange, color: C.white,
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              Share First Resource ↗
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
            {filtered.map(r => <ResourceCard key={r.id} resource={r} dark={dark} />)}
          </div>
        )}
      </div>

      {shareOpen && <ShareModal onClose={() => setShareOpen(false)} dark={dark} />}
    </>
  )
}

export default function ResourcesPage() {
  return (
    <DashboardLayout>
      <ResourcesPageContent />
    </DashboardLayout>
  )
}
