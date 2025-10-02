// Helper to resolve best available image for a hall
// Order: local by shortName in public/halls -> hall.localImg override -> remote official -> unsplash fallback
export function getHallImage(hall) {
  if (!hall) return ''
  const byShortName = hall.shortName ? `/halls/${hall.shortName}.jpg` : ''
  // Prefer explicit localImg override first (handles renamed files like BMH.jpg for JSH, FMH.jpg for NFH),
  // then try shortName-based local path, then remote, then fallback.
  return hall.localImg || byShortName || hall.img || hall.fallbackImg || ''
}
