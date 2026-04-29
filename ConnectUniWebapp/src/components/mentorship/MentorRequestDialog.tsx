import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import { useSendMentorshipRequest } from '@/hooks/useMentorship'
import type { MentorProfile } from '@/hooks/useMentorship'
import { getErrorMessage } from '@/lib/api'

const GOALS = [
  'Career guidance',
  'Resume review',
  'Interview prep',
  'Networking',
  'Skill development',
]

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly', desc: 'Most intensive — 4× per month' },
  { value: 'bi-weekly', label: 'Bi-weekly', desc: 'Recommended — 2× per month' },
  { value: 'monthly', label: 'Monthly', desc: 'Light touch — 1× per month' },
]

interface MentorRequestDialogProps {
  mentor: MentorProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MentorRequestDialog({
  mentor,
  open,
  onOpenChange,
}: MentorRequestDialogProps) {
  const [step, setStep] = useState(1)
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [frequency, setFrequency] = useState('bi-weekly')
  const [message, setMessage] = useState('')
  const requestMentorship = useSendMentorshipRequest()

  function reset() {
    setStep(1)
    setSelectedGoals([])
    setFrequency('bi-weekly')
    setMessage('')
  }

  function handleClose() {
    reset()
    onOpenChange(false)
  }

  function toggleGoal(goal: string) {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    )
  }

  async function handleSubmit() {
    if (!mentor) return
    try {
      await requestMentorship.mutateAsync({
        mentor_id: mentor.user_id,
        goal: selectedGoals.length > 0 ? selectedGoals.join(', ') : 'General mentorship',
        meeting_frequency: frequency,
        session_length_minutes: 60,
        message: message || 'Hi, I would love to connect with you!',
      })
      toast.success('Mentorship request sent!')
      handleClose()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to send mentorship request'))
    }
  }

  if (!mentor) return null

  const stepLabels = ['Mentor', 'Goals', 'Schedule', 'Message']

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden">
        {/* Header with step indicator */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-base font-semibold">Request Mentorship</DialogTitle>
          <div className="flex items-center gap-1 mt-3">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-1">
                <div className="flex flex-col items-center gap-0.5">
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium transition-colors',
                      i + 1 < step
                        ? 'bg-primary text-primary-foreground'
                        : i + 1 === step
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary/20'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {i + 1 < step ? <CheckCircle className="h-3 w-3" /> : i + 1}
                  </div>
                  <span className={cn(
                    'text-[9px]',
                    i + 1 === step ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}>
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={cn(
                    'h-px w-8 mb-3.5 transition-colors',
                    i + 1 < step ? 'bg-primary' : 'bg-border'
                  )} />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          {/* Step 1: Mentor preview */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 rounded-lg border bg-muted/30 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-sm font-medium bg-accent text-accent-foreground">
                    {getInitials(mentor.user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-semibold">{mentor.user.full_name}</h3>
                  <p className="text-xs text-muted-foreground">{mentor.user.university_name}</p>
                </div>
              </div>
              {mentor.bio && (
                <p className="text-sm text-muted-foreground leading-relaxed">{mentor.bio}</p>
              )}
              {mentor.expertise_areas.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {mentor.expertise_areas.map((e) => (
                    <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">What do you hope to achieve?</p>
              <div className="space-y-1.5">
                {GOALS.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm text-left transition-colors',
                      selectedGoals.includes(goal)
                        ? 'border-primary bg-accent'
                        : 'border-border hover:bg-muted/40'
                    )}
                  >
                    <div className={cn(
                      'h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors',
                      selectedGoals.includes(goal)
                        ? 'bg-primary border-primary'
                        : 'border-border'
                    )}>
                      {selectedGoals.includes(goal) && (
                        <CheckCircle className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="font-normal">{goal}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Frequency */}
          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">How often would you like to meet?</p>
              <div className="space-y-2">
                {FREQUENCIES.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFrequency(f.value)}
                    className={cn(
                      'w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors',
                      frequency === f.value
                        ? 'border-primary bg-accent'
                        : 'border-border hover:bg-muted/40'
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                    {frequency === f.value && (
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Message + review */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Introduce yourself to {mentor.user.full_name}
                </Label>
                <Textarea
                  placeholder="Hi! I'm currently studying Computer Science and would love your guidance on breaking into the tech industry…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="resize-none text-sm"
                />
              </div>
              <div className="rounded-lg border bg-muted/30 p-3.5 space-y-2 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-medium text-muted-foreground w-20 shrink-0 pt-0.5">Goals</span>
                  <span className="text-xs">{selectedGoals.length > 0 ? selectedGoals.join(', ') : 'General mentorship'}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground w-20 shrink-0">Frequency</span>
                  <span className="text-xs capitalize">{frequency}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t px-6 py-4">
          {step > 1 ? (
            <Button variant="ghost" size="sm" className="h-8" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="h-8 text-muted-foreground" onClick={handleClose}>
              Cancel
            </Button>
          )}
          {step < 4 ? (
            <Button size="sm" className="h-8" onClick={() => setStep((s) => s + 1)}>
              Continue
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="sm" className="h-8" onClick={handleSubmit} disabled={requestMentorship.isPending}>
              {requestMentorship.isPending ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Sending…
                </span>
              ) : (
                <>
                  <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                  Send Request
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
