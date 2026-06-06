import { Link } from 'react-router-dom'
import { Plus, Bell, Heart, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useMyAnnouncements } from '@/hooks/use-announcements'
import { useNotifications } from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatRelativeTime, getInitials } from '@/lib/utils'

export default function DashboardPage() {
  const { profile } = useAuth()
  const { data: announcements = [], isLoading: loadingAnn } = useMyAnnouncements()
  const { data: notifications = [], isLoading: loadingNotif } = useNotifications()

  const unreadNotifs = notifications.filter((n) => !n.is_read)
  const totalTributes = announcements.reduce((s, a) => s + a.tribute_count + a.condolence_count, 0)

  const stats = [
    { label: 'Announcements', value: announcements.length, icon: Heart, color: 'text-rose-500' },
    { label: 'Total Tributes', value: totalTributes, icon: Heart, color: 'text-purple-500' },
    { label: 'Unread Notifications', value: unreadNotifs.length, icon: Bell, color: 'text-blue-500' },
  ]

  return (
    <div className="container py-10">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {profile?.display_name ?? profile?.username}
          </h1>
          <p className="text-muted-foreground mt-1">Manage your memorial announcements.</p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/announcements/create">
            <Plus className="h-4 w-4" /> New Announcement
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color} opacity-70`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Announcements */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">My Announcements</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/my-announcements">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loadingAnn ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : announcements.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-3">No announcements yet.</p>
                  <Button asChild size="sm"><Link to="/announcements/create">Create one</Link></Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.slice(0, 5).map((ann) => (
                    <div key={ann.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="h-12 w-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                        {ann.image_url
                          ? <img src={ann.image_url} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-xs font-medium text-muted-foreground">
                              {getInitials(`${ann.first_name} ${ann.surname}`)}
                            </div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {ann.first_name} {ann.surname}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(ann.date_of_death)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {ann.tribute_count + ann.condolence_count} messages
                        </span>
                        {ann.moderation_mode === 'manual' && (
                          <Badge variant="secondary" className="text-[10px]">Manual</Badge>
                        )}
                        <Button variant="outline" size="sm" className="text-xs h-7" asChild>
                          <Link to={`/announcement/${ann.slug}`}>View</Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
                          <Link to={`/dashboard/announcement/${ann.id}/moderate`}>Manage</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Notifications */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Notifications</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/notifications">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loadingNotif ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No notifications yet.</p>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 6).map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex gap-3 p-2 rounded-lg text-sm ${!notif.is_read ? 'bg-primary/5' : ''}`}
                    >
                      <div className="mt-0.5">
                        {notif.type === 'tribute_approved' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {notif.type === 'tribute_rejected' && <XCircle className="h-4 w-4 text-red-500" />}
                        {(notif.type === 'new_tribute' || notif.type === 'new_condolence') && <Bell className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs">{notif.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notif.body}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{formatRelativeTime(notif.created_at)}</p>
                      </div>
                      {!notif.is_read && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
