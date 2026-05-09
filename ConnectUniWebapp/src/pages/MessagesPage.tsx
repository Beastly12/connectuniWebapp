import { useState, useRef, useEffect } from 'react'
import { Send, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { DashboardLayout, C, AvatarCircle, useDarkMode } from '@/components/layouts/DashboardLayout'
import {
  useConversations,
  useConversationMessages,
  useSendDirectMessage,
  type Conversation,
} from '@/hooks/useMessages'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'

// ─── Conversation list item ───────────────────────────────────────────────────
function ConvItem({
  conv, active, dark, onClick,
}: {
  conv: Conversation
  active: boolean
  dark: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 12px', border: 'none', cursor: 'pointer',
        borderRadius: 12, margin: '2px 6px',
        width: 'calc(100% - 12px)',
        background: active ? C.orange : 'transparent',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        transition: 'background 0.15s',
        textAlign: 'left' as const,
      }}
    >
      <AvatarCircle name={conv.other_user_name} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
          <div style={{
            fontSize: 14, fontWeight: 700,
            color: active ? C.white : (dark ? C.darkText : C.charcoal),
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
          }}>
            {conv.other_user_name}
          </div>
          {conv.last_message_at && (
            <div style={{ fontSize: 10, color: active ? 'rgba(255,255,255,0.75)' : C.tertiary, flexShrink: 0 }}>
              {formatRelativeTime(conv.last_message_at)}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <div style={{
            fontSize: 12,
            color: active ? 'rgba(255,255,255,0.75)' : C.secondary,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, flex: 1,
          }}>
            {conv.last_message ?? 'No messages yet'}
          </div>
          {conv.unread_count > 0 && !active && (
            <span style={{
              background: C.orange, color: C.white, fontSize: 10, fontWeight: 700,
              borderRadius: 100, padding: '1px 6px', minWidth: 18,
              textAlign: 'center' as const, flexShrink: 0,
            }}>
              {conv.unread_count > 99 ? '99+' : conv.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MsgBubble({
  content, isOwn, isRead, time, dark,
}: {
  content: string
  isOwn: boolean
  isRead: boolean
  time: string
  dark: boolean
}) {
  return (
    <div style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
      <div style={{ maxWidth: '65%' }}>
        <div style={{
          padding: '10px 14px',
          borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isOwn ? C.orange : (dark ? '#2A2A2A' : '#F0EDE6'),
          color: isOwn ? C.white : (dark ? C.darkText : C.charcoal),
          fontSize: 14, lineHeight: 1.55,
          wordBreak: 'break-word' as const,
        }}>
          {content}
        </div>
        <div style={{
          fontSize: 10, color: C.tertiary, marginTop: 3,
          textAlign: (isOwn ? 'right' : 'left') as const,
          paddingLeft: 4, paddingRight: 4,
        }}>
          {formatRelativeTime(time)}
          {isOwn && <span style={{ marginLeft: 4 }}>{isRead ? '✓✓' : '✓'}</span>}
        </div>
      </div>
    </div>
  )
}

// ─── Chat panel (messages + input) ───────────────────────────────────────────
function ChatPanel({ convId, myId, dark }: { convId: number; myId: number; dark: boolean }) {
  const { data: messages = [], isLoading } = useConversationMessages(convId)
  const send = useSendDirectMessage()
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages load or update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' as ScrollBehavior })
  }, [messages.length])

  async function doSend() {
    const content = text.trim()
    if (!content || send.isPending) return
    setText('')
    try {
      await send.mutateAsync({ conversationId: convId, content })
    } catch (err) {
      setText(content)
      toast.error(getErrorMessage(err, 'Failed to send message'))
    }
  }

  const borderColor = dark ? '#2A2A2A' : C.border

  return (
    <>
      {/* Messages list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[60, 45, 70, 50, 40].map((w, i) => (
              <div
                key={i}
                style={{
                  height: 38, borderRadius: 14,
                  background: dark ? '#2A2A2A' : '#F0EDE6',
                  width: `${w}%`,
                  alignSelf: (i % 2 === 0 ? 'flex-start' : 'flex-end') as React.CSSProperties['alignSelf'],
                }}
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%',
            textAlign: 'center' as const, color: C.tertiary, fontSize: 13,
          }}>
            No messages yet — say hello!
          </div>
        ) : (
          messages.map(msg => (
            <MsgBubble
              key={msg.id}
              content={msg.content}
              isOwn={msg.sender_id === myId}
              isRead={msg.is_read}
              time={msg.created_at}
              dark={dark}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div style={{
        borderTop: `1px solid ${borderColor}`,
        padding: '12px 16px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend() }
            }}
            placeholder="Type a message…"
            style={{
              flex: 1, borderRadius: 100,
              border: `1.5px solid ${dark ? '#333' : C.border}`,
              padding: '10px 16px', fontSize: 14,
              background: dark ? '#0E0E0E' : C.offWhite,
              color: dark ? C.darkText : C.charcoal,
              outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          />
          <button
            onClick={doSend}
            disabled={!text.trim() || send.isPending}
            style={{
              width: 40, height: 40, borderRadius: '50%', border: 'none', flexShrink: 0,
              background: text.trim() ? C.orange : (dark ? '#2A2A2A' : '#E5E5E5'),
              color: text.trim() ? C.white : C.tertiary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: text.trim() ? 'pointer' : 'default',
              transition: 'background 0.15s',
            }}
          >
            <Send style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Page content ─────────────────────────────────────────────────────────────
function MessagesContent() {
  const { dark } = useDarkMode()
  const { user } = useAuth()
  const qc = useQueryClient()
  const { data: conversations = [], isLoading: convsLoading } = useConversations()
  const [selectedId, setSelectedId] = useState<number | undefined>()

  // Sort conversations by last_message_at descending (most recent first)
  const sorted = [...conversations].sort((a, b) => {
    if (!a.last_message_at && !b.last_message_at) return 0
    if (!a.last_message_at) return 1
    if (!b.last_message_at) return -1
    return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  })

  // Fetching messages marks them as read server-side; refresh conversation list
  // shortly after opening so unread counts update
  useEffect(() => {
    if (!selectedId) return
    const t = setTimeout(() => {
      qc.invalidateQueries({ queryKey: ['conversations'] })
    }, 1200)
    return () => clearTimeout(t)
  }, [selectedId, qc])

  const selected = conversations.find(c => c.id === selectedId)
  const borderColor = dark ? '#2A2A2A' : C.border
  const bg = dark ? '#161616' : C.white

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '320px 1fr',
      height: 'calc(100vh - 120px)',
      borderRadius: 20,
      overflow: 'hidden',
      border: `1px solid ${borderColor}`,
    }}>

      {/* ── Left panel: inbox ── */}
      <div style={{
        borderRight: `1px solid ${borderColor}`,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        background: dark ? '#1A1A1A' : C.white,
      }}>
        {/* Inbox header */}
        <div style={{
          padding: '18px 16px 14px',
          borderBottom: `1px solid ${borderColor}`,
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: dark ? C.darkText : C.charcoal }}>
            Messages
          </div>
          {!convsLoading && (
            <div style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>
              {sorted.length} conversation{sorted.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Conversation list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
          {convsLoading ? (
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: dark ? '#2A2A2A' : '#F0EDE6',
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 12, width: '55%', background: dark ? '#2A2A2A' : '#F0EDE6', borderRadius: 6, marginBottom: 6 }} />
                    <div style={{ height: 10, width: '75%', background: dark ? '#2A2A2A' : '#F0EDE6', borderRadius: 6 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100%',
              textAlign: 'center' as const, padding: '32px 20px',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16, marginBottom: 14,
                background: dark ? '#2A2A2A' : '#F0EDE6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MessageSquare style={{ width: 22, height: 22, color: C.orange }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: dark ? C.darkText : C.charcoal, marginBottom: 6 }}>
                No conversations yet
              </div>
              <div style={{ fontSize: 12, color: C.secondary, lineHeight: 1.6 }}>
                Start a conversation from the Mentorship page.
              </div>
            </div>
          ) : (
            sorted.map(conv => (
              <ConvItem
                key={conv.id}
                conv={conv}
                active={selectedId === conv.id}
                dark={dark}
                onClick={() => setSelectedId(conv.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right panel: chat ── */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: bg }}>
        {!selectedId ? (
          /* Empty state — no conversation selected */
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            height: '100%', textAlign: 'center' as const, padding: 40,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, marginBottom: 18,
              background: dark ? '#2A2A2A' : '#F0EDE6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MessageSquare style={{ width: 28, height: 28, color: C.orange }} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: dark ? C.darkText : C.charcoal, marginBottom: 8 }}>
              Select a conversation
            </div>
            <div style={{ fontSize: 13, color: C.secondary }}>
              Choose a chat from the left to read and reply.
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{
              padding: '14px 20px',
              borderBottom: `1px solid ${borderColor}`,
              display: 'flex', alignItems: 'center', gap: 12,
              flexShrink: 0, background: bg,
            }}>
              <AvatarCircle name={selected?.other_user_name ?? '?'} size={38} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: dark ? C.darkText : C.charcoal }}>
                  {selected?.other_user_name}
                </div>
                <div style={{ fontSize: 11, color: C.secondary }}>Direct message</div>
              </div>
            </div>

            {/* Messages + input */}
            {user && (
              <ChatPanel convId={selectedId} myId={user.id} dark={dark} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <DashboardLayout>
      <MessagesContent />
    </DashboardLayout>
  )
}
