import { CheckCircle, XCircle, Bell, Check } from 'lucide-react'
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/use-notifications'
import { formatRelativeTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications()
  const { mutate: markRead } = useMarkNotificationRead()
  const { mutate: markAllRead, isPending: markingAll } = useMarkAllNotificationsRead()

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="container max-w-2xl py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead()} disabled={markingAll}>
            <Check className="mr-2 h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex gap-4 p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/30 ${
                !notif.is_read ? 'bg-primary/5 border-primary/20' : ''
              }`}
              onClick={() => { if (!notif.is_read) markRead(notif.id) }}
            >
              <div className="flex-shrink-0 mt-0.5">
                {notif.type === 'tribute_approved' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {notif.type === 'tribute_rejected' && <XCircle className="h-5 w-5 text-red-500" />}
                {(notif.type === 'new_tribute' || notif.type === 'new_condolence') && (
                  <Bell className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium">{notif.title}</p>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatRelativeTime(notif.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{notif.body}</p>
              </div>
              {!notif.is_read && (
                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
