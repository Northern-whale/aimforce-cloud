'use client';

import { useEffect, useState } from 'react';
import { ContentCalendar } from '@/components/social/content-calendar';

export default function CalendarPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/social/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (postId: string) => {
    // TODO: Open edit modal
    console.log('Edit post:', postId);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/social/posts?id=${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
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
        <h1 className="text-3xl font-bold">Content Calendar</h1>
        <a
          href="/social"
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          ← Back to Dashboard
        </a>
      </div>

      <ContentCalendar
        posts={posts}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
