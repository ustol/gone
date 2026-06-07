import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useGalleryPhotos, useAddGalleryPhoto, useDeleteGalleryPhoto } from '@/hooks/use-announcements'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import type { AnnouncementPhoto } from '@/types/database'

interface Props {
  announcementId: string
  isOwner: boolean
}

export default function PhotoGallery({ announcementId, isOwner }: Props) {
  const { data: photos = [], isLoading } = useGalleryPhotos(announcementId)
  const { mutateAsync: addPhoto, isPending: adding } = useAddGalleryPhoto(announcementId)
  const { mutate: removePhoto, isPending: deleting } = useDeleteGalleryPhoto(announcementId)
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const currentPhoto: AnnouncementPhoto | null =
    lightboxIndex !== null ? (photos[lightboxIndex] ?? null) : null

  function prev() {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length)
  }

  function next() {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % photos.length)
  }

  async function handleFiles(files: File[]) {
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: 'destructive', title: `${file.name} is too large`, description: 'Max 5 MB per photo.' })
        continue
      }
      try {
        await addPhoto({ file })
      } catch {
        toast({ variant: 'destructive', title: 'Upload failed', description: file.name })
      }
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleDelete(photo: AnnouncementPhoto) {
    removePhoto(
      { photoId: photo.id, storagePath: photo.storage_path },
      {
        onError: () => toast({ variant: 'destructive', title: 'Could not delete photo' }),
      }
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Photo Gallery</h2>
        {isOwner && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={adding}
          >
            {adding
              ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              : <ImagePlus className="h-4 w-4 mr-1.5" />
            }
            {adding ? 'Uploading…' : 'Add Photos'}
          </Button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(Array.from(e.target.files ?? []))}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-14 border-2 border-dashed rounded-xl text-muted-foreground">
          {isOwner
            ? 'No photos yet — click "Add Photos" to share memories.'
            : 'No photos have been added yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative group aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
              onClick={() => setLightboxIndex(index)}
            >
              <img
                src={photo.url}
                alt={photo.caption ?? `Gallery photo ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                loading="lazy"
              />
              {isOwner && (
                <button
                  className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-destructive rounded-full p-1 z-10"
                  onClick={(e) => { e.stopPropagation(); handleDelete(photo) }}
                  disabled={deleting}
                  title="Delete photo"
                >
                  <X className="h-3.5 w-3.5 text-white" />
                </button>
              )}
              {photo.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs px-2 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  {photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxIndex !== null} onOpenChange={() => setLightboxIndex(null)}>
        <DialogContent className="max-w-4xl p-2 bg-black/90 border-0">
          {currentPhoto && (
            <div className="relative flex items-center justify-center min-h-[60vh]">
              <img
                src={currentPhoto.url}
                alt={currentPhoto.caption ?? ''}
                className="max-w-full max-h-[80vh] object-contain rounded"
              />
              {photos.length > 1 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 rounded-full p-2 text-white transition-colors"
                    onClick={(e) => { e.stopPropagation(); prev() }}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 rounded-full p-2 text-white transition-colors"
                    onClick={(e) => { e.stopPropagation(); next() }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              {currentPhoto.caption && (
                <p className="absolute bottom-2 inset-x-0 text-center text-white/80 text-sm px-4">
                  {currentPhoto.caption}
                </p>
              )}
            </div>
          )}
          <p className="text-center text-xs text-white/40 pb-1">
            {lightboxIndex !== null ? `${lightboxIndex + 1} / ${photos.length}` : ''}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
