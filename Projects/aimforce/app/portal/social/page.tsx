import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function SocialAccountsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'CLIENT' || !session.user.clientId) {
    redirect('/login')
  }

  const clientId = session.user.clientId

  // Fetch connected social accounts
  const socialAccounts = await prisma.socialAccount.findMany({
    where: { clientId },
    orderBy: { connectedAt: 'desc' },
  })

  const platforms = [
    {
      id: 'FACEBOOK',
      name: 'Facebook',
      icon: '📘',
      description: 'Share updates to your Facebook page',
      color: 'from-blue-600 to-blue-700',
    },
    {
      id: 'INSTAGRAM',
      name: 'Instagram',
      icon: '📸',
      description: 'Post photos and videos to Instagram',
      color: 'from-pink-600 to-purple-600',
    },
    {
      id: 'LINKEDIN',
      name: 'LinkedIn',
      icon: '💼',
      description: 'Share professional content on LinkedIn',
      color: 'from-blue-700 to-blue-800',
    },
    {
      id: 'TWITTER',
      name: 'Twitter (X)',
      icon: '🐦',
      description: 'Post tweets to your Twitter account',
      color: 'from-sky-500 to-blue-500',
    },
    {
      id: 'TIKTOK',
      name: 'TikTok',
      icon: '🎵',
      description: 'Upload videos to TikTok',
      color: 'from-black to-gray-800',
    },
  ]

  const connectedPlatforms = new Set(socialAccounts.map((acc) => acc.platform))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Social Media Accounts</h1>
              <p className="text-sm text-gray-600 mt-1">
                Connect your social media accounts to enable automated posting
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
        {/* Connected Accounts Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Connected Accounts</h2>
              <p className="text-sm text-gray-600 mt-1">
                You have {socialAccounts.length} account{socialAccounts.length !== 1 ? 's' : ''}{' '}
                connected
              </p>
            </div>
            {socialAccounts.length > 0 && (
              <div className="flex gap-2">
                {Array.from(connectedPlatforms).map((platform) => (
                  <span
                    key={platform}
                    className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => {
            const account = socialAccounts.find((acc) => acc.platform === platform.id)
            const isConnected = !!account

            return (
              <div
                key={platform.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-3xl`}>
                    {platform.icon}
                  </div>
                  {isConnected && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Connected
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-1">{platform.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{platform.description}</p>

                {isConnected ? (
                  <>
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-500 mb-1">Account</p>
                      <p className="text-sm font-medium text-gray-900">{account.accountName}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Connected {new Date(account.connectedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                        disabled
                      >
                        Reconnect
                      </button>
                      <button
                        className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                        disabled
                      >
                        Disconnect
                      </button>
                    </div>
                  </>
                ) : (
                  <a
                    href={`/api/oauth/connect/${platform.id.toLowerCase()}`}
                    className={`block w-full px-4 py-3 bg-gradient-to-r ${platform.color} text-white rounded-lg hover:opacity-90 transition font-medium text-center`}
                  >
                    Connect {platform.name}
                  </a>
                )}
              </div>
            )
          })}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🔐</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">How Account Connection Works</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">1.</span>
                  <span>
                    Click "Connect" on any platform to start the OAuth authorization flow
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">2.</span>
                  <span>
                    You'll be redirected to the platform's login page (secure, encrypted)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">3.</span>
                  <span>Grant permission for AIMForce to post on your behalf</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">4.</span>
                  <span>
                    You'll be redirected back and your account will be connected automatically
                  </span>
                </li>
              </ul>
              <p className="mt-4 text-sm font-medium text-gray-900">
                🔒 Your credentials are encrypted and secure. You can disconnect at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {socialAccounts.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <a
              href="/portal/content"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg p-6 hover:from-blue-700 hover:to-cyan-700 transition"
            >
              <div className="text-3xl mb-3">📁</div>
              <h3 className="text-lg font-semibold mb-2">Upload Content</h3>
              <p className="text-sm text-blue-100">
                Add photos, videos, and documents to your content library
              </p>
            </a>
            <a
              href="/portal/schedule"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-6 hover:from-purple-700 hover:to-pink-700 transition"
            >
              <div className="text-3xl mb-3">📅</div>
              <h3 className="text-lg font-semibold mb-2">Schedule Posts</h3>
              <p className="text-sm text-purple-100">
                Plan and schedule content across all your connected platforms
              </p>
            </a>
          </div>
        )}
      </main>
    </div>
  )
}
