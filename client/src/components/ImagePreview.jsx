import './ImagePreview.css'

export default function ImagePreview({ images, onRemove }) {
  if (!images || images.length === 0) return null

  return (
    <div className="image-preview-bar">
      {images.map((img, i) => (
        <div key={i} className="image-preview-item">
          <img src={img.previewUrl} alt="Preview" />
          <button
            className="image-preview-remove"
            onClick={() => onRemove(i)}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  )
}
