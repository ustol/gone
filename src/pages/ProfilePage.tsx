import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { getInitials } from '@/lib/utils'

const schema = z.object({
  display_name: z.string().max(60).optional(),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/, 'Lowercase, numbers, underscores only'),
  bio: z.string().max(300).optional(),
})
type FormData = z.infer<typeof schema>

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: profile?.display_name ?? '',
      username: profile?.username ?? '',
      bio: profile?.bio ?? '',
    },
  })

  async function onSubmit(data: FormData) {
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: data.display_name || null,
        username: data.username,
        bio: data.bio || null,
      })
      .eq('id', profile!.id)

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
      return
    }
    await refreshProfile()
    toast({ title: 'Profile updated' })
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'File too large', description: 'Max 2 MB for avatar.' })
      return
    }
    setAvatarUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${profile!.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl + `?t=${Date.now()}` })
        .eq('id', profile!.id)
      if (updateError) throw updateError
      await refreshProfile()
      toast({ title: 'Avatar updated' })
    } catch (err) {
      toast({ variant: 'destructive', title: 'Upload failed', description: (err as Error).message })
    } finally {
      setAvatarUploading(false)
    }
  }

  if (!profile) return null

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Profile Photo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="text-2xl">
                {getInitials(profile.display_name ?? profile.username)}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-colors"
              onClick={() => fileRef.current?.click()}
              disabled={avatarUploading}
            >
              {avatarUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="font-medium">{profile.display_name ?? profile.username}</p>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Personal Information</CardTitle>
          <CardDescription>Update your public profile details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input id="display_name" placeholder="Your full name" {...register('display_name')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <Input id="username" className="pl-7" {...register('username')} />
              </div>
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" placeholder="Tell us a little about yourself (optional)" rows={3} {...register('bio')} />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
