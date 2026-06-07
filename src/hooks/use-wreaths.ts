import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWreathPlacements, placeWreath, removeWreath } from '@/services/wreathService'
import { useAuth } from '@/contexts/AuthContext'

export function useWreathPlacements(announcementId: string) {
  return useQuery({
    queryKey: ['wreaths', announcementId],
    queryFn: () => getWreathPlacements(announcementId),
    enabled: !!announcementId,
    refetchInterval: 30_000,
  })
}

export function usePlaceWreath(announcementId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ wreathType, guestName }: { wreathType: string; guestName?: string }) =>
      placeWreath({
        announcement_id: announcementId,
        user_id: user?.id ?? null,
        guest_name: user ? undefined : guestName,
        wreath_type: wreathType,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wreaths', announcementId] })
    },
  })
}

export function useRemoveWreath(announcementId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: removeWreath,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wreaths', announcementId] })
    },
  })
}
