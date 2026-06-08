import { useState, useRef } from 'react'
import { ImagePlus, X, ChevronLeft, ChevronRight, Loader2, UserCircle2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCommunityPhotos, useSubmitMemory } from '@/hooks/use-community-photos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import type { CommunityPhoto } from '@/types/database'

function uploaderName(p: CommunityPhoto): string {
  return p.profiles?.display_name ?? p.profiles?.username ?? p.guest_name ?? 'Anonymous'
}

export default function CommunityMemories({ announcementId }: { announcementId: string }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const { data: photos = [] } = useCommunityPhotos(announcementId)
  const { mutateAsync: submit, isPending } = useSubmitMemory(announcementId)

  const [showForm, setShowForm]       = useState(false)
  const [file, setFile]               = useState<File | null>(null)
  const [preview, setPreview]         = useState<string | null>(null)
  const [guestName, setGuestName]     = useState('')
  const [caption, setCaption]         = useState('')
  const [lightbox, setLightbox]       = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 10 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'File too large', description: 'Max 10 MB per photo.' })
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function resetForm() {
    setFile(null)
    setPreview(null)
    setGuestName('')
    setCaption('')
    setShowForm(false)
  }

  async function handleSubmit() {
    if (!file) return
    if (!user && !guestName.trim()) return
    try {
      await submit({
        file,
        guestName: user ? undefined : guestName.trim(),
        caption:   caption.trim() || undefined,
      })
      toast({
        title: 'Memory submitted',
        description: 'It will appear here once the announcement creator approves it.',
      })
      resetForm()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Upload failed', description: (err as Error).message })
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Community Memories</h3>
          <p className="text-sm text-muted-foreground">
            Photos shared by family, friends, and loved ones
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)} className="gap-1.5">
          <ImagePlus className="h-4 w-4" /> Share a Memory
        </Button>
      </div>

      {/* Submit dialog */}
      <Dialog open={showForm} onOpenChange={(v) => { if (!v) resetForm() }}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Share a Memory</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Upload a photo. It will be reviewed by the announcement creator before appearing in the gallery.
              </p>
            </div>

            {/* Photo picker */}
            {preview ? (
              <div className="relative w-48 h-48 mx-auto">
                <img src={preview} alt="preview" className="w-full h-full object-cover rounded-lg border" />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 rounded-full bg-destructive text-white p-0.5"
                  onClick={() => { setFile(null); setPreview(null) }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full h-36 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <ImagePlus className="h-8 w-8" />
                <span className="text-sm">Click to select a photo (max 10 MB)</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

            {/* Guest name */}
            {!user && (
              <div className="space-y-1.5">
                <Label htmlFor="mem-name">Your name *</Label>
                <Input
                  id="mem-name"
                  placeholder="e.g. Kofi Mensah"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>
            )}

            {/* Caption */}
            <div className="space-y-1.5">
              <Label htmlFor="mem-caption">Caption <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                id="mem-caption"
                placeholder="A brief description or memory…"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button
                disabled={!file || isPending || (!user && !guestName.trim())}
                onClick={handleSubmit}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Memory
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-xl text-muted-foreground text-sm">
          No community memories yet. Be the first to share one.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setLightbox(i)}
              className="relative aspect-square rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <img
                src={photo.url}
                alt={uploaderName(photo)}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Name tag */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-6 pb-2 px-2">
                <div className="flex items-center gap-1">
                  <UserCircle2 className="h-3 w-3 text-white/70 flex-shrink-0" />
                  <span className="text-xs font-semibold text-white truncate leading-tight">
                    {uploaderName(photo)}
                  </span>
                </div>
                {photo.caption && (
                  <p className="text-[10px] text-white/60 truncate mt-0.5 leading-tight">{photo.caption}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && photos[lightbox] && (
        <Dialog open onOpenChange={() => setLightbox(null)}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black/95 border-0">
            <div className="relative">
              <img
                src={photos[lightbox].url}
                alt={uploaderName(photos[lightbox])}
                className="w-full max-h-[78vh] object-contain"
              />

              {/* Name tag */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-5 py-4">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <UserCircle2 className="h-4 w-4 text-white/70" />
                  <span className="text-sm font-semibold text-white">{uploaderName(photos[lightbox])}</span>
                </div>
                {photos[lightbox].caption && (
                  <p className="text-white/65 text-xs">{photos[lightbox].caption}</p>
                )}
              </div>

              {/* Counter */}
              <div className="absolute top-3 left-3 text-xs text-white/60 bg-black/40 rounded px-2 py-0.5">
                {lightbox + 1} / {photos.length}
              </div>

              {/* Close */}
              <button
                className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
                onClick={() => setLightbox(null)}
              >
                <X className="h-4 w-4" />
              </button>

              {/* Prev / Next */}
              {photos.length > 1 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                    onClick={() => setLightbox((n) => (n! > 0 ? n! - 1 : photos.length - 1))}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                    onClick={() => setLightbox((n) => (n! < photos.length - 1 ? n! + 1 : 0))}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
