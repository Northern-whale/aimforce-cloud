'use client'

import { useState } from 'react'

export default function SchedulePage() {
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Mock scheduled posts
  const scheduledPosts = [
    {
      id: '1',
      platform: 'FACEBOOK',
      content: 'Exciting product launch next week! Stay tuned for updates.',
      scheduledFor: new Date('2026-02-20T10:00:00'),
      status: 'SCHEDULED',
      aiScore: 85,
    },
    {
      id: '2',
      platform: 'INSTAGRAM',
      content: 'Behind the scenes of our latest project 📸',
      scheduledFor: new Date('2026-02-21T14:30:00'),
      status: 'SCHEDULED',
      aiScore: 92,
    },
    {
      id: '3',
      platform: 'LINKEDIN',
      content: 'New blog post: 10 Ways AI is Transforming Business Operations',
      scheduledFor: new Date('2026-02-22T09:00:00'),
      status: 'SCHEDULED',
      aiScore: 78,
    },
  ]

  const platformIcons: Record<string, string> = {
    FACEBOOK: '📘',
    INSTAGRAM: '📸',
    LINKEDIN: '💼',
    TWITTER: '🐦',
    TIKTOK: '🎵',
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-700'
    if (score >= 75) return 'bg-blue-100 text-blue-700'
    if (score >= 60) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
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
                ← Back
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Toggle & Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">{scheduledPosts.length}</p>
                <p className="text-sm text-gray-600">Posts Scheduled</p>
              </div>
              <div className="border-l border-gray-300 pl-4">
                <p className="text-2xl font-bold text-green-600">5</p>
                <p className="text-sm text-gray-600">Posted This Week</p>
              </div>
              <div className="border-l border-gray-300 pl-4">
                <p className="text-2xl font-bold text-blue-600">12</p>
                <p className="text-sm text-gray-600">Total This Month</p>
              </div>
            </div>

            <div className="flex gap-2">
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
            </div>
          </div>
        </div>

        {/* Content Area */}
        {view === 'list' ? (
          /* List View */
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Posts</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {scheduledPosts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl">{platformIcons[post.platform]}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">{post.platform}</h3>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            {post.status}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getScoreColor(post.aiScore)}`}>
                            AI Score: {post.aiScore}%
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{post.content}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>📅 {post.scheduledFor.toLocaleDateString()}</span>
                          <span>🕒 {post.scheduledFor.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm">
                        Edit
                      </button>
                      <button className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Calendar View */
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">February 2026</h2>
              <div className="flex gap-2">
                <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
                  ← Prev
                </button>
                <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                  Today
                </button>
                <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
                  Next →
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-medium text-gray-700 py-2">
                  {day}
                </div>
              ))}

              {Array.from({ length: 35 }).map((_, i) => {
                const dayNum = i - 2 // Start from day -2 to fill grid
                const hasPost = [18, 19, 20].includes(dayNum) // Mock: posts on 20th, 21st, 22nd
                const isToday = dayNum === 18

                return (
                  <div
                    key={i}
                    className={`min-h-[100px] border rounded-lg p-2 ${
                      dayNum < 1 || dayNum > 28
                        ? 'bg-gray-50 text-gray-400'
                        : isToday
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white hover:bg-gray-50'
                    } transition cursor-pointer`}
                  >
                    {dayNum > 0 && dayNum <= 28 && (
                      <>
                        <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                          {dayNum}
                        </div>
                        {hasPost && (
                          <div className="mt-2 space-y-1">
                            <div className="bg-blue-100 text-blue-700 text-xs p-1 rounded flex items-center gap-1">
                              <span>📘</span>
                              <span className="truncate">10:00 AM</span>
                            </div>
                            {dayNum === 19 && (
                              <div className="bg-pink-100 text-pink-700 text-xs p-1 rounded flex items-center gap-1">
                                <span>📸</span>
                                <span className="truncate">2:30 PM</span>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded"></div>
                <span className="text-gray-600">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 rounded"></div>
                <span className="text-gray-600">Facebook</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-pink-100 rounded"></div>
                <span className="text-gray-600">Instagram</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-200 rounded"></div>
                <span className="text-gray-600">LinkedIn</span>
              </div>
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🤖</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-3">AI Scheduling Recommendations</h3>
              <div className="space-y-3">
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="font-medium mb-1">📘 Facebook - Best Time: Weekdays 10-11 AM</p>
                  <p className="text-sm text-purple-100">
                    Your audience is most active during morning coffee breaks. Engagement rate: +45%
                  </p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="font-medium mb-1">📸 Instagram - Best Time: Weekdays 2-3 PM</p>
                  <p className="text-sm text-purple-100">
                    Afternoon posts get 60% more likes. Visual content performs best on Thursdays.
                  </p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="font-medium mb-1">💼 LinkedIn - Best Time: Tuesday-Thursday 9 AM</p>
                  <p className="text-sm text-purple-100">
                    B2B audience checks LinkedIn first thing Tuesday mornings. Engagement rate: +38%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Create Post Modal (Placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Schedule New Post</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Facebook</option>
                  <option>Instagram</option>
                  <option>LinkedIn</option>
                  <option>Twitter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={4}
                  placeholder="Write your post content..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input type="time" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>💡 AI Suggestion:</strong> For maximum engagement, post to Facebook on
                  Thursday at 10:00 AM (predicted engagement: 85%)
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition font-medium">
                Schedule Post
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
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
