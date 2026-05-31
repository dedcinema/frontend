'use client'

import { useCurrent } from '@/hooks/useCurrent'

export function CurrentUserSync() {
  useCurrent()
  return null
}
