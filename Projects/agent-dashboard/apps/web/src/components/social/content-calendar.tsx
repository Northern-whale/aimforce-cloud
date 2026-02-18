'use client';

import { useState } from 'react';
import { PLATFORM_CONFIGS } from '@/lib/social/types';

interface ScheduledPost {
  id: string;
  platforms: string[];
  content: string;
  scheduledFor: string;
  status: string;
  mediaUrls?: string[];
}

interface ContentCalendarProps {
  posts: ScheduledPost[];
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

export function ContentCalendar({ posts, onEdit, onDelete }: ContentCalendarProps) {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInView = () => {
    const days: Date[] = [];
    const start = new Date(currentDate);
    
    if (viewMode === 'week') {
      start.setDate(start.getDate() - start.getDay()); // Start on Sunday
      for (let i = 0; i < 7; i++) {
        days.push(new Date(start));
        start.setDate(start.getDate() + 1);
      }
    } else {
      start.setDate(1); // First day of month
      const firstDay = start.getDay();
      start.setDate(1 - firstDay); // Go back to Sunday before month
      
      for (let i = 0; i < 35; i++) { // 5 weeks
        days.push(new Date(start));
        start.setDate(start.getDate() + 1);
      }
    }
    
    return days;
  };

  const getPostsForDay = (day: Date) => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    
    return posts.filter(post => {
      const postDate = new Date(post.scheduledFor);
      return postDate >= dayStart && postDate <= dayEnd;
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const days = getDaysInView();

  return (
    <div className="bg-white border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Content Calendar</h2>
        
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 text-sm ${
                viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 text-sm border-l ${
                viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
              }`}
            >
              Month
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate('prev')}
              className="px-3 py-2 border rounded-md hover:bg-gray-50"
            >
              ←
            </button>
            <span className="px-4 py-2 font-medium">
              {currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
            <button
              onClick={() => navigateDate('next')}
              className="px-3 py-2 border rounded-md hover:bg-gray-50"
            >
              →
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 border rounded-md hover:bg-gray-50 text-sm"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 border rounded-lg overflow-hidden">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((day, index) => {
          const dayPosts = getPostsForDay(day);
          const isToday = day.toDateString() === new Date().toDateString();
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();

          return (
            <div
              key={index}
              className={`bg-white p-2 min-h-[120px] ${
                !isCurrentMonth ? 'opacity-50' : ''
              } ${isToday ? 'bg-blue-50' : ''}`}
            >
              <div className={`text-sm mb-2 ${isToday ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
                {day.getDate()}
              </div>
              
              <div className="space-y-1">
                {dayPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Posted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-300 rounded"></div>
          <span>Draft</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Failed</span>
        </div>
      </div>
    </div>
  );
}

function PostCard({ 
  post, 
  onEdit, 
  onDelete 
}: { 
  post: ScheduledPost;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const statusColors = {
    posted: 'bg-green-500',
    scheduled: 'bg-blue-500',
    draft: 'bg-gray-300',
    failed: 'bg-red-500',
  };

  const time = new Date(post.scheduledFor).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div
      className={`${statusColors[post.status as keyof typeof statusColors]} text-white p-2 rounded text-xs cursor-pointer hover:opacity-90 transition-opacity`}
      onClick={() => onEdit?.(post.id)}
    >
      <div className="font-medium mb-1">{time}</div>
      <div className="truncate mb-1">{post.content.substring(0, 40)}...</div>
      <div className="flex gap-1">
        {post.platforms.map(platform => {
          const config = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];
          return (
            <span key={platform} title={config.displayName}>
              {config.icon}
            </span>
          );
        })}
      </div>
    </div>
  );
}
