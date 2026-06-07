import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createAnnouncement,
  updateAnnouncement,
  getAnnouncement,
  listAnnouncements,
  listMyAnnouncements,
  searchAnnouncements,
  getGalleryPhotos,
  addGalleryPhoto,
  deleteGalleryPhoto,
  type CreateAnnouncementInput,
  type UpdateAnnouncementInput,
} from '@/services/announcementService'
import { useAuth } from '@/contexts/AuthContext'

export function useAnnouncement(slug: string) {
  return useQuery({
    queryKey: ['announcement', slug],
    queryFn: () => getAnnouncement(slug),
    enabled: !!slug,
  })
}

export function useAnnouncements(page = 1) {
  return useQuery({
    queryKey: ['announcements', page],
    queryFn: () => listAnnouncements(page),
  })
}

export function useMyAnnouncements() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['my-announcements', user?.id],
    queryFn: () => listMyAnnouncements(user!.id),
    enabled: !!user,
  })
}

export function useSearchAnnouncements(query: string) {
  return useQuery({
    queryKey: ['search-announcements', query],
    queryFn: () => searchAnnouncements(query),
    enabled: query.length >= 2,
  })
}

export function useCreateAnnouncement() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateAnnouncementInput) => createAnnouncement(input, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      queryClient.invalidateQueries({ queryKey: ['my-announcements'] })
    },
  })
}

export function useUpdateAnnouncement(announcementId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateAnnouncementInput) => updateAnnouncement(announcementId, input, user!.id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['announcement', data.slug] })
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      queryClient.invalidateQueries({ queryKey: ['my-announcements'] })
    },
  })
}

export function useGalleryPhotos(announcementId: string) {
  return useQuery({
    queryKey: ['gallery', announcementId],
    queryFn: () => getGalleryPhotos(announcementId),
    enabled: !!announcementId,
  })
}

export function useAddGalleryPhoto(announcementId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, caption }: { file: File; caption?: string }) =>
      addGalleryPhoto(announcementId, file, user!.id, caption),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery', announcementId] })
    },
  })
}

export function useDeleteGalleryPhoto(announcementId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ photoId, storagePath }: { photoId: string; storagePath: string }) =>
      deleteGalleryPhoto(photoId, storagePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery', announcementId] })
    },
  })
}
