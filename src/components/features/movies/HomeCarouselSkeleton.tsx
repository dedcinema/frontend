import { Skeleton } from '@/components/ui/skeleton'

const SKELETON_COUNT = 4

export function HomeCarouselSkeleton() {
  return (
    <div className="flex" aria-hidden>
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <div
          key={i}
          className={`min-w-0 shrink-0 basis-full px-0.5 sm:basis-1/2 lg:basis-1/4 ${
            i > 0 ? 'hidden sm:block' : ''
          } ${i > 1 ? 'sm:hidden lg:block' : ''}`}
        >
          <Skeleton className="aspect-[2/3] w-full rounded-xl" />
        </div>
      ))}
    </div>
  )
}
