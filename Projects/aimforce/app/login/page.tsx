'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-4 sm:px-6 lg:px-8">
      {/* Login Container - Explicitly sized */}
      <div className="w-full max-w-[440px] mx-auto">
        {/* Card - Professional shadow and spacing */}
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          {/* Header Section */}
          <div className="px-8 pt-10 pb-6 text-center bg-gradient-to-br from-white to-blue-50/30">
            {/* Logo */}
            <div className="mb-3">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
                AIMForce
              </h1>
            </div>
            <p className="text-gray-600 text-base font-medium">
              Your AI Workforce
            </p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="block w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="you@company.com"
                  style={{ minWidth: '100%' }}
                />
              </div>

              {/* Password Field */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="block w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="••••••••"
                  style={{ minWidth: '100%' }}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-base font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                style={{ minWidth: '100%', whiteSpace: 'nowrap' }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Demo Credentials Section */}
          <div className="px-8 pb-8 pt-6 border-t border-gray-100 bg-gray-50/50">
            <p className="text-sm text-gray-700 font-semibold mb-4">
              Demo Accounts:
            </p>
            
            <div className="space-y-3">
              {/* Owner Account */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                <p className="text-sm font-bold text-gray-800 mb-2">
                  Owner Dashboard
                </p>
                <div className="space-y-1 text-xs font-mono text-gray-600">
                  <p className="select-all">owner@aimforce.cloud</p>
                  <p className="select-all">aimforce2026</p>
                </div>
              </div>

              {/* Client Account */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                <p className="text-sm font-bold text-gray-800 mb-2">
                  Client Portal
                </p>
                <div className="space-y-1 text-xs font-mono text-gray-600">
                  <p className="select-all">demo1@company.com</p>
                  <p className="select-all">demo2026</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-center">
            <p className="text-white text-xs font-medium opacity-90">
              24/7 AI Workforce Management Platform
            </p>
          </div>
        </div>

        {/* Powered by Note */}
        <p className="text-center mt-6 text-sm text-gray-500">
          Secure authentication powered by NextAuth
        </p>
      </div>
    </div>
  )
}
