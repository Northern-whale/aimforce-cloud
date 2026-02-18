'use client';

import { useState } from 'react';
import { PLATFORM_CONFIGS, type SocialPlatform } from '@/lib/social/types';

interface ConnectedAccount {
  id: string;
  platform: string;
  accountName: string;
  connected: boolean;
  createdAt: string;
}

interface PlatformConnectProps {
  accounts: ConnectedAccount[];
  onConnect: (platform: SocialPlatform) => void;
  onDisconnect: (accountId: string) => void;
}

export function PlatformConnect({ accounts, onConnect, onDisconnect }: PlatformConnectProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleConnect = async (platform: SocialPlatform) => {
    setLoading(platform);
    try {
      onConnect(platform);
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    if (confirm('Are you sure you want to disconnect this account?')) {
      onDisconnect(accountId);
    }
  };

  const platforms: SocialPlatform[] = ['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok'];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {platforms.map(platform => {
        const config = PLATFORM_CONFIGS[platform];
        const account = accounts.find(acc => acc.platform === platform && acc.connected);
        
        return (
          <div
            key={platform}
            className="border rounded-lg p-6 hover:border-gray-400 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${config.color}15` }}
                >
                  {config.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{config.displayName}</h3>
                  {account && (
                    <p className="text-sm text-gray-600">@{account.accountName}</p>
                  )}
                </div>
              </div>
              
              {account ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Connected
                </span>
              ) : (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  Not connected
                </span>
              )}
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <p>Max {config.maxPostsPerDay} posts/day</p>
              <p>Best times: {config.optimalPostTimes[0]}</p>
            </div>

            {account ? (
              <button
                onClick={() => handleDisconnect(account.id)}
                className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => handleConnect(platform)}
                disabled={loading === platform}
                className="w-full px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50"
                style={{ backgroundColor: config.color }}
              >
                {loading === platform ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
