import { useState, useEffect, useRef } from 'react'
import { Send, Plus, Heart, MessageCircle, CornerDownRight, X } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout, C, AvatarCircle, useDarkMode } from '@/components/layouts/DashboardLayout'
import {
  useCommunities, useMyCommunities, useCommunityMessages,
  useSendCommunityMessage, useJoinCommunity, useToggleReaction,
  useCreateCommunity,
} from '@/hooks/useCommunity'
import type { Community, CommunityMessage } from '@/hooks/useCommunity'
import { getErrorMessage } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'

function Eyebrow({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <span style={{ color: C.orange, fontSize: 14, lineHeight: 1 }}>•</span>
      <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: C.secondary }}>{label}</span>
    </div>
  )
}

// ─── Create Community Modal ───────────────────────────────────────────────────
function CreateCommunityModal({ dark, onClose }: { dark: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', description: '', type: 'general', is_private: false })
  const [creating, setCreating] = useState(false)
  const [done, setDone] = useState(false)
  const create = useCreateCommunity()
  const bg = dark ? '#161616' : C.white
  const inputStyle: React.CSSProperties = { width: '100%', borderRadius: 12, border: `1.5px solid ${dark ? '#333' : C.border}`, padding: '10px 14px', fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', color: dark ? C.darkText : C.charcoal, background: dark ? '#0E0E0E' : '#FAFAF8', outline: 'none', boxSizing: 'border-box' as const }

  async function handleCreate() {
    if (!form.name) { toast.error('Please enter a community name'); return }
    setCreating(true)
    try {
      await create.mutateAsync({ name: form.name, description: form.description || undefined, type: form.type, is_private: form.is_private })
      setDone(true)
      toast.success('Community created!')
      setTimeout(onClose, 1200)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create community'))
    } finally { setCreating(false) }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 500, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 600, width: 'min(460px, calc(100vw - 32px))', background: bg, borderRadius: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.18)', animation: 'fadeUp 0.22s ease-out' }}>
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translate(-50%,-46%); } to { opacity:1; transform:translate(-50%,-50%); } }`}</style>
        <div style={{ padding: '22px 24px 18px', borderBottom: `1px solid ${dark ? '#2A2A2A' : C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: dark ? C.darkText : C.charcoal }}>Create Community</div>
          <button onClick={onClose} style={{ background: 'none', border: `1px solid ${dark ? '#333' : C.border}`, borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.secondary, fontSize: 18 }}>×</button>
        </div>
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.secondary, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Name</div>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. CS Society" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.secondary, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Description (Optional)</div>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this community about?" style={{ ...inputStyle, height: 80, resize: 'none' } as React.CSSProperties} />
          </div>
          <button onClick={handleCreate} disabled={creating}
            style={{ width: '100%', padding: 14, borderRadius: 100, border: 'none', background: done ? C.mint : C.orange, color: done ? '#2A6A20' : C.white, fontSize: 15, fontWeight: 700, cursor: creating ? 'default' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'background 0.25s' }}>
            {done ? '✓ Community Created!' : creating ? 'Creating…' : 'Create Community ↗'}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, dark, communityId, onReply, compact }: {
  msg: CommunityMessage; dark: boolean; communityId: number
  onReply?: (msg: CommunityMessage) => void
  compact?: boolean
}) {
  const [liked, setLiked] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const toggleReaction = useToggleReaction()
  const bg = dark ? '#1E1E1E' : '#F9F7F4'
  const textColor = dark ? C.darkText : C.charcoal
  const heartReaction = msg.reactions.find(r => r.emoji === '❤️')
  const likeCount = (heartReaction?.count ?? 0) + (liked && !heartReaction?.reacted ? 1 : 0)

  function handleLike() {
    setLiked(l => !l)
    toggleReaction.mutate({ communityId, messageId: msg.id, emoji: '❤️' })
  }

  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      style={{ display: 'flex', gap: 10, marginBottom: compact ? 8 : 14, position: 'relative' }}
    >
      <AvatarCircle name={msg.sender?.full_name ?? 'U'} size={compact ? 28 : 36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, flexWrap: 'wrap' as const }}>
          <span style={{ fontSize: compact ? 12 : 13, fontWeight: 700, color: textColor }}>{msg.sender?.full_name ?? 'Unknown'}</span>
          <span style={{ fontSize: 11, color: C.tertiary }}>{formatRelativeTime(msg.created_at)}</span>
        </div>
        <div style={{ background: bg, borderRadius: '4px 14px 14px 14px', padding: compact ? '9px 12px' : '12px 14px', fontSize: compact ? 13 : 14, color: dark ? '#C0C0C0' : C.secondary, lineHeight: 1.6 }}>
          {msg.content}
          {msg.attachments?.map(a => (
            <div key={a.id} style={{ marginTop: 8 }}>
              <a href={a.file_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px', borderRadius: 10, background: dark ? '#2A2A2A' : '#EEE', color: C.secondary, textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
                📎 {a.file_name}
              </a>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
          <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 100, border: 'none', background: liked ? 'rgba(239,75,36,0.1)' : 'transparent', color: liked ? C.orange : C.tertiary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <Heart style={{ width: 12, height: 12 }} />{likeCount > 0 ? likeCount : ''}
          </button>
          {msg.reactions.filter(r => r.emoji !== '❤️').map(r => (
            <button key={r.emoji} onClick={() => toggleReaction.mutate({ communityId, messageId: msg.id, emoji: r.emoji })} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 100, border: `1px solid ${dark ? '#333' : C.border}`, background: r.reacted ? 'rgba(239,75,36,0.1)' : 'transparent', fontSize: 12, cursor: 'pointer' }}>
              {r.emoji} <span style={{ fontSize: 11, fontWeight: 600, color: dark ? C.darkText : C.charcoal }}>{r.count}</span>
            </button>
          ))}
          {onReply && showActions && (
            <button onClick={() => onReply(msg)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 100, border: 'none', background: 'transparent', color: C.tertiary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: 0.8 }}>
              <CornerDownRight style={{ width: 11, height: 11 }} /> Reply
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Community Chat ───────────────────────────────────────────────────────────
function CommunityChat({ community, dark }: { community: Community; dark: boolean }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [replyingTo, setReplyingTo] = useState<CommunityMessage | null>(null)
  const { data: messages = [], isLoading } = useCommunityMessages(community.id)
  const sendMsg = useSendCommunityMessage()
  const endRef = useRef<HTMLDivElement>(null)
  const textColor = dark ? C.darkText : C.charcoal

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages.length])
  // Clear reply context when switching community
  useEffect(() => { setReplyingTo(null) }, [community.id])

  async function handleSend() {
    if (!text.trim()) return
    setSending(true)
    try {
      await sendMsg.mutateAsync({ communityId: community.id, content: text, replyToId: replyingTo?.id })
      setText('')
      setReplyingTo(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to send message'))
    } finally { setSending(false) }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // Group: parent messages + their replies
  const parentMessages = messages.filter(m => !m.reply_to_id)
  const getReplies = (parentId: number) => messages.filter(m => m.reply_to_id === parentId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${dark ? '#2A2A2A' : C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: textColor }}>{community.name}</div>
          <div style={{ fontSize: 12, color: C.tertiary }}>{community.member_count} members {community.is_private && '· Private'}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', scrollbarWidth: 'thin' as const }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: dark ? '#2A2A2A' : '#F0EDE6', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 12, background: dark ? '#2A2A2A' : '#F0EDE6', borderRadius: 6, width: '30%', marginBottom: 8 }} />
                  <div style={{ height: 60, background: dark ? '#1E1E1E' : '#F9F7F4', borderRadius: '4px 14px 14px 14px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: dark ? '#2A2A2A' : '#F0EDE6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <MessageCircle style={{ width: 24, height: 24, color: C.orange }} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: textColor, marginBottom: 6 }}>No messages yet</div>
            <div style={{ fontSize: 13, color: C.secondary }}>Be the first to start the conversation</div>
          </div>
        ) : (
          parentMessages.map(parent => {
            const replies = getReplies(parent.id)
            return (
              <div key={parent.id} style={{ marginBottom: 14 }}>
                <MessageBubble msg={parent} dark={dark} communityId={community.id} onReply={setReplyingTo} />
                {replies.length > 0 && (
                  <div style={{ marginLeft: 46, paddingLeft: 14, borderLeft: `2px solid ${dark ? '#2A2A2A' : C.border}`, marginTop: -6 }}>
                    {replies.map(r => (
                      <MessageBubble key={r.id} msg={r} dark={dark} communityId={community.id} onReply={setReplyingTo} compact />
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div style={{ padding: '14px 16px', borderTop: `1px solid ${dark ? '#2A2A2A' : C.border}` }}>
        {replyingTo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', marginBottom: 8, borderRadius: 10, background: dark ? '#1A1A1A' : '#F0EDE6', border: `1px solid ${dark ? '#2A2A2A' : C.border}` }}>
            <CornerDownRight style={{ width: 13, height: 13, color: C.orange, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: C.secondary, flex: 1 }}>Replying to <strong style={{ color: dark ? C.darkText : C.charcoal }}>{replyingTo.sender?.full_name}</strong></span>
            <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.tertiary, display: 'flex', alignItems: 'center', padding: 2 }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '10px 16px', borderRadius: 18, background: dark ? '#1A1A1A' : '#F9F7F4', border: `1.5px solid ${dark ? '#2A2A2A' : C.border}` }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={replyingTo ? `Reply to ${replyingTo.sender?.full_name}…` : `Message ${community.name}…`}
            rows={1}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', color: textColor, resize: 'none' as const, lineHeight: 1.5, maxHeight: 120, overflowY: 'auto' as const }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: text.trim() ? C.orange : (dark ? '#2A2A2A' : '#E5E5E5'), display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: text.trim() ? 'pointer' : 'default', transition: 'background 0.15s', flexShrink: 0 }}
          >
            <Send style={{ width: 15, height: 15, color: text.trim() ? C.white : C.tertiary }} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Communities Sidebar ──────────────────────────────────────────────────────
function CommunitiesSidebar({ active, onSelect, dark, onCreateOpen }: {
  active: Community | null; onSelect: (c: Community) => void; dark: boolean; onCreateOpen: () => void
}) {
  const { data: mine = [] } = useMyCommunities()
  const { data: all = [] } = useCommunities()
  const join = useJoinCommunity()
  const bg = dark ? '#161616' : C.white

  const joinedIds = new Set(mine.map(c => c.id))
  const discover = all.filter(c => !joinedIds.has(c.id))

  async function handleJoin(communityId: number, e: React.MouseEvent) {
    e.stopPropagation()
    try { await join.mutateAsync(communityId); toast.success('Joined!') } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to join community'))
    }
  }

  return (
    <div style={{ width: 220, flexShrink: 0, background: bg, borderRight: `1px solid ${dark ? '#2A2A2A' : C.border}`, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px' }}>
        <Eyebrow label="My Communities" />
        {mine.length === 0 ? (
          <div style={{ fontSize: 13, color: C.tertiary, padding: '8px 0' }}>Join a community below</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 20 }}>
            {mine.map(c => (
              <button key={c.id} onClick={() => onSelect(c)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 100, border: 'none', background: active?.id === c.id ? C.orange : 'transparent', color: active?.id === c.id ? C.white : (dark ? '#C0C0C0' : C.charcoal), fontSize: 13, fontWeight: active?.id === c.id ? 700 : 500, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'background 0.15s' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{c.name}</span>
                <span style={{ fontSize: 11, opacity: 0.6, marginLeft: 6, flexShrink: 0 }}>{c.member_count > 999 ? `${(c.member_count / 1000).toFixed(1)}k` : c.member_count}</span>
              </button>
            ))}
          </div>
        )}

        {discover.length > 0 && (
          <>
            <Eyebrow label="Discover" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {discover.slice(0, 5).map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 13, color: dark ? '#C0C0C0' : C.secondary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{c.name}</span>
                  <button onClick={e => handleJoin(c.id, e)} style={{ padding: '4px 10px', borderRadius: 100, border: `1px solid ${C.orange}`, background: 'transparent', color: C.orange, fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Join</button>
                </div>
              ))}
            </div>
          </>
        )}

        <button onClick={onCreateOpen} style={{ width: '100%', marginTop: 16, padding: '10px', borderRadius: 100, border: `1.5px solid ${C.orange}`, background: 'transparent', color: C.orange, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Plus style={{ width: 13, height: 13 }} /> Create Community
        </button>
      </div>
    </div>
  )
}

// ─── Right Sidebar ────────────────────────────────────────────────────────────
function RightSidebar({ dark, community }: { dark: boolean; community: Community | null }) {
  const bg = dark ? '#1A1A1A' : C.white
  const textColor = dark ? C.darkText : C.charcoal

  return (
    <div style={{ width: 240, flexShrink: 0, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {community && (
        <div style={{ background: bg, borderRadius: 18, border: `1px solid ${dark ? '#2A2A2A' : C.border}`, padding: '16px' }}>
          <Eyebrow label="About" />
          <p style={{ fontSize: 13, color: C.secondary, lineHeight: 1.6, margin: 0 }}>{community.description ?? 'A community for members of ConnectUni.'}</p>
          <div style={{ marginTop: 12, display: 'flex', gap: 14 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: textColor }}>{community.member_count}</div>
              <div style={{ fontSize: 11, color: C.tertiary }}>Members</div>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: textColor }}>{community.is_private ? '🔒' : '🌐'}</div>
              <div style={{ fontSize: 11, color: C.tertiary }}>{community.is_private ? 'Private' : 'Public'}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: bg, borderRadius: 18, border: `1px solid ${dark ? '#2A2A2A' : C.border}`, padding: '16px' }}>
        <Eyebrow label="Trending Topics" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['#GradJobs2026', '#ProductThinking', '#AIResearch', '#BreakingIntoVC', '#StartupLife'].map((tag, i) => (
            <div key={tag} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.orange }}>{tag}</span>
              <span style={{ fontSize: 11, color: C.tertiary }}>{[342, 234, 189, 156, 98][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ dark, onCreateOpen }: { dark: boolean; onCreateOpen: () => void }) {
  const textColor = dark ? C.darkText : C.charcoal
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 40px', textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: dark ? '#2A2A2A' : '#F0EDE6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: textColor, marginBottom: 8 }}>Join a community</div>
      <div style={{ fontSize: 14, color: C.secondary, marginBottom: 24, maxWidth: 360 }}>Select a community from the sidebar to start chatting, or create your own.</div>
      <button onClick={onCreateOpen} style={{ padding: '12px 28px', borderRadius: 100, border: 'none', background: C.orange, color: C.white, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        Create First Community ↗
      </button>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function CommunityPageContent() {
  const { dark } = useDarkMode()
  const { data: mine = [] } = useMyCommunities()
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  // Auto-select first community
  useEffect(() => {
    if (mine.length > 0 && !activeCommunity) setActiveCommunity(mine[0])
  }, [mine])

  const mainBg = dark ? C.darkBase : '#EDE9E3'
  const borderColor = dark ? '#2A2A2A' : C.border

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', background: mainBg, borderRadius: 20, overflow: 'hidden', border: `1px solid ${borderColor}` }}>
      <CommunitiesSidebar active={activeCommunity} onSelect={setActiveCommunity} dark={dark} onCreateOpen={() => setCreateOpen(true)} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {activeCommunity ? (
          <CommunityChat community={activeCommunity} dark={dark} />
        ) : (
          <EmptyState dark={dark} onCreateOpen={() => setCreateOpen(true)} />
        )}
      </div>
      <RightSidebar dark={dark} community={activeCommunity} />
      {createOpen && <CreateCommunityModal dark={dark} onClose={() => setCreateOpen(false)} />}
    </div>
  )
}

export default function CommunityPage() {
  return (
    <DashboardLayout>
      <CommunityPageContent />
    </DashboardLayout>
  )
}
