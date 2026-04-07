import { useState } from 'react'
import { Briefcase, Search, MapPin, Clock, ExternalLink, PlusCircle, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useJobs, useCreateJob, useApplyJob, useMyApplications } from '@/hooks/useCareers'
import { useAuth } from '@/hooks/useAuth'
import { formatRelativeTime } from '@/lib/utils'
import type { Job } from '@/lib/types'

const JOB_TYPES = ['full-time', 'part-time', 'internship', 'contract', 'remote']

function JobCard({ job, onApply }: { job: Job; onApply: (job: Job) => void }) {
  return (
    <div className="glass-card rounded-xl p-4 space-y-2.5 hover:border-primary/25 hover:shadow-glow-sm transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold truncate">{job.title}</h3>
          <p className="text-xs text-muted-foreground">{job.company}</p>
        </div>
        <Badge className="shrink-0 capitalize text-[10px] h-5 px-1.5 bg-accent/60 text-accent-foreground border-border/30">
          {job.job_type.replace('-', ' ')}
        </Badge>
      </div>

      {job.description && (
        <p className="text-xs text-muted-foreground/75 line-clamp-2 leading-relaxed">{job.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground/70">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {job.location}
          </span>
        )}
        {job.salary_range && (
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {job.salary_range}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatRelativeTime(job.created_at)}
        </span>
      </div>

      <div className="flex items-center gap-2 pt-0.5">
        <Button
          size="sm"
          className="h-7 px-3 text-xs flex-1 font-semibold gradient-primary border-0 text-white shadow-glow-sm hover:opacity-90"
          onClick={() => onApply(job)}
        >
          Apply Now
        </Button>
        {job.apply_url && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0 border-border/50"
            onClick={() => window.open(job.apply_url, '_blank')}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}

function ApplyDialog({
  job,
  open,
  onOpenChange,
}: {
  job: Job | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { profile } = useAuth()
  const applyJob = useApplyJob()
  const [coverLetter, setCoverLetter] = useState('')

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    if (!job || !profile) return
    try {
      await applyJob.mutateAsync({ jobId: job.id, userId: profile.user_id, coverLetter })
      toast.success('Application submitted!')
      onOpenChange(false)
      setCoverLetter('')
    } catch {
      toast.error('Failed to submit application')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Apply to {job?.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleApply} className="space-y-4">
          <div className="rounded-lg bg-muted/50 border border-border/50 px-3.5 py-3">
            <p className="text-sm font-medium">{job?.company}</p>
            {job?.location && <p className="text-xs text-muted-foreground mt-0.5">{job.location}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Cover Letter <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={4}
              className="resize-none text-sm"
              placeholder="Tell them why you're a great fit…"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button size="sm" type="submit" disabled={applyJob.isPending}>
              {applyJob.isPending ? 'Submitting…' : 'Submit Application'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function PostJobDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { profile } = useAuth()
  const createJob = useCreateJob()
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState(profile?.company ?? '')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('full-time')
  const [salary, setSalary] = useState('')
  const [applyUrl, setApplyUrl] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile || !title || !company || !description) return
    try {
      await createJob.mutateAsync({
        postedBy: profile.user_id,
        title, company, description,
        location: location || undefined,
        jobType,
        salary: salary || undefined,
        applyUrl: applyUrl || undefined,
      })
      toast.success('Job posted!')
      onOpenChange(false)
    } catch {
      toast.error('Failed to post job')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Post a Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Job Title</Label>
            <Input className="h-9" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Software Engineer" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Company</Label>
            <Input className="h-9" value={company} onChange={(e) => setCompany(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Type</Label>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Location</Label>
              <Input className="h-9" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or Remote" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Salary Range <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input className="h-9" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="e.g. £40k–£60k" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea className="resize-none text-sm" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required placeholder="Describe the role and requirements…" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">External Apply URL <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input className="h-9" type="url" value={applyUrl} onChange={(e) => setApplyUrl(e.target.value)} placeholder="https://" />
          </div>
          <DialogFooter className="gap-2 pt-1">
            <Button variant="outline" size="sm" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button size="sm" type="submit" disabled={createJob.isPending}>
              {createJob.isPending ? 'Posting…' : 'Post Job'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function CareersPage() {
  const { profile } = useAuth()
  const [search, setSearch] = useState('')
  const [jobType, setJobType] = useState('all')
  const [applyJob, setApplyJob] = useState<Job | null>(null)
  const [applyOpen, setApplyOpen] = useState(false)
  const [postOpen, setPostOpen] = useState(false)
  const { data: jobs = [], isLoading } = useJobs({ type: jobType, search })
  const { data: applications = [] } = useMyApplications(profile?.user_id)

  const appliedJobIds = new Set(applications.map((a) => a.job_id))

  function handleApply(job: Job) {
    if (appliedJobIds.has(job.id)) {
      toast.info('You already applied to this job')
      return
    }
    setApplyJob(job)
    setApplyOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="relative p-6 space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-5 w-5 items-center justify-center rounded-md gradient-primary">
                <Briefcase className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Careers</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Careers</h1>
            <p className="mt-1 text-sm text-muted-foreground">Jobs and opportunities from the alumni network</p>
          </div>
          <Button onClick={() => setPostOpen(true)} size="sm" className="h-9 text-xs font-semibold gradient-primary border-0 text-white shadow-glow-sm hover:opacity-90">
            <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
            Post Job
          </Button>
        </div>

        <Tabs defaultValue="browse">
          <TabsList className="h-9">
            <TabsTrigger value="browse" className="text-xs">Browse Jobs</TabsTrigger>
            <TabsTrigger value="applications" className="text-xs">
              My Applications
              {applications.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 min-w-4 px-1">
                  {applications.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue placeholder="Job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {JOB_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-36 w-full rounded-lg" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <Card className="border-dashed border-border/40 bg-muted/10">
                <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/40 border border-border/30">
                    <Briefcase className="h-7 w-7 text-muted-foreground/30" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">No jobs found</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">Try different filters</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs border-border/50" onClick={() => { setSearch(''); setJobType('all') }}>
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} onApply={handleApply} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-2 mt-4">
            {applications.length === 0 ? (
              <Card className="border-dashed border-border/40 bg-muted/10">
                <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/40 border border-border/30">
                    <Briefcase className="h-7 w-7 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm text-muted-foreground">No applications yet</p>
                </CardContent>
              </Card>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="glass-card rounded-xl p-3.5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{app.job?.title}</p>
                    <p className="text-xs text-muted-foreground">{app.job?.company}</p>
                  </div>
                  <Badge
                    className={cn(
                      'capitalize text-[10px] h-5 px-1.5 shrink-0 border-0',
                      app.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-400'
                      : app.status === 'rejected' ? 'bg-destructive/15 text-destructive'
                      : 'bg-muted/60 text-muted-foreground'
                    )}
                  >
                    {app.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground/60 shrink-0">
                    {formatRelativeTime(app.applied_at)}
                  </span>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ApplyDialog job={applyJob} open={applyOpen} onOpenChange={setApplyOpen} />
      <PostJobDialog open={postOpen} onOpenChange={setPostOpen} />
    </DashboardLayout>
  )
}
