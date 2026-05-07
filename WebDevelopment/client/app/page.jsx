"use client";

import { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingScreen from "@/app/components/LoadingScreen";
import { useAuth } from "@/app/auth/useAuth";
import { SERVER_URL } from "@/lib/config";
import { constrainAspectRatio } from "@/lib/imageUtils";
import Image from "next/image";
import CommentModal from "@/app/components/CommentModal";

export default function HomePage() {
  const { signed_in_user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [aspectRatios, setAspectRatios] = useState({});
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [eagerLoadTriggered, setEagerLoadTriggered] = useState(false);
  const [likedPostIds, setLikedPostIds] = useState(new Set());
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [filters, setFilters] = useState({
    category: null,
    condition: null,
    occasions: [],
  });
  const endOfListRef = useRef(null);

  useEffect(() => {
    fetchPosts(0);
  }, [filters]);

  useEffect(() => {
    if (!signed_in_user) return;
    const token = localStorage.getItem("auth_token");
    fetch(`${SERVER_URL}/api/favorite-items`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setLikedPostIds(new Set(data.likedPostIds || [])))
      .catch(() => {});
  }, [signed_in_user]);

  // Intersection Observer for eager loading
  useEffect(() => {
    if (!endOfListRef.current || !hasMore || isLoadingMore || eagerLoadTriggered) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !eagerLoadTriggered && hasMore) {
          setEagerLoadTriggered(true);
          loadMorePosts(offset + 10);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(endOfListRef.current);
    return () => observer.disconnect();
  }, [offset, hasMore, isLoadingMore, eagerLoadTriggered]);

  const fetchPosts = async (newOffset = 0) => {
    try {
      const queryParams = new URLSearchParams({
        limit: 10,
        offset: newOffset,
      });

      if (filters.category) queryParams.append('category', filters.category);
      if (filters.condition) queryParams.append('condition', filters.condition);
      if (filters.occasions.length > 0) {
        queryParams.append('occasions', JSON.stringify(filters.occasions));
      }

      const res = await fetch(`${SERVER_URL}/api/posts?${queryParams}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setPosts(data.posts || []);
      setOffset(newOffset);
      setHasMore(data.pagination?.hasMore ?? false);
      setEagerLoadTriggered(false);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async (newOffset) => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const queryParams = new URLSearchParams({
        limit: 10,
        offset: newOffset,
      });

      if (filters.category) queryParams.append('category', filters.category);
      if (filters.condition) queryParams.append('condition', filters.condition);
      if (filters.occasions.length > 0) {
        queryParams.append('occasions', JSON.stringify(filters.occasions));
      }

      const res = await fetch(`${SERVER_URL}/api/posts?${queryParams}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setPosts((prev) => [...prev, ...(data.posts || [])]);
      setOffset(newOffset);
      setHasMore(data.pagination?.hasMore ?? false);
      setEagerLoadTriggered(false);
    } catch (err) {
      console.error("Failed to load more posts:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleFavorite = async (e, postId) => {
    e.stopPropagation();
    if (!signed_in_user) {
      toast.info("Please sign in to favorite");
      return;
    }
    const token = localStorage.getItem("auth_token");
    const isLiked = likedPostIds.has(postId);

    // Optimistic update
    setLikedPostIds((prev) => {
      const next = new Set(prev);
      isLiked ? next.delete(postId) : next.add(postId);
      return next;
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, likesCount: p.likesCount + (isLiked ? -1 : 1) } : p
      )
    );

    try {
      const res = await fetch(
        `${SERVER_URL}/api/favorite-item${isLiked ? `/${postId}` : ""}`,
        {
          method: isLiked ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: isLiked ? undefined : JSON.stringify({ post_id: postId }),
        }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likesCount: data.likesCount } : p))
      );
    } catch {
      // Revert optimistic update on failure
      setLikedPostIds((prev) => {
        const next = new Set(prev);
        isLiked ? next.add(postId) : next.delete(postId);
        return next;
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likesCount: p.likesCount + (isLiked ? 1 : -1) } : p
        )
      );
      toast.error("Something went wrong. Try again.");
    }
  };

  const handleCommentClick = (e, post) => {
    e.stopPropagation();
    if (!signed_in_user) {
      toast.info("Please sign in to comment");
      return;
    }
    setActiveCommentPost(post);
  };

  const handleCommentsCountChange = (postId, commentsCount) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentsCount } : p))
    );
  };

  const handleImageLoad = (e, imageUrl) => {
    const img = e.target;
    const naturalRatio = img.naturalWidth / img.naturalHeight;
    const constrainedRatio = constrainAspectRatio(naturalRatio);
    setAspectRatios((prev) => ({
      ...prev,
      [imageUrl]: constrainedRatio,
    }));
  };

  const handleImageError = (imageUrl) => {
    console.error("Failed to load image:", imageUrl);
    setAspectRatios((prev) => ({
      ...prev,
      [imageUrl]: 1,
    }));
  };

  return (
    <main className="min-h-screen bg-primary dark:bg-primary-dark text-foreground">
      <ToastContainer position="bottom-center" autoClose={3000} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold">Discover</h1>
        </div>

        {loading ? (
          <LoadingScreen />
        ) : posts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-12">No posts available.</p>
        ) : (
          <>
            <div className="columns-2 md:columns-3 gap-4">
              {posts.map((post) => {
                const imageUrl = post.images?.[0];
                const aspectRatio = imageUrl ? aspectRatios[imageUrl] : null;
                const isLiked = likedPostIds.has(post.id);
                return (
                  <div
                    key={post.id}
                    className="relative group rounded-lg overflow-hidden shadow border-2 border-secondary bg-white dark:bg-secondary-dark mb-6 break-inside-avoid pb-4 cursor-pointer hover:shadow-lg transition-shadow"
                    style={
                      aspectRatio
                        ? { aspectRatio: aspectRatio.toString() }
                        : { minHeight: "12rem" }
                    }
                  >
                    {post.images?.[0] ? (
                      <img
                        src={post.images[0]}
                        alt={post.title}
                        onLoad={(e) => handleImageLoad(e, imageUrl)}
                        onError={() => handleImageError(imageUrl)}
                        crossOrigin="anonymous"
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-sm">
                        No image
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-secondary/80 dark:bg-secondary-dark/80 backdrop-blur-sm">
                      <p className="font-medium text-sm truncate text-gray-800 dark:text-gray-100">{post.title}</p>
                      {post.brand && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{post.brand}</p>
                      )}
                    </div>

                    {/* Heart button — always visible */}
                    <button
                      onClick={(e) => handleFavorite(e, post.id)}
                      className="absolute top-2 right-2 flex items-center gap-1 bg-primary rounded-full px-2 py-1 text-xs shadow hover:scale-110 transition-transform"
                    >
                      <Image
                        src={isLiked ? "/heart-circle-filled.svg" : "/heart-circle-outline.svg"}
                        alt={isLiked ? "Unlike" : "Like"}
                        width={20}
                        height={20}
                      />
                      {post.likesCount > 0 && <span>{post.likesCount}</span>}
                    </button>

                    {/* Comment button — always visible */}
                    <button
                      onClick={(e) => handleCommentClick(e, post)}
                      className="absolute top-2 left-2 flex items-center gap-1 bg-accent-dark rounded-full px-2 py-1 text-xs shadow hover:scale-110 transition-transform"
                    >
                      <img src="/chat-outline.svg" alt="" width={16} height={16} />
                      {post.commentsCount > 0 && <span className="text-white">{post.commentsCount}</span>}
                    </button>
                  </div>
                );
              })}
              {/* Intersection observer trigger for eager loading */}
              <div ref={endOfListRef} className="w-full" />
            </div>

            {isLoadingMore && (
              <div className="flex justify-center mt-6">
                <p className="text-gray-400">Loading more posts...</p>
              </div>
            )}
          </>
        )}
      </div>

      {activeCommentPost && (
        <CommentModal
          post={activeCommentPost}
          onClose={() => setActiveCommentPost(null)}
          onCommentsCountChange={handleCommentsCountChange}
        />
      )}
    </main>
  );
}
