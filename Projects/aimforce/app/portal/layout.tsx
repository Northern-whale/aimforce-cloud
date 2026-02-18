export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold">AIMForce</h1>
              <div className="flex gap-4">
                <a
                  href="/portal"
                  className="px-3 py-2 rounded-lg hover:bg-white/20 transition text-sm font-medium"
                >
                  Dashboard
                </a>
                <a
                  href="/portal/social"
                  className="px-3 py-2 rounded-lg hover:bg-white/20 transition text-sm font-medium"
                >
                  Social Media
                </a>
                <a
                  href="/portal/content"
                  className="px-3 py-2 rounded-lg hover:bg-white/20 transition text-sm font-medium"
                >
                  Content
                </a>
                <a
                  href="/portal/schedule"
                  className="px-3 py-2 rounded-lg hover:bg-white/20 transition text-sm font-medium"
                >
                  Schedule
                </a>
                <a
                  href="/portal/voice"
                  className="px-3 py-2 rounded-lg hover:bg-white/20 transition text-sm font-medium"
                >
                  Voice Notes
                </a>
              </div>
            </div>
            <a
              href="/api/auth/signout"
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition text-sm font-medium"
            >
              Sign Out
            </a>
          </div>
        </div>
      </nav>

      {children}
    </div>
  )
}
