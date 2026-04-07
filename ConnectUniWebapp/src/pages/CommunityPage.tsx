import { useState, useEffect } from 'react'
import {
  Globe,
  GraduationCap,
  Users,
  Star,
  MapPin,
  Search,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Plus,
  TrendingUp,
  Filter,
  Compass,
  Send,
  Lock,
} from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  useCommunities,
  useCommunityMessages,
  useSendCommunityMessage,
  useJoinCommunity,
  useToggleReaction,
} from '@/hooks/useCommunity'
import type { Community, CommunityMessage } from '@/hooks/useCommunity'
import { useAuth } from '@/hooks/useAuth'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({
  msg,
  communityId,
  community,
}: {
  msg: CommunityMessage
  communityId: number
  community: Community | undefined
}) {
  const toggleReaction = useToggleReaction()
  const totalReactions = msg.reactions.reduce((sum, r) => sum + r.count, 0)
  const hasLiked = msg.reactions.some((r) => r.emoji === '❤️' && r.reacted)

  // Extract hashtags from content
  const hashtags = msg.content ? Array.from(msg.content.matchAll(/#\w+/g), (m) => m[0]) : []
  const contentText = msg.content ? msg.content.replace(/#\w+/g, '').trim() : ''

  const roleBadge =
    community?.type === 'alumni'
      ? 'Alumni'
      : community?.type === 'student'
        ? 'Student'
        : community?.type === 'mentor'
          ? 'Mentor'
          : 'Member'

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-3.5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={msg.sender_avatar_url ?? undefined} />
            <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-sm">
              {getInitials(msg.sender_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm">{msg.sender_name}</span>
              <span className="text-[10px] font-medium text-primary flex items-center gap-0.5">
                ✓ {roleBadge}
              </span>
              {community?.university && (
                <span className="text-[10px] font-medium text-primary flex items-center gap-0.5">
                  ✓ {community.university}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              {community?.name} · {formatRelativeTime(msg.created_at)}
              {community?.is_private && <Lock className="h-3 w-3" />}
            </p>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/50 transition-colors">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      {msg.content && (
        <p className="text-sm leading-relaxed text-foreground/90">
          {contentText || msg.content}
        </p>
      )}

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {hashtags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-3 py-1 rounded-full bg-accent/60 text-accent-foreground border border-border/30 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Reactions row */}
      {msg.reactions.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {msg.reactions.map((r) => (
            <button
              key={r.emoji}
              type="button"
              onClick={() =>
                toggleReaction.mutate({ communityId, messageId: msg.id, emoji: r.emoji })
              }
              className={cn(
                'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs border transition-colors',
                r.reacted
                  ? 'bg-accent border-primary/30 text-accent-foreground'
                  : 'bg-muted/50 border-border/30 hover:bg-muted'
              )}
            >
              {r.emoji} {r.count}
            </button>
          ))}
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between pt-1 border-t border-border/30">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              toggleReaction.mutate({ communityId, messageId: msg.id, emoji: '❤️' })
            }
            className={cn(
              'flex items-center gap-1.5 text-xs transition-colors',
              hasLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'
            )}
          >
            <Heart className={cn('h-4 w-4', hasLiked && 'fill-current')} />
            {totalReactions}
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            0
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bookmark className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Filter pill config ───────────────────────────────────────────────────────

const STATIC_FILTERS = [
  { id: 'all', label: 'All Communities', icon: Globe },
  { id: 'student', label: 'Students Only', icon: GraduationCap },
  { id: 'alumni', label: 'Alumni Only', icon: Users },
  { id: 'mentor', label: 'Mentors & Experts', icon: Star },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  useAuth()
  const { data: communities = [], isLoading: commLoading } = useCommunities()
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeTab, setActiveTab] = useState<'feed' | 'trending' | 'discover'>('feed')
  const [showNewPost, setShowNewPost] = useState(false)
  const [newPostText, setNewPostText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: messages = [], isLoading: msgLoading } = useCommunityMessages(activeCommunity?.id)
  const sendMessage = useSendCommunityMessage()
  const joinCommunity = useJoinCommunity()

  // Auto-select first community on load
  useEffect(() => {
    if (communities.length > 0 && !activeCommunity) {
      setActiveCommunity(communities[0])
    }
  }, [communities, activeCommunity])

  // Build dynamic university/location filter pills from data
  const universityPills = communities
    .filter((c) => c.university)
    .reduce(
      (acc, c) => {
        if (!acc.find((p) => p.label === c.university)) {
          acc.push({ id: `uni_${c.university}`, label: c.university!, icon: MapPin })
        }
        return acc
      },
      [] as { id: string; label: string; icon: React.ElementType }[]
    )
    .slice(0, 2)

  const filterPills = [...STATIC_FILTERS, ...universityPills]

  // Trending topics derived from communities
  const trendingTopics = [...communities]
    .sort((a, b) => b.member_count - a.member_count)
    .slice(0, 3)
    .map((c) => ({ tag: `#${c.name.replace(/\s+/g, '')}`, count: c.member_count }))

  // Search filter over messages
  const filteredMessages = searchQuery
    ? messages.filter(
        (m) =>
          m.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.sender_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages

  function handleFilterClick(filterId: string) {
    setActiveFilter(filterId)
    if (filterId === 'all') {
      setActiveCommunity(communities[0] ?? null)
      return
    }
    if (filterId.startsWith('uni_')) {
      const uni = filterId.replace('uni_', '')
      const match = communities.find((c) => c.university === uni)
      if (match) setActiveCommunity(match)
      return
    }
    const match = communities.find((c) => c.type === filterId)
    if (match) setActiveCommunity(match)
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!newPostText.trim() || !activeCommunity) return
    try {
      await sendMessage.mutateAsync({ communityId: activeCommunity.id, content: newPostText.trim() })
      setNewPostText('')
      setShowNewPost(false)
      toast.success('Post shared!')
    } catch {
      toast.error('Failed to post')
    }
  }

  async function handleJoin(communityId: number) {
    try {
      await joinCommunity.mutateAsync(communityId)
      toast.success('Joined community!')
    } catch {
      toast.error('Failed to join')
    }
  }

  const displayedMessages = activeTab === 'trending'
    ? [...filteredMessages].sort(
        (a, b) =>
          b.reactions.reduce((s, r) => s + r.count, 0) -
          a.reactions.reduce((s, r) => s + r.count, 0)
      )
    : [...filteredMessages].reverse()

  return (
    <DashboardLayout>
      <ScrollArea className="h-[calc(100vh-3.5rem)] lg:h-screen">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">

          {/* ── Header ── */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">Community</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Connect, share, and learn together
              </p>
            </div>
            <Button
              onClick={() => setShowNewPost((v) => !v)}
              className="gradient-primary border-0 text-white shadow-glow-sm hover:opacity-90 gap-1.5 shrink-0"
            >
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </div>

          {/* ── New Post Form ── */}
          {showNewPost && (
            <div className="bg-card border border-border/50 rounded-2xl p-4">
              <form onSubmit={handlePost} className="space-y-3">
                <Textarea
                  placeholder={
                    activeCommunity
                      ? `Share something with ${activeCommunity.name}…`
                      : 'Select a community first…'
                  }
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  className="min-h-[100px] bg-muted/40 border-border/40 resize-none"
                  disabled={!activeCommunity}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowNewPost(false)
                      setNewPostText('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="gradient-primary border-0 text-white gap-1.5"
                    disabled={!newPostText.trim() || !activeCommunity || sendMessage.isPending}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Post
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* ── Filter Pills ── */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 text-xs text-muted-foreground hover:bg-muted/50 transition-colors shrink-0"
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
            </button>
            {filterPills.map((pill) => {
              const IconComp = pill.icon
              const isActive = activeFilter === pill.id
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => handleFilterClick(pill.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all shrink-0',
                    isActive
                      ? 'gradient-primary border-0 text-white shadow-glow-sm'
                      : 'border-border/50 text-foreground/70 hover:bg-muted/50 bg-background'
                  )}
                >
                  <IconComp className="h-3.5 w-3.5" />
                  {pill.label}
                </button>
              )
            })}
          </div>

          {/* ── Two-column layout ── */}
          <div className="flex gap-6 items-start">

            {/* Feed */}
            <div className="flex-1 min-w-0 space-y-4">

              {/* Tabs */}
              <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/30 w-fit">
                {(
                  [
                    { id: 'feed', label: 'Feed', Icon: null },
                    { id: 'trending', label: 'Trending', Icon: TrendingUp },
                    { id: 'discover', label: 'Discover', Icon: Compass },
                  ] as const
                ).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      'flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                      activeTab === id
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {label}
                  </button>
                ))}
              </div>

              {/* Active community indicator */}
              {activeCommunity && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Showing posts from{' '}
                    <span className="font-medium text-foreground">{activeCommunity.name}</span>
                  </p>
                  <Badge className="text-[10px] h-5 px-1.5 capitalize bg-accent/60 text-accent-foreground border-border/30">
                    {activeCommunity.type}
                  </Badge>
                </div>
              )}

              {/* Posts */}
              {msgLoading || commLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-44 rounded-2xl" />
                  ))}
                </div>
              ) : !activeCommunity ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary-subtle border border-primary/20 shadow-glow-sm">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">No community selected</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose a community from the sidebar or join one to see posts
                    </p>
                  </div>
                </div>
              ) : displayedMessages.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary-subtle border border-primary/20 shadow-glow-sm">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">No posts yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Be the first to share something!
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowNewPost(true)}
                    className="gradient-primary border-0 text-white gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    New Post
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedMessages.map((msg) => (
                    <PostCard
                      key={msg.id}
                      msg={msg}
                      communityId={activeCommunity.id}
                      community={activeCommunity}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="w-72 shrink-0 space-y-4">

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search community..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-card border-border/50"
                />
              </div>

              {/* Trending Topics */}
              {trendingTopics.length > 0 && (
                <div className="bg-card border border-border/50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">Trending Topics</h3>
                  </div>
                  <div className="space-y-3">
                    {trendingTopics.map((topic, i) => (
                      <div key={topic.tag} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{topic.tag}</p>
                          <p className="text-xs text-muted-foreground">
                            {topic.count.toLocaleString()} members
                          </p>
                        </div>
                        {i === trendingTopics.length - 1 && (
                          <Badge className="text-[10px] h-5 px-1.5 bg-accent text-accent-foreground border-0">
                            New
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Your Communities */}
              {communities.length > 0 && (
                <div className="bg-card border border-border/50 rounded-2xl p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm">Your Communities</h3>
                    <p className="text-xs text-muted-foreground">Quick access to your groups</p>
                  </div>
                  {commLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 rounded-xl" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {communities.slice(0, 5).map((comm) => (
                        <button
                          key={comm.id}
                          type="button"
                          onClick={() => {
                            setActiveCommunity(comm)
                            setActiveFilter('all')
                          }}
                          className={cn(
                            'w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all',
                            activeCommunity?.id === comm.id
                              ? 'bg-accent/60 text-foreground border border-primary/20'
                              : 'hover:bg-muted/50 text-foreground/80 hover:text-foreground'
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded-lg shrink-0 text-xs font-bold transition-all',
                              activeCommunity?.id === comm.id
                                ? 'gradient-primary text-white shadow-glow-sm'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {comm.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{comm.name}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Users className="h-2.5 w-2.5" />
                              {comm.member_count}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Discover communities */}
              {activeTab === 'discover' && communities.length > 5 && (
                <div className="bg-card border border-border/50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">Discover More</h3>
                  </div>
                  <div className="space-y-2">
                    {communities.slice(5).map((comm) => (
                      <div key={comm.id} className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground text-xs font-bold shrink-0">
                          {comm.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{comm.name}</p>
                          <p className="text-[10px] text-muted-foreground">{comm.member_count} members</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] px-2 shrink-0"
                          onClick={() => handleJoin(comm.id)}
                        >
                          Join
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </DashboardLayout>
  )
}
