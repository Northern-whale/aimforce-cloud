'use client';

import { useEffect, useState } from 'react';
import { AnalyticsSummary, PlatformAnalytics, TopPosts } from '@/components/social/analytics-widgets';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/social/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/social/analytics/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        await fetchAnalytics();
      }
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : '🔄 Refresh'}
          </button>
          <a
            href="/social"
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>

      <AnalyticsSummary data={analytics.summary} />

      <div className="grid md:grid-cols-2 gap-6">
        <PlatformAnalytics data={analytics.platformAnalytics} />
        <TopPosts data={analytics.topPosts} />
      </div>

      {/* Export Options */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Export Reports</h3>
        <div className="flex gap-3">
          <button className="px-4 py-2 border rounded-md hover:bg-gray-50">
            📄 Export CSV
          </button>
          <button className="px-4 py-2 border rounded-md hover:bg-gray-50">
            📊 Generate PDF Report
          </button>
          <button className="px-4 py-2 border rounded-md hover:bg-gray-50">
            📧 Email Summary
          </button>
        </div>
      </div>
    </div>
  );
}
