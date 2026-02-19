import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <main className="flex flex-col items-center gap-8 px-6 text-center max-w-2xl">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            AIMForce
          </span>
        </h1>
        <p className="text-xl sm:text-2xl text-slate-300 leading-relaxed">
          Your AI Workforce. 24/7 agents that execute your business operations while you sleep.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Link
            href="/login"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/25"
          >
            Sign In
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-semibold text-lg mb-2">AI Agents</h3>
            <p className="text-sm text-slate-400">
              Marketing, content, analytics — your AI team works around the clock.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-lg mb-2">Smart Analytics</h3>
            <p className="text-sm text-slate-400">
              Real-time insights and AI recommendations to grow your business.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="font-semibold text-lg mb-2">Social Media</h3>
            <p className="text-sm text-slate-400">
              Automated posting and scheduling across all your platforms.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
