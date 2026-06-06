import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createAnnouncement,
  getAnnouncement,
  listAnnouncements,
  listMyAnnouncements,
  searchAnnouncements,
  type CreateAnnouncementInput,
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
