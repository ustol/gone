import { useParams, Link } from 'react-router-dom'
import { Calendar, MapPin, Heart, MessageSquare, ArrowLeft, Pencil, Flower2 } from 'lucide-react'
import { useAnnouncement } from '@/hooks/use-announcements'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate, getAgeText, getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import TributeSection from '@/components/tributes/TributeSection'
import ShareMenu from '@/components/announcements/ShareMenu'
import PhotoGallery from '@/components/announcements/PhotoGallery'

export default function AnnouncementDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const { data: announcement, isLoading, error } = useAnnouncement(slug!)

  if (isLoading) {
    return (
      <div className="container max-w-3xl py-10 space-y-6">
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error || !announcement) {
    return (
      <div className="container max-w-3xl py-20 text-center">
        <h2 className="text-2xl font-semibold mb-2">Announcement not found</h2>
        <p className="text-muted-foreground mb-6">This announcement may have been removed or is unavailable.</p>
        <Button asChild><Link to="/announcements">Browse all</Link></Button>
      </div>
    )
  }

  const fullName = [announcement.first_name, announcement.other_names, announcement.surname].filter(Boolean).join(' ')
  const ageText = getAgeText(announcement.date_of_birth, announcement.date_of_death)
  const isOwner = user?.id === announcement.creator_id
  const shareUrl = window.location.href

  return (
    <div className="container max-w-3xl py-8">
      {/* Back */}
      <Link
        to="/announcements"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> All announcements
      </Link>

      {/* Hero image */}
      <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 mb-8">
        {announcement.image_url ? (
          <img src={announcement.image_url} alt={fullName} className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="h-28 w-28 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-semibold text-primary">
              {getInitials(fullName)}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-white text-3xl sm:text-4xl font-bold leading-tight">{fullName}</h1>
          {ageText && <p className="text-white/80 mt-1">{ageText}</p>}
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 text-primary" />
          <span>
            {announcement.date_of_birth ? `${formatDate(announcement.date_of_birth)} — ` : ''}
            {formatDate(announcement.date_of_death)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{announcement.place_of_death}</span>
        </div>
      </div>

      {/* Message */}
      <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
        <p className="text-base leading-relaxed whitespace-pre-wrap">{announcement.short_message}</p>
      </div>

      <Separator className="mb-6" />

      {/* Stats + Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Heart className="h-4 w-4 text-rose-500" />
            <span><strong>{announcement.tribute_count}</strong> tributes</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            <span><strong>{announcement.condolence_count}</strong> condolences</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/announcement/${announcement.slug}/edit`}>
                  <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/dashboard/announcement/${announcement.id}/moderate`}>Manage</Link>
              </Button>
            </>
          )}
          {announcement.wreath_board_enabled && (
            <Button variant="outline" size="sm" asChild className="gap-1.5 border-green-700 text-green-700 hover:bg-green-50 dark:hover:bg-green-950">
              <Link to={`/announcement/${announcement.slug}/wreaths`}>
                <Flower2 className="h-3.5 w-3.5" /> Wreath Board
              </Link>
            </Button>
          )}
          <ShareMenu url={shareUrl} title={`In memory of ${fullName}`} />
        </div>
      </div>

      {/* Posted by */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 mb-8">
        <Avatar>
          <AvatarImage src={announcement.profiles?.avatar_url ?? undefined} />
          <AvatarFallback>
            {getInitials(announcement.profiles?.display_name ?? announcement.profiles?.username ?? 'U')}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">
            Posted by {announcement.profiles?.display_name ?? announcement.profiles?.username}
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(announcement.created_at)}</p>
        </div>
        {announcement.moderation_mode === 'manual' && (
          <Badge variant="secondary" className="ml-auto">Moderated</Badge>
        )}
      </div>

      <Separator className="mb-8" />

      {/* Photo Gallery */}
      <div className="mb-10">
        <PhotoGallery announcementId={announcement.id} isOwner={isOwner} />
      </div>

      <Separator className="mb-8" />

      {/* Tributes section */}
      <TributeSection announcement={announcement} />
    </div>
  )
}
