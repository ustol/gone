import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { useSearchAnnouncements } from '@/hooks/use-announcements'
import { Input } from '@/components/ui/input'
import AnnouncementCard from '@/components/announcements/AnnouncementCard'
import { useDebounce } from '@/hooks/use-debounce'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 350)
  const { data: results = [], isLoading, isFetching } = useSearchAnnouncements(debouncedQuery)

  const searching = (isLoading || isFetching) && debouncedQuery.length >= 2

  return (
    <div className="container py-10">
      <div className="max-w-xl mx-auto mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-center">Search Announcements</h1>
        <p className="text-muted-foreground text-center mb-6">
          Search by name, place of death, or date.
        </p>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          {searching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
          <Input
            type="search"
            placeholder="Search by surname, first name, place of death…"
            className="pl-12 pr-10 h-12 text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {debouncedQuery.length < 2 && (
        <div className="text-center text-muted-foreground py-12">
          Type at least 2 characters to search.
        </div>
      )}

      {debouncedQuery.length >= 2 && !searching && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No results for "<strong>{debouncedQuery}</strong>"</p>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {results.length} result{results.length !== 1 ? 's' : ''} for "{debouncedQuery}"
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((announcement) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
