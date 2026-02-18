'use client';

import { useState } from 'react';
import { PLATFORM_CONFIGS, type SocialPlatform } from '@/lib/social/types';

interface PostComposerProps {
  connectedPlatforms: SocialPlatform[];
  onSubmit: (data: {
    platforms: SocialPlatform[];
    content: string;
    mediaUrls: string[];
    scheduledFor: Date;
    status: 'draft' | 'scheduled';
  }) => Promise<void>;
}

export function PostComposer({ connectedPlatforms, onSubmit }: PostComposerProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [scheduledFor, setScheduledFor] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePlatformToggle = (platform: SocialPlatform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = async (status: 'draft' | 'scheduled') => {
    if (!content.trim()) {
      alert('Please enter post content');
      return;
    }

    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    if (status === 'scheduled' && !scheduledFor) {
      alert('Please select a schedule time');
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        platforms: selectedPlatforms,
        content: content.trim(),
        mediaUrls,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
        status,
      });
      
      // Reset form
      setContent('');
      setMediaUrls([]);
      setScheduledFor('');
      setSelectedPlatforms([]);
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const getCharacterLimit = () => {
    if (selectedPlatforms.length === 0) return null;
    const limits = selectedPlatforms.map(p => PLATFORM_CONFIGS[p].maxTextLength);
    return Math.min(...limits);
  };

  const charLimit = getCharacterLimit();
  const charCount = content.length;
  const isOverLimit = charLimit && charCount > charLimit;

  return (
    <div className="border rounded-lg p-6 bg-white">
      <h2 className="text-xl font-semibold mb-4">Create Post</h2>

      {/* Platform Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Platforms</label>
        <div className="flex flex-wrap gap-2">
          {connectedPlatforms.map(platform => {
            const config = PLATFORM_CONFIGS[platform];
            const isSelected = selectedPlatforms.includes(platform);
            
            return (
              <button
                key={platform}
                onClick={() => handlePlatformToggle(platform)}
                className={`px-4 py-2 rounded-md border-2 transition-all ${
                  isSelected
                    ? 'border-current text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
                style={isSelected ? { backgroundColor: config.color, borderColor: config.color } : {}}
              >
                {config.icon} {config.displayName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Post Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What would you like to share?"
          rows={6}
          className={`w-full px-4 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isOverLimit ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {charLimit && (
          <div className={`text-sm mt-1 ${isOverLimit ? 'text-red-600' : 'text-gray-600'}`}>
            {charCount} / {charLimit} characters
            {isOverLimit && ' - Content exceeds character limit'}
          </div>
        )}
      </div>

      {/* Media URLs */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Media URLs (optional)</label>
        <input
          type="text"
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
              setMediaUrls([...mediaUrls, e.currentTarget.value.trim()]);
              e.currentTarget.value = '';
            }
          }}
        />
        {mediaUrls.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {mediaUrls.map((url, i) => (
              <div key={i} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <span className="truncate max-w-xs">{url}</span>
                <button
                  onClick={() => setMediaUrls(mediaUrls.filter((_, idx) => idx !== i))}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Schedule (optional)</label>
        <input
          type="datetime-local"
          value={scheduledFor}
          onChange={(e) => setScheduledFor(e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => handleSubmit('draft')}
          disabled={saving || Boolean(isOverLimit)}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Save as Draft
        </button>
        <button
          onClick={() => handleSubmit('scheduled')}
          disabled={saving || Boolean(isOverLimit)}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {scheduledFor ? 'Schedule Post' : 'Post Now'}
        </button>
      </div>
    </div>
  );
}
