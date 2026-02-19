'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ContentUploader() {
  const router = useRouter()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
      setError('')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      setSelectedFiles(Array.from(e.dataTransfer.files))
      setError('')
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => formData.append('files', file))

      const response = await fetch('/api/content/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Upload failed')
        return
      }

      setSelectedFiles([])
      router.refresh()
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Files</h2>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors"
      >
        <div className="text-5xl mb-4">📁</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Drop files here or click to browse
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Supports: Images (JPG, PNG, GIF), Videos (MP4, MOV), Documents (PDF)
        </p>
        <input
          type="file"
          multiple
          accept="image/*,video/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition cursor-pointer font-medium"
        >
          Select Files
        </label>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium text-gray-900 mb-3">
            Selected Files ({selectedFiles.length})
          </h3>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {file.type.startsWith('image/')
                      ? '🖼️'
                      : file.type.startsWith('video/')
                      ? '🎬'
                      : '📄'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition font-medium disabled:opacity-50"
            >
              {uploading
                ? 'Uploading...'
                : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
            </button>
            <button
              onClick={() => setSelectedFiles([])}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
