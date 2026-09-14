import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ImageGallery({ images, alt = '' }: { images: string[]; alt?: string }) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  if (!images.length) return null

  const open = (i: number) => setViewerIndex(i)
  const close = () => setViewerIndex(null)
  const prev = () => setViewerIndex(i => (i === null ? null : (i - 1 + images.length) % images.length))
  const next = () => setViewerIndex(i => (i === null ? null : (i + 1) % images.length))

  const extra = images.length - 1

  return (
    <>
      {/* Preview: 1 big image, with "+N more" overlay if there are more */}
      <div className="mt-3 relative rounded-xl overflow-hidden border border-gray-100 cursor-pointer" onClick={() => open(0)}>
        <img src={images[0]} alt={alt} className="w-full max-h-96 object-cover" />
        {extra > 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-2xl font-black">+{extra} more</span>
          </div>
        )}
      </div>

      {/* Fullscreen viewer */}
      {viewerIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={close}>
          <button onClick={(e) => { e.stopPropagation(); close() }}
            className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10">
            <X className="w-6 h-6" />
          </button>

          {images.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-4 text-white p-2 rounded-full hover:bg-white/10">
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          <img
            src={images[viewerIndex]}
            alt={alt}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-4 text-white p-2 rounded-full hover:bg-white/10">
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          <div className="absolute bottom-4 text-white text-sm">
            {viewerIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}