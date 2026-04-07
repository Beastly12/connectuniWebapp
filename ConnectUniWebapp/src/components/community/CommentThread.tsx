import { useState } from 'react'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import { useComments, useAddComment } from '@/hooks/useCommunity'

interface CommentThreadProps {
  postId: string
  currentUserId: string
}

export function CommentThread({ postId, currentUserId }: CommentThreadProps) {
  const { data: comments = [], isLoading } = useComments(postId)
  const addComment = useAddComment()
  const [text, setText] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    try {
      await addComment.mutateAsync({ postId, authorId: currentUserId, content: text.trim() })
      setText('')
    } catch {
      toast.error('Failed to add comment')
    }
  }

  return (
    <div className="space-y-3 pt-1">
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarImage src={c.author?.avatar_url} />
                <AvatarFallback className="text-[10px]">
                  {getInitials(c.author?.full_name ?? 'U')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 rounded-lg bg-muted px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{c.author?.full_name}</span>
                  <span className="text-[10px] text-muted-foreground">{formatRelativeTime(c.created_at)}</span>
                </div>
                <p className="text-xs">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Write a comment…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="h-8 text-sm"
        />
        <Button type="submit" size="icon" className="h-8 w-8 shrink-0" disabled={!text.trim() || addComment.isPending}>
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  )
}
