import { useState } from 'react'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import { useToggleLike } from '@/hooks/useCommunity'
import type { Post } from '@/lib/types'
import { CommentThread } from './CommentThread'

interface PostCardProps {
  post: Post
  currentUserId?: string
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const toggleLike = useToggleLike()

  function handleLike() {
    if (!currentUserId) return
    toggleLike.mutate({ postId: post.id, userId: currentUserId, hasLiked: post.user_has_liked ?? false })
  }

  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={post.author?.avatar_url} />
              <AvatarFallback className="text-xs">
                {getInitials(post.author?.full_name ?? 'U')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{post.author?.full_name ?? 'Unknown'}</p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(post.created_at)}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">{post.category}</Badge>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

        <Separator />

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${post.user_has_liked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground'}`}
            onClick={handleLike}
            disabled={!currentUserId}
          >
            <Heart className={`h-4 w-4 ${post.user_has_liked ? 'fill-current' : ''}`} />
            <span className="text-xs">{post.likes_count}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={() => setShowComments((v) => !v)}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{post.comments_count}</span>
          </Button>

          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground ml-auto">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {showComments && currentUserId && (
          <CommentThread postId={post.id} currentUserId={currentUserId} />
        )}
      </CardContent>
    </Card>
  )
}
