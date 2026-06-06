import { useParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Trash2, ArrowLeft } from 'lucide-react'
import { useAllTributesForOwner, useUpdateTributeStatus, useDeleteTribute } from '@/hooks/use-tributes'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import type { TributeWithProfile } from '@/types/database'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateModerationMode } from '@/services/announcementService'
import { useQueryClient } from '@tanstack/react-query'

export default function ModerationPage() {
  const { announcementId } = useParams<{ announcementId: string }>()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // We need to fetch the announcement by id — repurpose the hook with id lookup
  const { data: tributesAll = [], isLoading } = useAllTributesForOwner(announcementId!)
  const { mutate: updateStatus, isPending: updatingStatus } = useUpdateTributeStatus(announcementId!)
  const { mutate: deleteTribute } = useDeleteTribute(announcementId!)

  const pending = tributesAll.filter((t) => t.status === 'pending')
  const approved = tributesAll.filter((t) => t.status === 'approved')
  const rejected = tributesAll.filter((t) => t.status === 'rejected')

  function handleApprove(tribute: TributeWithProfile) {
    updateStatus(
      { id: tribute.id, status: 'approved', authorId: tribute.author_id },
      { onSuccess: () => toast({ title: 'Tribute approved' }) }
    )
  }

  function handleReject(tribute: TributeWithProfile) {
    updateStatus(
      { id: tribute.id, status: 'rejected', authorId: tribute.author_id },
      { onSuccess: () => toast({ title: 'Tribute rejected' }) }
    )
  }

  function handleDelete(id: string) {
    deleteTribute(id, { onSuccess: () => toast({ title: 'Deleted' }) })
  }

  async function handleModerationChange(mode: 'auto' | 'manual') {
    try {
      await updateModerationMode(announcementId!, mode)
      queryClient.invalidateQueries({ queryKey: ['announcement'] })
      toast({ title: `Moderation set to ${mode === 'auto' ? 'auto-approve' : 'manual review'}` })
    } catch {
      toast({ variant: 'destructive', title: 'Error updating moderation mode' })
    }
  }

  const TributeRow = ({ tribute }: { tribute: TributeWithProfile }) => (
    <div className="flex gap-3 p-4 rounded-lg border hover:bg-muted/30 transition-colors">
      <Avatar className="h-9 w-9 flex-shrink-0">
        <AvatarImage src={tribute.profiles?.avatar_url ?? undefined} />
        <AvatarFallback className="text-xs">
          {getInitials(tribute.profiles?.display_name ?? tribute.profiles?.username ?? 'U')}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-medium">{tribute.profiles?.display_name ?? tribute.profiles?.username}</span>
          <span className="text-xs text-muted-foreground">{formatRelativeTime(tribute.created_at)}</span>
          <Badge variant={tribute.type === 'tribute' ? 'default' : 'secondary'} className="text-[10px]">
            {tribute.type}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">{tribute.message}</p>
      </div>
      <div className="flex items-start gap-1.5 flex-shrink-0">
        {tribute.status === 'pending' && (
          <>
            <Button size="sm" variant="outline" className="h-8 gap-1 text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => handleApprove(tribute)} disabled={updatingStatus}>
              <CheckCircle className="h-3.5 w-3.5" /> Approve
            </Button>
            <Button size="sm" variant="outline" className="h-8 gap-1 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => handleReject(tribute)} disabled={updatingStatus}>
              <XCircle className="h-3.5 w-3.5" /> Reject
            </Button>
          </>
        )}
        {tribute.status === 'approved' && (
          <Button size="sm" variant="outline" className="h-8 gap-1 text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => handleReject(tribute)}>
            <XCircle className="h-3.5 w-3.5" /> Revoke
          </Button>
        )}
        {tribute.status === 'rejected' && (
          <Button size="sm" variant="outline" className="h-8 gap-1 text-green-600 border-green-200 hover:bg-green-50"
            onClick={() => handleApprove(tribute)}>
            <CheckCircle className="h-3.5 w-3.5" /> Re-approve
          </Button>
        )}
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          onClick={() => handleDelete(tribute.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="container max-w-3xl py-10">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Moderation Queue</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and manage tributes for this announcement.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Mode:</span>
          <Select onValueChange={handleModerationChange}>
            <SelectTrigger className="w-40 h-8 text-sm">
              <SelectValue placeholder="Set mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto Approve</SelectItem>
              <SelectItem value="manual">Manual Review</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
          </TabsList>

          {[
            { key: 'pending', items: pending },
            { key: 'approved', items: approved },
            { key: 'rejected', items: rejected },
          ].map(({ key, items }) => (
            <TabsContent key={key} value={key}>
              {items.length === 0
                ? <p className="text-sm text-muted-foreground text-center py-8">No {key} tributes.</p>
                : <div className="space-y-3">{items.map((t) => <TributeRow key={t.id} tribute={t} />)}</div>
              }
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
