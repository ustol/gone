import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTributes,
  getAllTributesForOwner,
  submitTribute,
  updateTributeStatus,
  deleteTribute,
} from '@/services/tributeService'

export function useTributes(announcementId: string) {
  return useQuery({
    queryKey: ['tributes', announcementId, 'approved'],
    queryFn: () => getTributes(announcementId, 'approved'),
    enabled: !!announcementId,
  })
}

export function useAllTributesForOwner(announcementId: string, enabled = true) {
  return useQuery({
    queryKey: ['tributes-all', announcementId],
    queryFn: () => getAllTributesForOwner(announcementId),
    enabled: !!announcementId && enabled,
  })
}

export function useSubmitTribute(announcementId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: submitTribute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tributes', announcementId] })
      queryClient.invalidateQueries({ queryKey: ['tributes-all', announcementId] })
      queryClient.invalidateQueries({ queryKey: ['announcement'] })
    },
  })
}

export function useUpdateTributeStatus(announcementId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, authorId }: { id: string; status: 'approved' | 'rejected'; authorId: string | null }) =>
      updateTributeStatus(id, status, authorId, announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tributes', announcementId] })
      queryClient.invalidateQueries({ queryKey: ['tributes-all', announcementId] })
      queryClient.invalidateQueries({ queryKey: ['announcement'] })
    },
  })
}

export function useDeleteTribute(announcementId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTribute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tributes', announcementId] })
      queryClient.invalidateQueries({ queryKey: ['tributes-all', announcementId] })
    },
  })
}
