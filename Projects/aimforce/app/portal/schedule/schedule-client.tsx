'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Post = {
  id: string
  platform: string
  content: string
  scheduledFor: string
  status: string
  aiScore: number | null
  socialAccount: { accountName: string } | null
}

const platformIcons: Record<string, string> = {
  FACEBOOK: '📘',
  INSTAGRAM: '📸',
  LINKEDIN: '💼',
  TWITTER: '🐦',
  TIKTOK: '🎵',
}

function getScoreColor(score: number) {
  if (score >= 90) return 'bg-green-100 text-green-700'
  if (score >= 75) return 'bg-blue-100 text-blue-700'
  if (score >= 60) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

export default function ScheduleClient({
  posts,
  connectedPlatforms,
  postedThisWeek,
  postedThisMonth,
}: {
  posts: Post[]
  connectedPlatforms: string[]
  postedThisWeek: number
  postedThisMonth: number
}) {
  const router = useRouter()
  const [view, setView] = useState<'calendar' | 'list'>('list')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPost, setNewPost] = useState({ platform: '', content: '', date: '', time: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleCreatePost = async () => {
    if (!newPost.platform || !newPost.content || !newPost.date || !newPost.time) {
      setError('All fields are required')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const scheduledFor = new Date(`${newPost.date}T${newPost.time}:00`).toISOString()

      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: newPost.platform,
          content: newPost.content,
          scheduledFor,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to schedule post')
        return
      }

      setShowCreateModal(false)
      setNewPost({ platform: '', content: '', date: '', time: '' })
      router.refresh()
    } catch {
      setError('Failed to schedule post. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Content Schedule</h1>
              <p className="text-sm text-gray-600 mt-1">
                Plan and schedule your social media posts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition font-medium"
              >
                📅 Schedule New Post
              </button>
              <a
                href="/portal"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                &larr; Back
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats & View Toggle */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
                <p className="text-sm text-gray-600">Scheduled</p>
              </div>
              <div className="border-l border-gray-300 pl-4">
                <p className="text-2xl font-bold text-green-600">{postedThisWeek}</p>
                <p className="text-sm text-gray-600">Posted This Week</p>
              </div>
              <div className="border-l border-gray-300 pl-4">
                <p className="text-2xl font-bold text-blue-600">{postedThisMonth}</p>
                <p className="text-sm text-gray-600">Total This Month</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-lg transition ${
                  view === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📋 List
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-lg transition ${
                  view === 'calendar'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📅 Calendar
              </button>
            </div>
          </div>
        </div>

        {/* List View */}
        {view === 'list' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Posts</h2>
            </div>
            {posts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-5xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled posts</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {connectedPlatforms.length === 0
                    ? 'Connect a social media account first, then schedule posts.'
                    : 'Click "Schedule New Post" to create your first scheduled post.'}
                </p>
                {connectedPlatforms.length === 0 && (
                  <a
                    href="/portal/social"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium"
                  >
                    Connect Accounts
                  </a>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {posts.map((post) => {
                  const scheduledDate = new Date(post.scheduledFor)
                  return (
                    <div key={post.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="text-3xl">
                            {platformIcons[post.platform] || '📱'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium text-gray-900">{post.platform}</h3>
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                {post.status}
                              </span>
                              {post.aiScore != null && (
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${getScoreColor(post.aiScore)}`}
                                >
                                  AI Score: {post.aiScore}%
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 mb-3">{post.content}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>📅 {scheduledDate.toLocaleDateString()}</span>
                              <span>
                                🕒{' '}
                                {scheduledDate.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {post.socialAccount && (
                                <span>📌 {post.socialAccount.accountName}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Calendar View (simplified) */}
        {view === 'calendar' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Calendar View</h2>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-medium text-gray-700 py-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }).map((_, i) => {
                const now = new Date()
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay()
                const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
                const dayNum = i - firstDay + 1
                const isToday = dayNum === now.getDate()
                const dayPosts = posts.filter((p) => {
                  const d = new Date(p.scheduledFor)
                  return (
                    d.getDate() === dayNum &&
                    d.getMonth() === now.getMonth() &&
                    d.getFullYear() === now.getFullYear()
                  )
                })

                return (
                  <div
                    key={i}
                    className={`min-h-[100px] border rounded-lg p-2 ${
                      dayNum < 1 || dayNum > daysInMonth
                        ? 'bg-gray-50 text-gray-400'
                        : isToday
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white hover:bg-gray-50'
                    } transition`}
                  >
                    {dayNum > 0 && dayNum <= daysInMonth && (
                      <>
                        <div
                          className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}
                        >
                          {dayNum}
                        </div>
                        {dayPosts.map((post) => (
                          <div
                            key={post.id}
                            className="mt-1 bg-blue-100 text-blue-700 text-xs p-1 rounded flex items-center gap-1 truncate"
                          >
                            <span>{platformIcons[post.platform] || '📱'}</span>
                            <span className="truncate">
                              {new Date(post.scheduledFor).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Schedule New Post</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setError('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                <select
                  value={newPost.platform}
                  onChange={(e) => setNewPost({ ...newPost, platform: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select platform...</option>
                  {connectedPlatforms.map((p) => (
                    <option key={p} value={p}>
                      {platformIcons[p] || ''} {p}
                    </option>
                  ))}
                </select>
                {connectedPlatforms.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    No accounts connected.{' '}
                    <a href="/portal/social" className="underline">
                      Connect one first
                    </a>
                    .
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={4}
                  placeholder="Write your post content..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={newPost.date}
                    onChange={(e) => setNewPost({ ...newPost, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={newPost.time}
                    onChange={(e) => setNewPost({ ...newPost, time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleCreatePost}
                disabled={submitting || connectedPlatforms.length === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition font-medium disabled:opacity-50"
              >
                {submitting ? 'Scheduling...' : 'Schedule Post'}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setError('')
                }}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
