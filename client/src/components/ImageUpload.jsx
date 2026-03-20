import { useRef } from 'react'

export default function ImageUpload({ onFiles }) {
  const inputRef = useRef(null)

  const handleChange = (e) => {
    if (e.target.files.length > 0) {
      onFiles(e.target.files)
      e.target.value = '' // allow re-selecting same file
    }
  }

  return (
    <div
      className="upload-btn"
      title="Upload screenshot"
      onClick={() => inputRef.current?.click()}
      style={{
        width: 46,
        height: 46,
        borderRadius: 12,
        border: '1px solid var(--border)',
        background: 'transparent',
        color: 'var(--text-muted)',
        fontSize: 20,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.2s',
      }}
    >
      &#x1F4CE;
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}
