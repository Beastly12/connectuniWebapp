import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home, Compass, Users, Calendar, MessageSquare, Bookmark,
  Image, HelpCircle, Trophy, CalendarPlus, ArrowUpRight,
  Heart, MessageCircle, Share2, MoreHorizontal, Hash,
  CheckCircle, Plus, TrendingUp, CornerDownRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import {
  useCommunities, useMyCommunities, useCommunityMessages,
  useSendCommunityMessage, useJoinCommunity, useToggleReaction,
  useCreateCommunity,
} from '@/hooks/useCommunity'
import type { Community, CommunityMessage } from '@/hooks/useCommunity'
import { getErrorMessage } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

// ─── Design tokens (matching Community.html exactly) ─────────────────────────
const T = {
  orange:   '#EF4B24',
  charcoal: '#1A1A1A',
  white:    '#FFFFFF',
  offwhite: '#F7F5F0',
  mint:     '#D4E8B8',
  mintDeep: '#8fb65a',
  lavender: '#C8B8E0',
  border:   '#E5E5E5',
  text2:    '#6B6B6B',
  text3:    '#9A9A9A',
  inactive: '#F2F2F2',
} as const

// gradient covers for communities (deterministic from id)
const COVERS = [
  'linear-gradient(160deg,#c7a181,#6b4a2c)',
  'linear-gradient(160deg,#4a5a6e,#2a3644)',
  'linear-gradient(160deg,#d89a6b,#b06a3a)',
  'linear-gradient(160deg,#a8a385,#5a552f)',
  'linear-gradient(160deg,#d4b8c8,#8b5d75)',
  'linear-gradient(160deg,#b8c8d4,#5a7088)',
]
function coverFor(id: number) { return COVERS[id % COVERS.length] }

// avatar gradient covers
const AV_GRADIENTS = [
  'linear-gradient(135deg,#f4c7a8,#d89a6b)',
  'linear-gradient(135deg,#c8b8e0,#9985c2)',
  'linear-gradient(135deg,#d4e8b8,#a3c572)',
  'linear-gradient(135deg,#f7d4c9,#e08b6f)',
  'linear-gradient(135deg,#b8d4e8,#6c9bc7)',
  'linear-gradient(135deg,#e8c8d4,#c27a9b)',
  'linear-gradient(135deg,#d4d4e8,#8b85c2)',
  'linear-gradient(135deg,#e0d4b8,#b59c5d)',
]
function avGrad(id: number) { return AV_GRADIENTS[id % AV_GRADIENTS.length] }

// ─── Verified tick ────────────────────────────────────────────────────────────
function VerifiedTick() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 14, height: 14, borderRadius: '50%', background: T.orange,
      color: T.white, marginLeft: 4, verticalAlign: 'middle', flexShrink: 0,
    }}>
      <CheckCircle style={{ width: 9, height: 9, strokeWidth: 3 }} />
    </span>
  )
}

// ─── Tag pill ─────────────────────────────────────────────────────────────────
function TagPill({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'mint' | 'orange' | 'outline' }) {
  const bg = variant === 'mint' ? T.mint : variant === 'orange' ? 'rgba(239,75,36,0.12)' : variant === 'outline' ? 'transparent' : T.inactive
  const color = variant === 'orange' ? T.orange : variant === 'outline' ? T.text2 : T.charcoal
  const border = variant === 'outline' ? `1px solid ${T.border}` : 'none'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 11px', borderRadius: 999,
      fontSize: 11, fontWeight: 600,
      background: bg, color, border,
    }}>
      {children}
    </span>
  )
}

// ─── Filter chip ──────────────────────────────────────────────────────────────
function FChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 14px', borderRadius: 999,
      fontSize: 12, fontWeight: 600, cursor: 'pointer',
      color: active ? T.white : T.text2,
      background: active ? T.charcoal : T.white,
      border: `1px solid ${active ? T.charcoal : T.border}`,
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      transition: 'all .15s',
    }}>
      {label}
    </button>
  )
}

