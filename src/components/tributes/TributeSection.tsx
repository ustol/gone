import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Heart, MessageSquare, Lock, UserCircle2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTributes, useSubmitTribute } from '@/hooks/use-tributes'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import type { AnnouncementWithProfile } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AiGrammarCheckModal from './AiGrammarCheckModal'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'

const authSchema = z.object({
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Max 1000 characters'),
  type: z.enum(['tribute', 'condolence']),
})

const guestSchema = z.object({
  guest_name: z.string().min(2, 'Your name is required').max(80, 'Name is too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Max 1000 characters'),
  type: z.enum(['tribute', 'condolence']),
})

type AuthFormData = z.infer<typeof authSchema>
type GuestFormData = z.infer<typeof guestSchema>

interface Props {
  announcement: AnnouncementWithProfile
}

function displayName(tribute: { profiles: { display_name: string | null; username: string } | null; guest_name: string | null }) {
  return tribute.profiles?.display_name ?? tribute.profiles?.username ?? tribute.guest_name ?? 'Visitor'
}

export default function TributeSection({ announcement }: Props) {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'tribute' | 'condolence'>('tribute')
  const { data: tributes = [], isLoading } = useTributes(announcement.id)
  const { mutateAsync, isPending } = useSubmitTribute(announcement.id)

  const approvedTributes = tributes.filter((t) => t.type === 'tribute')
  const approvedCondolences = tributes.filter((t) => t.type === 'condolence')

  const allowsVisitors = announcement.tribute_access === 'visitors'

  // Authenticated form
  const authForm = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { type: 'tribute' },
  })

  // Guest form
  const guestForm = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: { type: 'tribute' },
  })

  const authMessage = authForm.watch('message') ?? ''
  const guestMessage = guestForm.watch('message') ?? ''

  async function onAuthSubmit(data: AuthFormData) {
    try {
      const auto_approve =
        announcement.moderation_mode === 'auto' && announcement.tribute_access === 'registered'
      await mutateAsync({
        announcement_id: announcement.id,
        author_id: user!.id,
        type: data.type,
        message: data.message,
        auto_approve,
      })
      authForm.reset()
      const pending = !auto_approve
      toast({
        title: pending ? 'Submitted for review' : `${data.type === 'tribute' ? 'Tribute' : 'Condolence'} posted`,
        description: pending ? 'Your message will appear after approval.' : 'Your message is now visible.',
      })
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: (err as Error).message })
    }
  }

  async function onGuestSubmit(data: GuestFormData) {
    try {
      await mutateAsync({
        announcement_id: announcement.id,
        author_id: null,
        guest_name: data.guest_name,
        type: data.type,
        message: data.message,
        auto_approve: false,
      })
      guestForm.reset()
      toast({
        title: 'Submitted for review',
        description: 'Your message will appear after the family approves it.',
      })
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: (err as Error).message })
    }
  }

  const TypeTabs = ({ onTabChange }: { onTabChange: (v: 'tribute' | 'condolence') => void }) => (
    <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'tribute' | 'condolence'); onTabChange(v as 'tribute' | 'condolence') }}>
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
  )

  return (
    <div>
      {/* Submit form */}
      {user ? (
        /* Authenticated user form */
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
                <TypeTabs onTabChange={(v) => authForm.setValue('type', v)} />
                <form onSubmit={authForm.handleSubmit(onAuthSubmit)} className="space-y-3">
                  <input type="hidden" {...authForm.register('type')} />
                  <Textarea
                    placeholder={activeTab === 'tribute' ? 'Share a cherished memory…' : 'May your heart find peace in this difficult time…'}
                    rows={4}
                    {...authForm.register('message')}
                  />
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${authMessage.length > 1000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {authMessage.length}/1000
                    </span>
                  </div>
                  {authForm.formState.errors.message && (
                    <p className="text-xs text-destructive">{authForm.formState.errors.message.message}</p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <AiGrammarCheckModal
                      text={authMessage}
                      onUseImproved={(improved) => authForm.setValue('message', improved)}
                    />
                    <div className="flex-1" />
                    {(announcement.moderation_mode === 'manual' || allowsVisitors) && (
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
      ) : allowsVisitors ? (
        /* Guest posting form */
        <Card className="mb-8">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCircle2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Post as a guest</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>All messages require approval</span>
              </div>
            </div>

            <TypeTabs onTabChange={(v) => guestForm.setValue('type', v)} />

            <form onSubmit={guestForm.handleSubmit(onGuestSubmit)} className="space-y-3">
              <input type="hidden" {...guestForm.register('type')} />

              <div className="space-y-1.5">
                <Label htmlFor="guest_name" className="text-xs">Your name *</Label>
                <Input
                  id="guest_name"
                  placeholder="e.g. Ama Mensah"
                  className="h-9"
                  {...guestForm.register('guest_name')}
                />
                {guestForm.formState.errors.guest_name && (
                  <p className="text-xs text-destructive">{guestForm.formState.errors.guest_name.message}</p>
                )}
              </div>

              <Textarea
                placeholder={activeTab === 'tribute' ? 'Share a cherished memory…' : 'May your heart find peace in this difficult time…'}
                rows={4}
                {...guestForm.register('message')}
              />
              <div className="flex items-center justify-between">
                <span className={`text-xs ${guestMessage.length > 1000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {guestMessage.length}/1000
                </span>
              </div>
              {guestForm.formState.errors.message && (
                <p className="text-xs text-destructive">{guestForm.formState.errors.message.message}</p>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <AiGrammarCheckModal
                  text={guestMessage}
                  onUseImproved={(improved) => guestForm.setValue('message', improved)}
                />
                <div className="flex-1" />
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  Submit for Review
                </Button>
              </div>
            </form>

            <p className="text-xs text-muted-foreground border-t pt-3">
              Have an account?{' '}
              <Link to="/auth/login" className="text-primary hover:underline font-medium">Sign in</Link>
              {' '}for a better experience.
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Locked — registered only */
        <Card className="mb-8 bg-muted/30">
          <CardContent className="py-6 text-center">
            <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">Sign in to leave a tribute or condolence</p>
            <p className="text-xs text-muted-foreground mb-4">This announcement is open to registered members only.</p>
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

      {/* Tributes & Condolences list */}
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
                        {getInitials(displayName(tribute))}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-medium">{displayName(tribute)}</span>
                        {!tribute.author_id && (
                          <Badge variant="secondary" className="text-[10px] h-4">Guest</Badge>
                        )}
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
