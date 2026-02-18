'use client';

import { useEffect, useState } from 'react';
import { PlatformConnect } from '@/components/social/platform-connect';
import type { SocialPlatform } from '@/lib/social/types';

export default function SettingsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/social/accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: SocialPlatform) => {
    try {
      // Step 1: Get OAuth URL
      const response = await fetch(`/api/social/connect?platform=${platform}`);
      
      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to initiate OAuth');
        return;
      }

      const { authUrl, state } = await response.json();

      // Step 2: Open OAuth popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        authUrl,
        'oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for OAuth callback
      const checkPopup = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(checkPopup);
          // Refresh accounts after popup closes
          fetchAccounts();
        }
      }, 1000);

    } catch (error) {
      console.error('Error connecting platform:', error);
      alert('Failed to connect platform');
    }
  };

  const handleDisconnect = async (accountId: string) => {
    try {
      const response = await fetch(`/api/social/accounts?id=${accountId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAccounts();
      }
    } catch (error) {
      console.error('Error disconnecting account:', error);
    }
  };

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
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <a
          href="/social"
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          ← Back to Dashboard
        </a>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">📘 OAuth Setup Required</h3>
        <p className="text-sm text-gray-700 mb-2">
          To connect social media platforms, you need to configure OAuth credentials:
        </p>
        <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1">
          <li>Create developer apps for each platform</li>
          <li>Add OAuth redirect URI: <code className="bg-white px-2 py-1 rounded">https://your-domain.com/api/social/connect/callback</code></li>
          <li>Set environment variables (see documentation below)</li>
        </ol>
      </div>

      <PlatformConnect
        accounts={accounts}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {/* OAuth Configuration Guide */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Environment Variables</h3>
        <div className="bg-gray-50 p-4 rounded-md font-mono text-sm space-y-1">
          <div># Instagram/Facebook (Meta)</div>
          <div>INSTAGRAM_CLIENT_ID=your_app_id</div>
          <div>INSTAGRAM_CLIENT_SECRET=your_app_secret</div>
          <div>INSTAGRAM_REDIRECT_URI=https://your-domain.com/api/social/connect/callback</div>
          <div className="mt-3"># LinkedIn</div>
          <div>LINKEDIN_CLIENT_ID=your_client_id</div>
          <div>LINKEDIN_CLIENT_SECRET=your_client_secret</div>
          <div className="mt-3"># Twitter/X</div>
          <div>TWITTER_CLIENT_ID=your_client_id</div>
          <div>TWITTER_CLIENT_SECRET=your_client_secret</div>
          <div className="mt-3"># TikTok</div>
          <div>TIKTOK_CLIENT_ID=your_client_key</div>
          <div>TIKTOK_CLIENT_SECRET=your_client_secret</div>
          <div className="mt-3"># Security</div>
          <div>CRON_SECRET=random_secure_string_for_cron</div>
          <div>ENCRYPTION_KEY=64_character_hex_string</div>
        </div>
      </div>

      {/* Platform Documentation Links */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Developer Documentation</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <a
            href="https://developers.facebook.com/docs/instagram-api/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 border rounded-md hover:bg-gray-50"
          >
            <span>📸</span>
            <div>
              <div className="font-medium">Instagram API</div>
              <div className="text-sm text-gray-600">developers.facebook.com</div>
            </div>
          </a>
          
          <a
            href="https://developers.facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 border rounded-md hover:bg-gray-50"
          >
            <span>👤</span>
            <div>
              <div className="font-medium">Facebook API</div>
              <div className="text-sm text-gray-600">developers.facebook.com</div>
            </div>
          </a>
          
          <a
            href="https://www.linkedin.com/developers/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 border rounded-md hover:bg-gray-50"
          >
            <span>💼</span>
            <div>
              <div className="font-medium">LinkedIn API</div>
              <div className="text-sm text-gray-600">linkedin.com/developers</div>
            </div>
          </a>
          
          <a
            href="https://developer.twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 border rounded-md hover:bg-gray-50"
          >
            <span>🐦</span>
            <div>
              <div className="font-medium">Twitter/X API</div>
              <div className="text-sm text-gray-600">developer.twitter.com</div>
            </div>
          </a>
          
          <a
            href="https://developers.tiktok.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 border rounded-md hover:bg-gray-50"
          >
            <span>🎵</span>
            <div>
              <div className="font-medium">TikTok API</div>
              <div className="text-sm text-gray-600">developers.tiktok.com</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
