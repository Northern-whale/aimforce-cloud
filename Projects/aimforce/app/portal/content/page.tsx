import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ContentUploader from './content-uploader'

export default async function ContentLibraryPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'CLIENT' || !session.user.clientId) {
    redirect('/login')
  }

  const clientId = session.user.clientId

  const contentItems = await prisma.contentLibrary.findMany({
    where: { clientId },
    orderBy: { uploadedAt: 'desc' },
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
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
              &larr; Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <ContentUploader />

        {/* Content Grid */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Your Content</h2>
          </div>

          {contentItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
              <p className="text-sm text-gray-600">
                Upload your first files using the section above to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contentItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <span className="text-6xl">
                      {item.fileType === 'IMAGE'
                        ? '🖼️'
                        : item.fileType === 'VIDEO'
                        ? '🎬'
                        : item.fileType === 'AUDIO'
                        ? '🎵'
                        : '📄'}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1 truncate">{item.fileName}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatFileSize(item.fileSize)}</span>
                      {item.duration && <span>{item.duration}s</span>}
                      <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                    </div>

                    {item.tags && (
                      <div className="flex gap-1 mt-3 flex-wrap">
                        {JSON.parse(item.tags).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.aiCaption && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">{item.aiCaption}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Showing {contentItems.length} file{contentItems.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
