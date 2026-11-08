const MAX_EDGE = 1600
const QUALITY = 0.82

interface Decoded {
  source: CanvasImageSource
  width: number
  height: number
  dispose: () => void
}

async function decode(file: Blob): Promise<Decoded> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
      return { source: bitmap, width: bitmap.width, height: bitmap.height, dispose: () => bitmap.close() }
    } catch {
      // fall through to the <img> decoder
    }
  }
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.src = url
  try {
    await img.decode()
  } catch (err) {
    URL.revokeObjectURL(url)
    throw err
  }
  return {
    source: img,
    width: img.naturalWidth,
    height: img.naturalHeight,
    dispose: () => URL.revokeObjectURL(url),
  }
}

/**
 * Downscales and re-encodes a photo as JPEG. Re-encoding through a canvas also
 * strips EXIF metadata (including GPS location) before anything is stored.
 */
export async function compressImage(file: Blob): Promise<Blob> {
  const decoded = await decode(file)
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(decoded.width, decoded.height))
    const width = Math.max(1, Math.round(decoded.width * scale))
    const height = Math.max(1, Math.round(decoded.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not process this photo.')
    ctx.drawImage(decoded.source, 0, 0, width, height)
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Could not process this photo.'))),
        'image/jpeg',
        QUALITY,
      )
    })
  } finally {
    decoded.dispose()
  }
}
