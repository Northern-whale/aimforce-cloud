'use client';

import { useEffect, useState } from 'react';
import { AnalyticsSummary, PlatformAnalytics, TopPosts, PlatformHealth } from '@/components/social/analytics-widgets';
import { PostComposer } from '@/components/social/post-composer';
import type { SocialPlatform } from '@/lib/social/types';

export default function SocialPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, accountsRes] = await Promise.all([
        fetch('/api/social/analytics'),
        fetch('/api/social/accounts'),
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }

      if (accountsRes.ok) {
        const data = await accountsRes.json();
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (postData: any) => {
    const response = await fetch('/api/social/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create post');
    }

    // Refresh data
    fetchData();
  };

  const connectedPlatforms: SocialPlatform[] = accounts
    .filter(acc => acc.connected)
    .map(acc => acc.platform);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Social Media Dashboard</h1>
        <div className="flex gap-3">
          <a
            href="/social/calendar"
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            📅 Calendar
          </a>
          <a
            href="/social/analytics"
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            📊 Analytics
          </a>
          <a
            href="/social/settings"
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            ⚙️ Settings
          </a>
        </div>
      </div>

      {connectedPlatforms.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">No platforms connected</h2>
          <p className="text-gray-600 mb-4">
            Connect your social media accounts to start posting and viewing analytics
          </p>
          <a
            href="/social/settings"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Connect Platforms
          </a>
        </div>
      ) : (
        <>
          {/* Analytics Summary */}
          {analytics && (
            <div className="space-y-6">
              <AnalyticsSummary data={analytics.summary} />
              
              <div className="grid md:grid-cols-2 gap-6">
                <PlatformAnalytics data={analytics.platformAnalytics} />
                <TopPosts data={analytics.topPosts} />
              </div>

              <PlatformHealth data={analytics.platformHealth} />
            </div>
          )}

          {/* Post Composer */}
          <PostComposer
            connectedPlatforms={connectedPlatforms}
            onSubmit={handleCreatePost}
          />

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-6 hover:border-blue-500 cursor-pointer transition-colors">
              <div className="text-2xl mb-2">📅</div>
              <h3 className="font-semibold mb-1">Content Calendar</h3>
              <p className="text-sm text-gray-600">
                View and manage all scheduled posts
              </p>
            </div>
            
            <div className="border rounded-lg p-6 hover:border-blue-500 cursor-pointer transition-colors">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold mb-1">Analytics</h3>
              <p className="text-sm text-gray-600">
                Deep dive into performance metrics
              </p>
            </div>
            
            <div className="border rounded-lg p-6 hover:border-blue-500 cursor-pointer transition-colors">
              <div className="text-2xl mb-2">⚙️</div>
              <h3 className="font-semibold mb-1">Settings</h3>
              <p className="text-sm text-gray-600">
                Manage connected platforms
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
