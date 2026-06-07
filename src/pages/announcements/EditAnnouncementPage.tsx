import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, Loader2, ArrowLeft } from 'lucide-react'
import { useAnnouncement, useUpdateAnnouncement } from '@/hooks/use-announcements'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

const MAX_MESSAGE = 2000

const schema = z.object({
  surname: z.string().min(1, 'Surname is required').max(60),
  first_name: z.string().min(1, 'First name is required').max(60),
  other_names: z.string().max(100).optional(),
  date_of_birth: z.string().optional(),
  date_of_death: z.string().min(1, 'Date of death is required'),
  place_of_death: z.string().min(2, 'Place of death is required').max(200),
  short_message: z.string().min(10, 'Message is too short').max(MAX_MESSAGE, `Max ${MAX_MESSAGE} characters`),
  moderation_mode: z.enum(['auto', 'manual']),
  tribute_access: z.enum(['registered', 'visitors']),
})
type FormData = z.infer<typeof schema>

export default function EditAnnouncementPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const { data: announcement, isLoading } = useAnnouncement(slug!)
  const { mutateAsync, isPending } = useUpdateAnnouncement(announcement?.id ?? '')

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const messageValue = watch('short_message') ?? ''

  useEffect(() => {
    if (announcement) {
      reset({
        surname: announcement.surname,
        first_name: announcement.first_name,
        other_names: announcement.other_names ?? '',
        date_of_birth: announcement.date_of_birth ?? '',
        date_of_death: announcement.date_of_death,
        place_of_death: announcement.place_of_death,
        short_message: announcement.short_message,
        moderation_mode: announcement.moderation_mode,
        tribute_access: announcement.tribute_access,
      })
    }
  }, [announcement, reset])

  // Redirect non-owners away
  useEffect(() => {
    if (announcement && user && announcement.creator_id !== user.id) {
      navigate(`/announcement/${slug}`, { replace: true })
    }
  }, [announcement, user, slug, navigate])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'File too large', description: 'Max image size is 5 MB.' })
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function onSubmit(data: FormData) {
    if (!announcement) return
    try {
      const updated = await mutateAsync({ ...data, image_file: imageFile ?? undefined })
      toast({ title: 'Announcement updated' })
      navigate(`/announcement/${updated.slug}`)
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: (err as Error).message })
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-10 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const currentImage = imagePreview ?? announcement?.image_url ?? null

  return (
    <div className="container max-w-2xl py-10">
      <Link
        to={`/announcement/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to announcement
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Announcement</h1>
        <p className="text-muted-foreground mt-1">Update the details of this memorial announcement.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Photo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Photo of the Deceased</CardTitle>
            <CardDescription>
              {currentImage ? 'Click the image to replace it.' : 'Upload a photo. Max 5 MB.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentImage ? (
              <div className="relative w-40 h-40">
                <img
                  src={currentImage}
                  alt="Current"
                  className="w-full h-full object-contain rounded-lg border cursor-pointer"
                  onClick={() => fileRef.current?.click()}
                />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 rounded-full bg-destructive text-white p-0.5"
                  onClick={() => { setImageFile(null); setImagePreview(null) }}
                  title="Remove new selection (keeps existing if not saved)"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="w-40 h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-6 w-6" />
                <span className="text-xs text-center">Click to upload</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </CardContent>
        </Card>

        {/* Personal Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="surname">Surname *</Label>
                <Input id="surname" {...register('surname')} />
                {errors.surname && <p className="text-xs text-destructive">{errors.surname.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input id="first_name" {...register('first_name')} />
                {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="other_names">Other Names</Label>
              <Input id="other_names" {...register('other_names')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_death">Date of Death *</Label>
                <Input id="date_of_death" type="date" {...register('date_of_death')} />
                {errors.date_of_death && <p className="text-xs text-destructive">{errors.date_of_death.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="place_of_death">Place of Death *</Label>
              <Input id="place_of_death" {...register('place_of_death')} />
              {errors.place_of_death && <p className="text-xs text-destructive">{errors.place_of_death.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Message */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Memorial Message</CardTitle>
            <CardDescription>A short tribute or announcement message.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Textarea rows={6} {...register('short_message')} />
              <div className="flex justify-between items-center">
                {errors.short_message
                  ? <p className="text-xs text-destructive">{errors.short_message.message}</p>
                  : <span />
                }
                <span className={`text-xs tabular-nums ${messageValue.length > MAX_MESSAGE ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {messageValue.length}/{MAX_MESSAGE}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Who can post */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Who Can Post Tributes</CardTitle>
            <CardDescription>Choose who is allowed to leave tributes and condolences.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={watch('tribute_access')}
              onValueChange={(v) => setValue('tribute_access', v as 'registered' | 'visitors')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="registered">
                  <div>
                    <div className="font-medium">Registered users only</div>
                    <div className="text-xs text-muted-foreground">Only signed-in members can post</div>
                  </div>
                </SelectItem>
                <SelectItem value="visitors">
                  <div>
                    <div className="font-medium">Everyone (including visitors)</div>
                    <div className="text-xs text-muted-foreground">Anyone can post — all messages require your approval</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Moderation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tribute Moderation</CardTitle>
            <CardDescription>Control how tributes from registered users are approved.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={watch('moderation_mode')}
              onValueChange={(v) => setValue('moderation_mode', v as 'auto' | 'manual')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  <div>
                    <div className="font-medium">Auto Approve</div>
                    <div className="text-xs text-muted-foreground">Tributes are visible immediately</div>
                  </div>
                </SelectItem>
                <SelectItem value="manual">
                  <div>
                    <div className="font-medium">Manual Approval</div>
                    <div className="text-xs text-muted-foreground">You review each tribute before it goes public</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(`/announcement/${slug}`)}>Cancel</Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
