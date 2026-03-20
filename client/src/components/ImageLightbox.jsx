export default function ImageLightbox({ src, onClose }) {
  return (
    <div
      className="image-lightbox"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        cursor: 'pointer',
        animation: 'fadeIn 0.2s',
        backdropFilter: 'blur(4px)',
      }}
    >
      <img
        src={src}
        alt="Full size"
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          borderRadius: 8,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      />
    </div>
  )
}
