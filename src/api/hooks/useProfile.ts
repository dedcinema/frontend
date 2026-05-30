import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../requests/users'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: usersApi.me,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => usersApi.updateName(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  })
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => usersApi.updateAvatar(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  })
}
