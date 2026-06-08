'use client'

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import type { SeatMapProps } from '../types'
import { SeatMapGrid } from './SeatMapGrid'

export function SeatMapZoom(props: SeatMapProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-background">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={3}
        wheel={{ step: 0.1 }}
        centerOnInit
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Controls */}
            <div className="absolute right-3 top-3 z-10 flex flex-col gap-1">
              <button
                onClick={() => zoomIn()}
                aria-label="Збільшити"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background/90 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-muted"
              >
                +
              </button>
              <button
                onClick={() => zoomOut()}
                aria-label="Зменшити"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background/90 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-muted"
              >
                −
              </button>
              <button
                onClick={() => resetTransform()}
                aria-label="Скинути масштаб"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background/90 text-[9px] font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:bg-muted"
              >
                ↺
              </button>
            </div>

            {/* Hint */}
            <p className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-background/80 px-3 py-1 text-[10px] text-muted-foreground backdrop-blur-sm">
              Scroll для зуму · drag для переміщення
            </p>

            <TransformComponent
              wrapperStyle={{ width: '100%' }}
              contentStyle={{ width: '100%' }}
            >
              <div className="w-full p-6 pb-12">
                <SeatMapGrid {...props} />
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  )
}
