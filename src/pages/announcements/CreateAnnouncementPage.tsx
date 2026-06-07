import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, Loader2, Flower2 } from 'lucide-react'
import { useCreateAnnouncement } from '@/hooks/use-announcements'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
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
  wreath_board_enabled: z.boolean(),
})
type FormData = z.infer<typeof schema>

export default function CreateAnnouncementPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { mutateAsync, isPending } = useCreateAnnouncement()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { moderation_mode: 'auto', tribute_access: 'registered', wreath_board_enabled: false },
  })

  const messageValue = watch('short_message') ?? ''

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
    try {
      const announcement = await mutateAsync({
        ...data,
        image_file: imageFile ?? undefined,
      })
      toast({ variant: 'success' as never, title: 'Announcement created', description: 'Your announcement is now live.' })
      navigate(`/announcement/${announcement.slug}`)
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: (err as Error).message })
    }
  }

  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Announcement</h1>
        <p className="text-muted-foreground mt-1">Share a memorial announcement to honour a life lived.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Photo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Photo of the Deceased</CardTitle>
            <CardDescription>Upload a photo to accompany the announcement. Max 5 MB.</CardDescription>
          </CardHeader>
          <CardContent>
            {imagePreview ? (
              <div className="relative w-40 h-40">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg border" />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 rounded-full bg-destructive text-white p-0.5"
                  onClick={() => { setImageFile(null); setImagePreview(null) }}
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

        {/* Deceased Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="surname">Surname *</Label>
                <Input id="surname" placeholder="Mensah" {...register('surname')} />
                {errors.surname && <p className="text-xs text-destructive">{errors.surname.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input id="first_name" placeholder="Kwame" {...register('first_name')} />
                {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="other_names">Other Names</Label>
              <Input id="other_names" placeholder="Middle name(s)" {...register('other_names')} />
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
              <Input id="place_of_death" placeholder="Accra, Ghana" {...register('place_of_death')} />
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
              <Textarea
                placeholder="In loving memory of…"
                rows={6}
                {...register('short_message')}
              />
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
          <CardContent className="space-y-3">
            <Select defaultValue="registered" onValueChange={(v) => setValue('tribute_access', v as 'registered' | 'visitors')}>
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
            <Select defaultValue="auto" onValueChange={(v) => setValue('moderation_mode', v as 'auto' | 'manual')}>
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

        {/* Wreath Board */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Flower2 className="h-4 w-4 text-green-600" /> Wreath / Flower Board
                </CardTitle>
                <CardDescription className="mt-1">
                  Allow visitors to lay virtual wreaths and flowers at a dedicated memorial board for the deceased.
                </CardDescription>
              </div>
              <Switch
                checked={watch('wreath_board_enabled')}
                onCheckedChange={(v) => setValue('wreath_board_enabled', v)}
              />
            </div>
          </CardHeader>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publish Announcement
          </Button>
        </div>
      </form>
    </div>
  )
}
