import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Heart, MessageSquare, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTributes, useSubmitTribute } from '@/hooks/use-tributes'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import type { AnnouncementWithProfile } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import AiGrammarCheckModal from './AiGrammarCheckModal'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'

const schema = z.object({
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Max 1000 characters'),
  type: z.enum(['tribute', 'condolence']),
})
type FormData = z.infer<typeof schema>

interface Props {
  announcement: AnnouncementWithProfile
}

export default function TributeSection({ announcement }: Props) {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'tribute' | 'condolence'>('tribute')
  const { data: tributes = [], isLoading } = useTributes(announcement.id)
  const { mutateAsync, isPending } = useSubmitTribute(announcement.id)

  const approvedTributes = tributes.filter((t) => t.type === 'tribute')
  const approvedCondolences = tributes.filter((t) => t.type === 'condolence')

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'tribute' },
  })

  const messageValue = watch('message') ?? ''

  async function onSubmit(data: FormData) {
    try {
      await mutateAsync({
        announcement_id: announcement.id,
        author_id: user!.id,
        type: data.type,
        message: data.message,
        auto_approve: announcement.moderation_mode === 'auto',
      })
      reset()
      const pending = announcement.moderation_mode === 'manual'
      toast({
        title: pending ? 'Submitted for review' : `${data.type === 'tribute' ? 'Tribute' : 'Condolence'} posted`,
        description: pending
          ? 'Your message has been submitted and will appear after approval.'
          : 'Your message is now visible.',
      })
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: (err as Error).message })
    }
  }

  return (
    <div>
      {/* Submit form */}
      {user ? (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(profile?.display_name ?? profile?.username ?? 'U')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">{profile?.display_name ?? profile?.username}</p>
                <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'tribute' | 'condolence'); setValue('type', v as 'tribute' | 'condolence') }}>
                  <TabsList className="h-8 mb-3">
                    <TabsTrigger value="tribute" className="text-xs gap-1.5">
                      <Heart className="h-3.5 w-3.5" /> Write a tribute
                    </TabsTrigger>
                    <TabsTrigger value="condolence" className="text-xs gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" /> Send condolences
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="tribute">
                    <p className="text-xs text-muted-foreground mb-2">Share a memory or tribute for the deceased.</p>
                  </TabsContent>
                  <TabsContent value="condolence">
                    <p className="text-xs text-muted-foreground mb-2">Offer your condolences to the family.</p>
                  </TabsContent>
                </Tabs>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  <input type="hidden" {...register('type')} />
                  <Textarea
                    placeholder={activeTab === 'tribute' ? 'Share a cherished memory…' : 'May your heart find peace in this difficult time…'}
                    rows={4}
                    {...register('message')}
                  />
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${messageValue.length > 1000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {messageValue.length}/1000
                    </span>
                  </div>
                  {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}

                  <div className="flex items-center gap-2 flex-wrap">
                    <AiGrammarCheckModal
                      text={messageValue}
                      onUseImproved={(improved) => setValue('message', improved)}
                    />
                    <div className="flex-1" />
                    {announcement.moderation_mode === 'manual' && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Lock className="h-3 w-3" /> Requires approval
                      </div>
                    )}
                    <Button type="submit" size="sm" disabled={isPending}>
                      {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                      Post {activeTab === 'tribute' ? 'Tribute' : 'Condolence'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8 bg-muted/30">
          <CardContent className="py-6 text-center">
            <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">Sign in to leave a tribute or condolence</p>
            <p className="text-xs text-muted-foreground mb-4">Join the community to honour and remember together.</p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth/register">Create account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tributes & Condolences */}
      <Tabs defaultValue="tributes">
        <TabsList className="mb-6">
          <TabsTrigger value="tributes" className="gap-1.5">
            <Heart className="h-3.5 w-3.5" /> Tributes ({approvedTributes.length})
          </TabsTrigger>
          <TabsTrigger value="condolences" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" /> Condolences ({approvedCondolences.length})
          </TabsTrigger>
        </TabsList>

        {[
          { key: 'tributes', items: approvedTributes },
          { key: 'condolences', items: approvedCondolences },
        ].map(({ key, items }) => (
          <TabsContent key={key} value={key}>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No {key} yet. Be the first to share.
              </p>
            ) : (
              <div className="space-y-4">
                {items.map((tribute) => (
                  <div key={tribute.id} className="flex gap-3">
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      <AvatarImage src={tribute.profiles?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(tribute.profiles?.display_name ?? tribute.profiles?.username ?? 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {tribute.profiles?.display_name ?? tribute.profiles?.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(tribute.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {tribute.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
