import { useState, useCallback } from 'react'
import { processImageFile } from '../utils/imageUtils.js'

const MAX_IMAGES = 4

export default function useImages() {
  const [pendingImages, setPendingImages] = useState([])

  const addFiles = useCallback(async (files) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))

    for (const file of imageFiles) {
      const result = await processImageFile(file)
      if (!result) continue

      setPendingImages(prev => {
        if (prev.length >= MAX_IMAGES) return prev
        return [...prev, result]
      })
    }
  }, [])

  const removeImage = useCallback((index) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index))
  }, [])

  const clearImages = useCallback(() => {
    setPendingImages([])
  }, [])

  return { pendingImages, addFiles, removeImage, clearImages }
}
