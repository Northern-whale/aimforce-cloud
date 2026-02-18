'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ContentLibraryPage() {
  const router = useRouter()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      setSelectedFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)

    // Phase 2 will integrate Google Drive API here
    setTimeout(() => {
      setUploading(false)
      alert(`✅ ${selectedFiles.length} file(s) uploaded successfully!`)
      setSelectedFiles([])
    }, 2000)
  }

  // Mock data for demo
  const mockContent = [
    {
      id: '1',
      fileName: 'product-launch.jpg',
      fileType: 'IMAGE',
      thumbnailUrl: '/api/placeholder/400/300',
      fileSize: 245678,
      uploadedAt: new Date('2026-02-15'),
      tags: ['product', 'marketing'],
    },
    {
      id: '2',
      fileName: 'brand-video.mp4',
      fileType: 'VIDEO',
      thumbnailUrl: '/api/placeholder/400/300',
      fileSize: 5234567,
      duration: 45,
      uploadedAt: new Date('2026-02-14'),
      tags: ['video', 'brand'],
    },
    {
      id: '3',
      fileName: 'social-post-1.png',
      fileType: 'IMAGE',
      thumbnailUrl: '/api/placeholder/400/300',
      fileSize: 123456,
      uploadedAt: new Date('2026-02-13'),
      tags: ['social', 'announcement'],
    },
  ]

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Content Library</h1>
              <p className="text-sm text-gray-600 mt-1">
                Upload and manage your media files for social media posting
              </p>
            </div>
            <a
              href="/portal"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
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

          {/* Selected Files */}
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
                        {file.type.startsWith('image/') ? '🖼️' :
                         file.type.startsWith('video/') ? '🎬' : '📄'}
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
                  {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
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

        {/* Content Grid */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Your Content</h2>
            <div className="flex gap-3">
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                <option>All Types</option>
                <option>Images</option>
                <option>Videos</option>
                <option>Documents</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Most Recent</option>
                <option>Oldest First</option>
                <option>Name A-Z</option>
                <option>Largest First</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockContent.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                  <span className="text-6xl">
                    {item.fileType === 'IMAGE' ? '🖼️' : '🎬'}
                  </span>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center gap-3">
                    <button className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium transition">
                      Preview
                    </button>
                    <button className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium transition">
                      Use in Post
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1 truncate">{item.fileName}</h3>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatFileSize(item.fileSize)}</span>
                    {item.duration && <span>{item.duration}s</span>}
                    <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                  </div>

                  {item.tags && (
                    <div className="flex gap-1 mt-3">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Showing {mockContent.length} of {mockContent.length} files
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-cyan-50 border border-cyan-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Content Management</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600">✓</span>
                  <span>
                    <strong>Auto-tagging:</strong> AI automatically tags your content by analyzing images and videos
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600">✓</span>
                  <span>
                    <strong>Smart captions:</strong> Generate engaging captions from your media
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600">✓</span>
                  <span>
                    <strong>Content recommendations:</strong> AI suggests the best time and platform for each piece
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600">✓</span>
                  <span>
                    <strong>Google Drive sync:</strong> All files are automatically backed up to your Google Drive
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