// ─── Composer ─────────────────────────────────────────────────────────────────
function Composer({ activeCircle, onPosted }: { activeCircle?: Community; onPosted?: () => void }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)
  const send = useSendCommunityMessage()
  const { profile } = useAuth()
  const name = profile?.full_name ?? 'You'

  async function handlePost() {
    if (!text.trim() || !activeCircle) return
    setPosting(true)
    try {
      await send.mutateAsync({ communityId: activeCircle.id, content: text.trim() })
      setText(''); setOpen(false)
      toast.success('Posted!')
      onPosted?.()
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to post'))
    } finally { setPosting(false) }
  }

  return (
    <div style={{
      background: T.white, border: `1px solid ${T.border}`, borderRadius: 20, padding: 18,
    }}>
      {/* Row 1 */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: avGrad(profile?.user_id ?? 0),
        }} />
        {open ? (
          <textarea
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Share an ask, a win, or what you're learning, ${name.split(' ')[0]}…`}
            style={{
              flex: 1, background: T.offwhite, borderRadius: 14, border: '1px solid transparent',
              padding: '12px 16px', fontSize: 14, color: T.charcoal, resize: 'none', minHeight: 80,
              fontFamily: 'Plus Jakarta Sans, sans-serif', outline: 'none',
            }}
          />
        ) : (
          <div
            onClick={() => setOpen(true)}
            style={{
              flex: 1, background: T.offwhite, borderRadius: 14, border: '1px solid transparent',
              padding: '12px 16px', fontSize: 14, color: T.text3, cursor: 'text',
            }}
          >
            Share an ask, a win, or what you're learning, {name.split(' ')[0]}…
          </div>
        )}
      </div>

      {/* Row 2 — actions */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border}`,
      }}>
        {[
          { icon: Image, label: 'Photo' },
          { icon: HelpCircle, label: 'Question' },
          { icon: Trophy, label: 'Win' },
          { icon: CalendarPlus, label: 'Event' },
        ].map(({ icon: Icon, label }) => (
          <button key={label} onClick={() => setOpen(true)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 999,
            background: T.offwhite, color: T.text2,
            fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            <Icon style={{ width: 13, height: 13 }} />{label}
          </button>
        ))}
        <button
          onClick={handlePost}
          disabled={!text.trim() || !activeCircle || posting}
          style={{
            marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 8px 9px 16px', borderRadius: 999, border: 'none',
            background: !text.trim() || !activeCircle ? T.inactive : T.orange,
            color: !text.trim() || !activeCircle ? T.text3 : T.white,
            fontSize: 13, fontWeight: 600, cursor: !text.trim() || !activeCircle ? 'default' : 'pointer',
            fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'background .15s',
          }}
        >
          {posting ? 'Posting…' : 'Post'}
          <span style={{
            width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.25)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ArrowUpRight style={{ width: 12, height: 12 }} />
          </span>
        </button>
      </div>
    </div>
  )
}

// ─── Post card ────────────────────────────────────────────────────────────────
function PostCard({ msg, communityId, replyCount = 0, isReply = false, onReply }: {
  msg: CommunityMessage
  communityId: number
  replyCount?: number
  isReply?: boolean
  onReply?: () => void
}) {
  const toggleReaction = useToggleReaction()
  const heartReaction = msg.reactions.find(r => r.emoji === '❤️')
  const hasLiked = heartReaction?.reacted_by_me ?? false
  const totalReactions = msg.reactions.reduce((sum, r) => sum + r.count, 0)
  const topEmojis = msg.reactions.filter(r => r.count > 0).slice(0, 3).map(r => r.emoji)

  const senderName = msg.sender?.full_name ?? 'Unknown'
  const senderId = msg.sender_id

  return (
    <article style={{
      background: T.white,
      border: `1px solid ${T.border}`,
      borderRadius: isReply ? '0 16px 16px 0' : 20,
      padding: isReply ? '16px 18px' : 22,
      marginTop: isReply ? 0 : 18,
      borderLeft: isReply ? `3px solid ${T.orange}` : `1px solid ${T.border}`,
    }}>
      {/* Head */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: avGrad(senderId),
        }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.charcoal, display: 'flex', alignItems: 'center', gap: 4 }}>
            {senderName}
            {senderId % 3 === 0 && <VerifiedTick />}
          </div>
          <div style={{ fontSize: 12, color: T.text2, marginTop: 2 }}>
            {formatRelativeTime(msg.created_at)}
          </div>
        </div>
        <button style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: T.text3, padding: 6, borderRadius: 8,
        }}>
          <MoreHorizontal style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {/* Body */}
      <div style={{ fontSize: 15, lineHeight: 1.55, color: T.charcoal }}>
        {msg.content}
      </div>

      {/* Attachments */}
      {msg.attachments?.length > 0 && (
        <div style={{ marginTop: 14, borderRadius: 14, overflow: 'hidden', aspectRatio: '16/9', background: coverFor(msg.id), position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(135deg,transparent 0 14px,rgba(255,255,255,0.05) 14px 15px)' }} />
        </div>
      )}

      {/* Reactions */}
      {totalReactions > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.text2, marginTop: 14, marginBottom: 4 }}>
          <div style={{ display: 'flex' }}>
            {topEmojis.map((emoji, i) => (
              <span key={i} style={{
                width: 22, height: 22, borderRadius: '50%', border: `2px solid ${T.white}`,
                marginLeft: i === 0 ? 0 : -6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: i === 0 ? T.orange : i === 1 ? T.mint : T.lavender,
                fontSize: 11,
              }}>
                {emoji}
              </span>
            ))}
          </div>
          <span><strong>{totalReactions}</strong> reaction{totalReactions !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex', gap: 4, marginTop: 16, paddingTop: 16,
        borderTop: `1px solid ${T.border}`,
      }}>
        <button
          onClick={() => toggleReaction.mutate({ communityId, messageId: msg.id, emoji: '❤️' })}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'transparent', color: hasLiked ? T.orange : T.text2,
            fontSize: 13, fontWeight: 600, fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        >
          <Heart style={{ width: 16, height: 16, fill: hasLiked ? T.orange : 'none' }} />
          {hasLiked ? 'Liked' : 'Like'}
        </button>
        <button onClick={onReply} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: 'transparent', color: T.text2, fontSize: 13, fontWeight: 600, fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}>
          <MessageCircle style={{ width: 16, height: 16 }} />
          {replyCount > 0 ? `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}` : 'Reply'}
        </button>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: 'transparent', color: T.text2, fontSize: 13, fontWeight: 600, fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}>
          <Share2 style={{ width: 16, height: 16 }} />Share
        </button>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: 'transparent', color: T.text2, fontSize: 13, fontWeight: 600, fontFamily: 'Plus Jakarta Sans, sans-serif',
          marginLeft: 'auto',
        }}>
          <Bookmark style={{ width: 16, height: 16 }} />Save
        </button>
      </div>
    </article>
  )
}

// ─── Left rail ────────────────────────────────────────────────────────────────
function LeftRail({ activeId, myCommunities, onSelectCircle, onCreateCircle }: {
  activeId?: number
  myCommunities: Community[]
  onSelectCircle: (c: Community) => void
  onCreateCircle: () => void
}) {
  const navigate = useNavigate()

  // const navItems = [
  //   { icon: Home,           label: 'Feed',     active: true,  onClick: () => {} },
  //   { icon: Compass,        label: 'Explore',  active: false, onClick: () => {} },
  //   { icon: Users,          label: 'Mentors',  active: false, onClick: () => navigate('/mentorship') },
  //   { icon: Calendar,       label: 'Events',   active: false, onClick: () => navigate('/events') },
  //   { icon: MessageSquare,  label: 'Messages', active: false, onClick: () => navigate('/messages') },
  //   { icon: Bookmark,       label: 'Saved',    active: false, onClick: () => {} },
  // ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Navigate panel */}
      {/* <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 20, padding: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: T.text2, marginBottom: 14 }}>Navigate</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(({ icon: Icon, label, active, onClick }) => (
            <button key={label} onClick={onClick} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 12, cursor: 'pointer', border: 'none',
              background: active ? T.charcoal : 'transparent',
              color: active ? T.white : T.charcoal,
              fontSize: 14, fontWeight: 500, fontFamily: 'Plus Jakarta Sans, sans-serif', textAlign: 'left',
            }}>
              <Icon style={{ width: 18, height: 18, color: active ? T.white : T.text2 }} />
              {label}
            </button>
          ))}
        </div>
      </div> */}

      {/* Your circles panel */}
      <div style={{
        background: T.white, border: `1px solid ${T.border}`, borderRadius: 20, padding: 20,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: T.text2, marginBottom: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>Your circles <span style={{ color: T.orange }}>{myCommunities.length}</span></span>
          <button onClick={onCreateCircle} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: T.text2,
            display: 'flex', alignItems: 'center',
          }}>
            <Plus style={{ width: 14, height: 14 }} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {myCommunities.length === 0 && (
            <div style={{ fontSize: 12, color: T.text3, textAlign: 'center', padding: '12px 0' }}>
              Join a circle to see it here
            </div>
          )}
          {myCommunities.map(c => (
            <button key={c.id} onClick={() => onSelectCircle(c)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px', borderRadius: 12, cursor: 'pointer', border: 'none',
              background: activeId === c.id ? T.charcoal : 'transparent',
              color: activeId === c.id ? T.white : T.charcoal,
              textAlign: 'left', fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: avGrad(c.id),
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: activeId === c.id ? 'rgba(255,255,255,0.6)' : T.text2, marginTop: 1 }}>{c.member_count} members</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Right rail ───────────────────────────────────────────────────────────────
function RightRail({ allCommunities, myCommunityIds, onJoin }: {
  allCommunities: Community[]
  myCommunityIds: Set<number>
  onJoin: (id: number) => void
}) {
  const joinMutation = useJoinCommunity()

  // trending topics — derived from community names
  const trending = allCommunities.slice(0, 4).map(c => ({
    tag: `#${c.name.replace(/\s+/g, '')}`,
    detail: `${c.member_count} members`,
    count: c.member_count,
  }))

  // suggested circles (not yet joined)
  const discover = allCommunities.filter(c => !myCommunityIds.has(c.id)).slice(0, 3)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Trending */}
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 20, padding: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.text2, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp style={{ width: 12, height: 12 }} />Trending
        </div>
        {trending.length === 0 && <div style={{ fontSize: 12, color: T.text3 }}>No data yet</div>}
        {trending.map(t => (
          <div key={t.tag} style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
            padding: '10px 0', borderBottom: `1px solid ${T.border}`,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.charcoal }}>{t.tag}</div>
              <div style={{ fontSize: 11, color: T.text2, marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>{t.detail}</div>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: T.text3, flexShrink: 0 }}>{t.count}</span>
          </div>
        ))}
        {trending.length > 0 && <div style={{ height: 10 }} />}
      </div>

      {/* Discover circles */}
      {discover.length > 0 && (
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 20, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.text2, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Compass style={{ width: 12, height: 12 }} />Discover
          </div>
          {discover.map(c => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 0', borderBottom: `1px solid ${T.border}`,
            }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: avGrad(c.id), flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: T.text2, marginTop: 1 }}>{c.member_count} members</div>
              </div>
              <button
                onClick={() => {
                  joinMutation.mutate(c.id)
                  onJoin(c.id)
                }}
                style={{
                  background: 'transparent', border: `1px solid ${T.border}`,
                  color: T.charcoal, fontSize: 11, fontWeight: 700,
                  padding: '5px 12px', borderRadius: 999, cursor: 'pointer',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  flexShrink: 0,
                }}
              >
                Join
              </button>
            </div>
          ))}
          <div style={{ height: 4 }} />
        </div>
      )}

      {/* Suggested */}
      {discover.length === 0 && (
        <div style={{ background: T.mint, border: `1px solid ${T.mint}`, borderRadius: 20, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.charcoal, marginBottom: 10 }}>
            Suggested for you
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, color: T.charcoal }}>
            You've joined all available circles!
          </div>
          <p style={{ fontSize: 12, color: T.charcoal, opacity: 0.7, marginTop: 6, lineHeight: 1.5 }}>
            Create a new circle to bring together your community.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Create community modal ───────────────────────────────────────────────────
function CreateCircleModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', description: '', is_private: false })
  const [loading, setLoading] = useState(false)
  const create = useCreateCommunity()

  async function handleCreate() {
    if (!form.name.trim()) { toast.error('Please enter a circle name'); return }
    setLoading(true)
    try {
      await create.mutateAsync({ name: form.name, description: form.description || undefined, type: 'general', is_private: form.is_private })
      toast.success('Circle created!')
      onClose()
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to create circle'))
    } finally { setLoading(false) }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, backdropFilter: 'blur(6px)' }} />
      <div style={{
        position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 600, width: 'min(440px,calc(100vw - 32px))',
        background: T.white, borderRadius: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
      }}>
        <div style={{ padding: '22px 24px 18px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.charcoal }}>New Circle</div>
          <button onClick={onClose} style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text2, fontSize: 16 }}>×</button>
        </div>
        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.text2, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Name</div>
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. First-Gen UK"
              style={{ width: '100%', borderRadius: 12, border: `1.5px solid ${T.border}`, padding: '10px 14px', fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', color: T.charcoal, background: T.offwhite, outline: 'none', boxSizing: 'border-box' as const }}
            />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.text2, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Description</div>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="What is this circle about?"
              style={{ width: '100%', borderRadius: 12, border: `1.5px solid ${T.border}`, padding: '10px 14px', fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', color: T.charcoal, background: T.offwhite, outline: 'none', height: 80, resize: 'none', boxSizing: 'border-box' as const }}
            />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.text2, marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Privacy</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ label: 'Public', val: false }, { label: 'Private', val: true }].map(({ label, val }) => (
                <button key={label} onClick={() => setForm(p => ({ ...p, is_private: val }))}
                  style={{ flex: 1, padding: '8px', borderRadius: 10, border: `1.5px solid ${form.is_private === val ? T.orange : T.border}`, background: form.is_private === val ? 'rgba(239,75,36,0.08)' : 'transparent', color: form.is_private === val ? T.orange : T.charcoal, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleCreate} disabled={loading}
            style={{ padding: 14, borderRadius: 100, border: 'none', background: T.orange, color: T.white, fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {loading ? 'Creating…' : 'Create Circle ↗'}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Inline reply composer ────────────────────────────────────────────────────
function InlineReplyComposer({ communityId, replyToId, replyToName, onClose }: {
  communityId: number
  replyToId: number
  replyToName: string
  onClose: () => void
}) {
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)
  const send = useSendCommunityMessage()
  const { profile } = useAuth()

  async function handlePost() {
    if (!text.trim()) return
    setPosting(true)
    try {
      await send.mutateAsync({ communityId, content: text.trim(), replyToId })
      setText(''); onClose()
      toast.success('Reply posted!')
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to post reply'))
    } finally { setPosting(false) }
  }

  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'flex-start',
      padding: '12px 14px',
      background: T.offwhite,
      borderTop: `1px solid ${T.border}`,
    }}>
      {/* vertical line continuation */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: avGrad(profile?.user_id ?? 0) }} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 11, color: T.text2 }}>
          Replying to <span style={{ fontWeight: 700, color: T.orange }}>@{replyToName}</span>
        </div>
        <textarea
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Post your reply…"
          style={{
            width: '100%', borderRadius: 12, border: `1px solid ${T.border}`,
            padding: '10px 14px', fontSize: 14, color: T.charcoal,
            background: T.white, fontFamily: 'Plus Jakarta Sans, sans-serif',
            resize: 'none', minHeight: 72, outline: 'none', boxSizing: 'border-box' as const,
          }}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '7px 16px', borderRadius: 999, border: `1px solid ${T.border}`, background: 'transparent', color: T.text2, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Cancel
          </button>
          <button onClick={handlePost} disabled={!text.trim() || posting} style={{ padding: '7px 16px', borderRadius: 999, border: 'none', background: !text.trim() ? T.inactive : T.orange, color: !text.trim() ? T.text3 : T.white, fontSize: 12, fontWeight: 700, cursor: !text.trim() ? 'default' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {posting ? 'Posting…' : 'Reply'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Threaded post (parent + replies Twitter-style) ───────────────────────────
function ThreadedPost({ post, replies, communityId }: {
  post: CommunityMessage
  replies: CommunityMessage[]
  communityId: number
}) {
  const [showReplyBox, setShowReplyBox] = useState(false)

  return (
    <div style={{ marginTop: 18 }}>
      {/* Parent post */}
      <div style={{ position: 'relative' }}>
        <PostCard
          msg={post}
          communityId={communityId}
          replyCount={replies.length}
          onReply={() => setShowReplyBox(v => !v)}
        />
        {/* Vertical connector line if there are replies */}
        {replies.length > 0 && (
          <div style={{
            position: 'absolute', left: 33, bottom: -18, width: 2,
            height: 18, background: T.border, zIndex: 1,
          }} />
        )}
      </div>

      {/* Replies thread */}
      {replies.length > 0 && (
        <div style={{ display: 'flex', gap: 0, marginTop: 0 }}>
          {/* Left rail: avatar column */}
          <div style={{ width: 52, flexShrink: 0, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Vertical line spanning all replies */}
            <div style={{ width: 2, background: T.border, flex: 1, marginTop: 0, borderRadius: 1 }} />
          </div>
          {/* Replies stacked */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 4 }}>
            {replies.map((reply, i) => (
              <div key={reply.id} style={{ position: 'relative' }}>
                {/* Horizontal connector */}
                <div style={{
                  position: 'absolute', left: -52, top: 24, width: 36, height: 2,
                  background: T.border,
                }} />
                <div style={{
                  /* indent avatar sits to the left */
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: avGrad(reply.sender_id), marginTop: 14,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: T.text2, marginBottom: 4 }}>
                      Replying to <span style={{ fontWeight: 700, color: T.charcoal }}>{post.sender?.full_name ?? 'Unknown'}</span>
                    </div>
                    <PostCard
                      msg={reply}
                      communityId={communityId}
                      isReply
                    />
                  </div>
                </div>
                {/* line continues between replies */}
                {i < replies.length - 1 && (
                  <div style={{
                    position: 'absolute', left: -52 + 16, bottom: -2, width: 2, height: 6,
                    background: T.border,
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reply composer (inline, below thread) */}
      {showReplyBox && (
        <div style={{ borderRadius: '0 0 16px 16px', overflow: 'hidden', border: `1px solid ${T.border}`, borderTop: 'none', marginTop: -1 }}>
          <InlineReplyComposer
            communityId={communityId}
            replyToId={post.id}
            replyToName={post.sender?.full_name ?? 'Unknown'}
            onClose={() => setShowReplyBox(false)}
          />
        </div>
      )}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyFeed({ hasCircles, onJoin }: { hasCircles: boolean; onJoin: () => void }) {
  return (
    <div style={{
      marginTop: 32, borderRadius: 24, border: `1.5px dashed ${T.border}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '72px 40px', textAlign: 'center',
    }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: T.offwhite, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <Hash style={{ width: 28, height: 28, color: T.orange }} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: T.charcoal, marginBottom: 8 }}>
        {hasCircles ? 'No posts yet' : 'Join a circle to get started'}
      </div>
      <div style={{ fontSize: 14, color: T.text2, marginBottom: 20 }}>
        {hasCircles ? 'Be the first to post something in this circle!' : 'Circles are where students, alumni, and mentors connect around shared topics.'}
      </div>
      {!hasCircles && (
        <button onClick={onJoin} style={{
          padding: '12px 24px', borderRadius: 999, background: T.charcoal, color: T.white,
          border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}>
          Browse circles
        </button>
      )}
    </div>
  )
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 20, padding: 22, marginTop: 18 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: T.inactive }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 13, width: '40%', background: T.inactive, borderRadius: 6, marginBottom: 6 }} />
          <div style={{ height: 10, width: '25%', background: T.inactive, borderRadius: 6 }} />
        </div>
      </div>
      <div style={{ height: 13, width: '100%', background: T.inactive, borderRadius: 6, marginBottom: 8 }} />
      <div style={{ height: 13, width: '80%', background: T.inactive, borderRadius: 6, marginBottom: 8 }} />
      <div style={{ height: 13, width: '60%', background: T.inactive, borderRadius: 6 }} />
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
function CommunityPageContent() {
  useAuth() // ensures token is valid

  const { data: allCommunities = [] } = useCommunities()
  const { data: myCommunities = [] } = useMyCommunities()
  const myCommunityIds = new Set(myCommunities.map(c => c.id))

  const [activeCircle, setActiveCircle] = useState<Community | undefined>()
  const [activeFilter, setActiveFilter] = useState('My circles')
  const [showCreate, setShowCreate] = useState(false)

  // set default active circle to first joined
  useEffect(() => {
    if (!activeCircle && myCommunities.length > 0) {
      setActiveCircle(myCommunities[0])
    }
  }, [myCommunities, activeCircle])

  const { data: messages = [], isLoading } = useCommunityMessages(activeCircle?.id)

  // filter messages (in a real app these would be server-filtered)
  const displayCircle = activeFilter === 'My circles' ? activeCircle : undefined
  const displayMessages: CommunityMessage[] = displayCircle ? messages : []

  function handleJoin(id: number) {
    const found = allCommunities.find(c => c.id === id)
    if (found) setActiveCircle(found)
  }

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24,
        marginBottom: 24,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ color: T.orange, fontSize: 14 }}>•</span>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: T.text2 }}>Community</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: T.charcoal, letterSpacing: '-0.01em', margin: 0 }}>
            Feed
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <TagPill variant="outline">{allCommunities.length > 0 ? `${allCommunities.reduce((s, c) => s + c.member_count, 0).toLocaleString()} members` : 'Community'}</TagPill>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '9px 8px 9px 16px', borderRadius: 999, border: 'none',
              background: T.charcoal, color: T.white,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            Find your circle
            <span style={{ width: 26, height: 26, borderRadius: '50%', background: T.orange, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUpRight style={{ width: 12, height: 12 }} />
            </span>
          </button>
        </div>
      </div>

      {/* 3-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 280px', gap: 24 }}>

        {/* Left rail */}
        <LeftRail
          activeId={activeCircle?.id}
          myCommunities={myCommunities}
          onSelectCircle={c => { setActiveCircle(c); setActiveFilter('My circles') }}
          onCreateCircle={() => setShowCreate(true)}
        />

        {/* Center feed */}
        <div>
          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' as const, marginBottom: 14 }}>
            {['Following', 'My circles', 'Discover', 'Questions', 'Wins'].map(f => (
              <FChip key={f} label={f} active={activeFilter === f} onClick={() => setActiveFilter(f)} />
            ))}
          </div>

          {/* Active circle label */}
          {activeCircle && (
            <div style={{ fontSize: 12, color: T.text2, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Hash style={{ width: 12, height: 12 }} />
              <span style={{ fontWeight: 600, color: T.charcoal }}>{activeCircle.name}</span>
              <span>· {activeCircle.member_count} members</span>
            </div>
          )}

          {/* Composer */}
          <Composer activeCircle={activeCircle} />

          {/* Feed */}
          {isLoading ? (
            <>{Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)}</>
          ) : !activeCircle ? (
            <EmptyFeed hasCircles={myCommunities.length > 0} onJoin={() => setShowCreate(true)} />
          ) : displayMessages.length === 0 ? (
            <EmptyFeed hasCircles={true} onJoin={() => {}} />
          ) : (() => {
            // Build reply map: parentId → replies[]
            const sorted = [...displayMessages].reverse()
            const replyMap = new Map<number, CommunityMessage[]>()
            const topLevel: CommunityMessage[] = []
            for (const msg of sorted) {
              if (msg.reply_to_id) {
                const arr = replyMap.get(msg.reply_to_id) ?? []
                arr.push(msg)
                replyMap.set(msg.reply_to_id, arr)
              } else {
                topLevel.push(msg)
              }
            }
            return topLevel.map(post => (
              <ThreadedPost
                key={post.id}
                post={post}
                replies={replyMap.get(post.id) ?? []}
                communityId={activeCircle.id}
              />
            ))
          })()}
        </div>

        {/* Right rail */}
        <RightRail
          allCommunities={allCommunities}
          myCommunityIds={myCommunityIds}
          onJoin={handleJoin}
        />
      </div>

      {/* Create circle modal */}
      {showCreate && <CreateCircleModal onClose={() => setShowCreate(false)} />}
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
