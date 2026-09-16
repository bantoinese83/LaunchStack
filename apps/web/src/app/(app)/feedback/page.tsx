'use client';

import React, { useState } from 'react';
import { Toast } from '@template/ui';
import { useFeedbackData } from './hooks/useFeedbackData';
import { FeedbackHeader } from './components/FeedbackHeader';
import { FeedbackFilters, FeedbackFilter } from './components/FeedbackFilters';
import { FeedbackList } from './components/FeedbackList';
import { FeedbackModal } from './components/FeedbackModal';

export default function FeedbackBoardPage() {
  const {
    posts,
    selectedWorkspaceId,
    isLoading,
    toastMessage,
    setToastMessage,
    handleUpvote,
    handleCreateFeedback,
  } = useFeedbackData();

  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<FeedbackFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-paper atlas-grain p-6 text-ink md:p-8">
      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}

      <div className="mx-auto max-w-5xl animate-[rise_400ms_ease-out]">
        <FeedbackHeader onShowModal={() => setShowModal(true)} />

        <FeedbackFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
        />

        <FeedbackList
          isLoading={isLoading}
          posts={filteredPosts}
          onUpvote={handleUpvote}
          onShowModal={() => setShowModal(true)}
        />

        <FeedbackModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          workspaceId={selectedWorkspaceId}
          onSubmit={handleCreateFeedback}
        />
      </div>
    </div>
  );
}
