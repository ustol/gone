import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Notification } from '@/types/database'

export function useNotifications() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data as Notification[]
    },
    enabled: !!user,
  })
}

export function useUnreadNotificationCount() {
  const { user } = useAuth()
  const { data } = useQuery({
    queryKey: ['notifications-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('is_read', false)
      if (error) throw error
      return count ?? 0
    },
    enabled: !!user,
    refetchInterval: 30000,
  })
  return { count: data ?? 0 }
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['notifications-count', user?.id] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user!.id)
        .eq('is_read', false)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['notifications-count', user?.id] })
    },
  })
}
