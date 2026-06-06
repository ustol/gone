import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useAnnouncements } from '@/hooks/use-announcements'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import AnnouncementCard from '@/components/announcements/AnnouncementCard'

export default function AnnouncementsListPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { data, isLoading } = useAnnouncements(page)

  const pageSize = 12
  const totalPages = data ? Math.ceil(data.count / pageSize) : 1

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground mt-1">
            {data ? `${data.count.toLocaleString()} memorial announcements` : 'Memorial announcements'}
          </p>
        </div>
        {user && (
          <Button asChild>
            <Link to="/announcements/create" className="gap-2">
              <Plus className="h-4 w-4" /> New Announcement
            </Link>
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, place…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No announcements yet.</p>
          {user && (
            <Button asChild className="mt-4">
              <Link to="/announcements/create">Create the first one</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.data.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
