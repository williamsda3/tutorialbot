const MAX_SIZE_BYTES = 500 * 1024 // 500KB

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function compressImage(dataUrl, mediaType, maxBytes = MAX_SIZE_BYTES) {
  // If already small enough, return as-is
  const base64 = dataUrl.split(',')[1]
  if (base64.length * 0.75 <= maxBytes) {
    return { base64, mediaType, previewUrl: dataUrl }
  }

  // Use canvas to resize and compress
  const img = await loadImage(dataUrl)
  let quality = 0.8
  let scale = 1

  // Try progressively smaller sizes
  for (let attempt = 0; attempt < 5; attempt++) {
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    const compressed = canvas.toDataURL('image/jpeg', quality)
    const compressedBase64 = compressed.split(',')[1]

    if (compressedBase64.length * 0.75 <= maxBytes) {
      return {
        base64: compressedBase64,
        mediaType: 'image/jpeg',
        previewUrl: compressed,
      }
    }

    // Reduce further
    scale *= 0.7
    quality = Math.max(0.4, quality - 0.1)
  }

  // Final fallback: smallest attempt
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  const final = canvas.toDataURL('image/jpeg', 0.4)
  const finalBase64 = final.split(',')[1]
  return { base64: finalBase64, mediaType: 'image/jpeg', previewUrl: final }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function processImageFile(file) {
  if (!file.type.startsWith('image/')) return null
  const dataUrl = await readFileAsDataUrl(file)
  return compressImage(dataUrl, file.type)
}
