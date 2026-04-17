import { GraduationCap } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { MentorProfile } from '@/hooks/useMentorship'

interface MentorCardProps {
  mentor: MentorProfile
  onRequest: (mentor: MentorProfile) => void
  hasActiveRequest?: boolean
}

export function MentorCard({ mentor, onRequest, hasActiveRequest }: MentorCardProps) {
  return (
    <div className={cn(
      'glass-card rounded-xl p-4 transition-all duration-200 cursor-default group',
      !hasActiveRequest && mentor.is_active && 'hover:border-primary/25 hover:shadow-glow-sm'
    )}>
      <div className="flex items-start gap-3.5">
        <div className="shrink-0 relative">
          <Avatar className="h-11 w-11 ring-2 ring-border/40">
            <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-accent to-muted text-accent-foreground">
              {getInitials(mentor.user.full_name)}
            </AvatarFallback>
          </Avatar>
          {mentor.is_active && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <h3 className="text-sm font-bold truncate leading-tight">{mentor.user.full_name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <GraduationCap className="h-3 w-3 shrink-0 text-muted-foreground/60" />
              <span className="text-[11px] text-muted-foreground truncate">{mentor.user.university_name}</span>
            </div>
          </div>

          {mentor.bio && (
            <p className="text-xs text-muted-foreground/75 line-clamp-2 leading-relaxed">
              {mentor.bio}
            </p>
          )}

          {mentor.expertise_areas.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {mentor.expertise_areas.slice(0, 3).map((exp) => (
                <Badge key={exp} variant="secondary" className="text-[10px] h-5 px-1.5 bg-accent/60 text-accent-foreground/80 border-0">
                  {exp}
                </Badge>
              ))}
              {mentor.expertise_areas.length > 3 && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-muted-foreground border-border/40">
                  +{mentor.expertise_areas.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-1.5">
              {mentor.is_active ? (
                <span className="text-[10px] font-semibold text-emerald-400 tracking-wide">● Available</span>
              ) : (
                <span className="text-[10px] text-muted-foreground/50">Unavailable</span>
              )}
            </div>
            <Button
              size="sm"
              className={cn(
                'h-7 px-3 text-xs font-semibold transition-all',
                hasActiveRequest
                  ? 'border-border/50 text-muted-foreground'
                  : 'gradient-primary border-0 text-white shadow-glow-sm hover:opacity-90'
              )}
              onClick={() => onRequest(mentor)}
              disabled={hasActiveRequest || !mentor.is_active}
              variant={hasActiveRequest ? 'outline' : 'default'}
            >
              {hasActiveRequest ? 'Requested' : 'Connect'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
