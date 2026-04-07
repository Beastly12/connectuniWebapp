import { useState } from 'react'
import { BookOpen, Link as LinkIcon, PlusCircle, Search } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useResources, useCreateResource } from '@/hooks/useResources'
import { useAuth } from '@/hooks/useAuth'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

const CATEGORIES = ['career', 'academics', 'tech', 'finance', 'wellbeing', 'other']

function ShareResourceDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { profile } = useAuth()
  const createResource = useCreateResource()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('career')
  const [fileType, setFileType] = useState('link')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile || !title || !url) return
    try {
      await createResource.mutateAsync({
        uploadedBy: profile.user_id,
        title,
        description: description || undefined,
        url,
        category,
        fileType,
      })
      toast.success('Resource shared!')
      onOpenChange(false)
      setTitle(''); setDescription(''); setUrl('')
    } catch {
      toast.error('Failed to share resource')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Share Resource</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Title</Label>
            <Input className="h-9" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Resource name" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">URL</Label>
            <Input className="h-9" type="url" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Type</Label>
              <Select value={fileType} onValueChange={setFileType}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['link', 'pdf', 'video', 'article', 'tool'].map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea className="resize-none text-sm" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Brief description…" />
          </div>
          <DialogFooter className="gap-2 pt-1">
            <Button variant="outline" size="sm" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button size="sm" type="submit" disabled={createResource.isPending}>
              {createResource.isPending ? 'Sharing…' : 'Share'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function ResourcesPage() {
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [shareOpen, setShareOpen] = useState(false)
  const { data: resources = [], isLoading } = useResources(category !== 'all' ? category : undefined)

  const filtered = resources.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.title.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
  })

  return (
    <DashboardLayout>
      <div className="relative p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-5 w-5 items-center justify-center rounded-md gradient-primary">
                <BookOpen className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Resources</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
            <p className="mt-1 text-sm text-muted-foreground">Curated resources from the ConnectUni community</p>
          </div>
          <Button onClick={() => setShareOpen(true)} size="sm" className="h-9 text-xs font-semibold gradient-primary border-0 text-white shadow-glow-sm hover:opacity-90">
            <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
            Share
          </Button>
        </div>

        {/* Search + filter */}
        <div className="space-y-3">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {['all', ...CATEGORIES].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors',
                  category === c
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed border-border/40 bg-muted/10">
            <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/40 border border-border/30">
                <BookOpen className="h-7 w-7 text-muted-foreground/30" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">No resources found</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  {search ? 'Try different keywords' : 'Be the first to share one'}
                </p>
              </div>
              <Button size="sm" className="h-8 text-xs gradient-primary border-0 text-white shadow-glow-sm hover:opacity-90" onClick={() => setShareOpen(true)}>
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                Share a resource
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((resource) => (
              <div key={resource.id} className="glass-card rounded-xl p-4 space-y-2.5 hover:border-primary/25 hover:shadow-glow-sm transition-all duration-200">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold line-clamp-1 flex-1 min-w-0">{resource.title}</h3>
                  <Badge className="text-[10px] h-5 px-1.5 shrink-0 capitalize bg-accent/60 text-accent-foreground border-border/30">
                    {resource.category}
                  </Badge>
                </div>
                {resource.description && (
                  <p className="text-xs text-muted-foreground/75 line-clamp-2 leading-relaxed">{resource.description}</p>
                )}
                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={resource.uploader?.avatar_url} />
                      <AvatarFallback className="text-[9px] bg-muted">
                        {getInitials(resource.uploader?.full_name ?? 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground/70">{formatRelativeTime(resource.created_at)}</span>
                  </div>
                  <Button
                    size="sm"
                    className="h-7 px-2.5 text-xs font-semibold gradient-primary border-0 text-white shadow-glow-sm hover:opacity-90"
                    onClick={() => window.open(resource.url, '_blank')}
                  >
                    <LinkIcon className="mr-1 h-3 w-3" />
                    Open
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ShareResourceDialog open={shareOpen} onOpenChange={setShareOpen} />
    </DashboardLayout>
  )
}
