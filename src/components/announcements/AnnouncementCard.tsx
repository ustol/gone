import { Link } from 'react-router-dom'
import { Calendar, MapPin, Heart, MessageSquare } from 'lucide-react'
import type { AnnouncementWithProfile } from '@/types/database'
import { formatDate, getAgeText, getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Props {
  announcement: AnnouncementWithProfile
}

export default function AnnouncementCard({ announcement }: Props) {
  const fullName = [announcement.first_name, announcement.other_names, announcement.surname]
    .filter(Boolean)
    .join(' ')

  const ageText = getAgeText(announcement.date_of_birth, announcement.date_of_death)

  return (
    <Link
      to={`/announcement/${announcement.slug}`}
      className="group block rounded-xl border bg-card text-card-foreground overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
        {announcement.image_url ? (
          <img
            src={announcement.image_url}
            alt={fullName}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-semibold text-primary">
              {getInitials(fullName)}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-semibold text-sm line-clamp-2 leading-snug">{fullName}</h3>
          {ageText && <p className="text-white/80 text-xs mt-0.5">{ageText}</p>}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{formatDate(announcement.date_of_death)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="line-clamp-1">{announcement.place_of_death}</span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{announcement.short_message}</p>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" /> {announcement.tribute_count}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" /> {announcement.condolence_count}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Avatar className="h-5 w-5">
              <AvatarImage src={announcement.profiles?.avatar_url ?? undefined} />
              <AvatarFallback className="text-[8px]">
                {getInitials(announcement.profiles?.display_name ?? announcement.profiles?.username ?? 'U')}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {announcement.profiles?.display_name ?? announcement.profiles?.username}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
