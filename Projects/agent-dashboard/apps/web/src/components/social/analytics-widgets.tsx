'use client';

import { PLATFORM_CONFIGS } from '@/lib/social/types';

interface AnalyticsData {
  summary: {
    totalFollowers: number;
    totalReach: number;
    totalEngagement: number;
    connectedPlatforms: number;
    totalPosts: number;
  };
  platformAnalytics: Array<{
    platform: string;
    followers?: number;
    reach?: number;
    impressions?: number;
    engagement?: number;
  }>;
  topPosts: Array<{
    id: string;
    content: string;
    platforms: string[];
    postedAt: string;
    analytics: any;
  }>;
  platformHealth: Array<{
    platform: string;
    accountName: string;
    connected: boolean;
    status: string;
  }>;
}

export function AnalyticsSummary({ data }: { data: AnalyticsData['summary'] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <MetricCard
        title="Total Followers"
        value={data.totalFollowers.toLocaleString()}
        icon="👥"
      />
      <MetricCard
        title="Total Reach"
        value={data.totalReach.toLocaleString()}
        icon="📊"
      />
      <MetricCard
        title="Engagement"
        value={data.totalEngagement.toLocaleString()}
        icon="❤️"
      />
      <MetricCard
        title="Connected"
        value={`${data.connectedPlatforms}/5`}
        icon="🔗"
      />
      <MetricCard
        title="Total Posts"
        value={data.totalPosts.toLocaleString()}
        icon="📝"
      />
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
}

export function PlatformAnalytics({ data }: { data: AnalyticsData['platformAnalytics'] }) {
  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Platform Performance</h3>
      <div className="space-y-4">
        {data.map((platform) => {
          const config = PLATFORM_CONFIGS[platform.platform as keyof typeof PLATFORM_CONFIGS];
          
          return (
            <div key={platform.platform} className="flex items-center justify-between pb-4 border-b last:border-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${config.color}15` }}
                >
                  {config.icon}
                </div>
                <div>
                  <div className="font-medium">{config.displayName}</div>
                  {platform.followers !== undefined && (
                    <div className="text-sm text-gray-600">
                      {platform.followers.toLocaleString()} followers
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                {platform.reach !== undefined && (
                  <div className="text-sm text-gray-600">
                    Reach: {platform.reach.toLocaleString()}
                  </div>
                )}
                {platform.engagement !== undefined && (
                  <div className="text-sm text-gray-600">
                    Engagement: {platform.engagement.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TopPosts({ data }: { data: AnalyticsData['topPosts'] }) {
  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Top Performing Posts</h3>
      <div className="space-y-4">
        {data.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No posts yet</p>
        ) : (
          data.map((post, index) => {
            const engagement = (post.analytics.likes || 0) + (post.analytics.comments || 0) + (post.analytics.shares || 0);
            
            return (
              <div key={post.id} className="pb-4 border-b last:border-0">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm mb-2">{post.content}...</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>❤️ {post.analytics.likes || 0}</span>
                      <span>💬 {post.analytics.comments || 0}</span>
                      <span>🔄 {post.analytics.shares || 0}</span>
                      <span className="ml-auto">
                        {new Date(post.postedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function PlatformHealth({ data }: { data: AnalyticsData['platformHealth'] }) {
  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Platform Status</h3>
      <div className="space-y-3">
        {data.map((platform) => {
          const config = PLATFORM_CONFIGS[platform.platform as keyof typeof PLATFORM_CONFIGS];
          
          return (
            <div key={platform.platform} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  style={{ backgroundColor: `${config.color}15` }}
                >
                  {config.icon}
                </div>
                <div>
                  <div className="font-medium text-sm">{config.displayName}</div>
                  <div className="text-xs text-gray-600">@{platform.accountName}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    platform.connected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-xs text-gray-600">
                  {platform.connected ? 'Active' : 'Disconnected'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
