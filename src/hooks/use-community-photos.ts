import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import {
  getCommunityPhotos,
  getAllCommunityPhotos,
  submitCommunityPhoto,
  updateCommunityPhotoStatus,
  deleteCommunityPhoto,
} from '@/services/communityPhotoService'

export function useCommunityPhotos(announcementId: string) {
  return useQuery({
    queryKey: ['community-photos', announcementId],
    queryFn: () => getCommunityPhotos(announcementId),
    enabled: !!announcementId,
  })
}

export function useAllCommunityPhotos(announcementId: string) {
  return useQuery({
    queryKey: ['community-photos-all', announcementId],
    queryFn: () => getAllCommunityPhotos(announcementId),
    enabled: !!announcementId,
  })
}

export function useSubmitMemory(announcementId: string) {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { file: File; guestName?: string; caption?: string }) =>
      submitCommunityPhoto({
        announcementId,
        uploaderId: user?.id ?? null,
        guestName:  input.guestName,
        file:       input.file,
        caption:    input.caption,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community-photos', announcementId] })
      qc.invalidateQueries({ queryKey: ['community-photos-all', announcementId] })
    },
  })
}

export function useUpdateCommunityPhotoStatus(announcementId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
      updateCommunityPhotoStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community-photos', announcementId] })
      qc.invalidateQueries({ queryKey: ['community-photos-all', announcementId] })
    },
  })
}

export function useDeleteCommunityPhoto(announcementId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, storagePath }: { id: string; storagePath: string }) =>
      deleteCommunityPhoto(id, storagePath),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community-photos', announcementId] })
      qc.invalidateQueries({ queryKey: ['community-photos-all', announcementId] })
    },
  })
}
