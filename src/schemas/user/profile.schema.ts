import { z } from 'zod'

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Ім'я має містити мінімум 2 символи")
    .max(50, "Ім'я має містити максимум 50 символів")
    .trim(),
})

export type ProfileForm = z.infer<typeof profileSchema>
