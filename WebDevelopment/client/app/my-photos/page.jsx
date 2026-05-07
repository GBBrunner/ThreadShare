"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/app/auth/useAuth";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import NewPostModal from "@/app/components/NewPostModal";
import { FaTrash, FaPencilAlt } from "react-icons/fa";
import { SERVER_URL } from "@/lib/config";
import { getResponsiveImageUrl, constrainAspectRatio } from "@/lib/imageUtils";

export default function MyPhotosPage() {
  const { signed_in_user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [aspectRatios, setAspectRatios] = useState({});
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [eagerLoadTriggered, setEagerLoadTriggered] = useState(false);
  const endOfListRef = useRef(null);

  useEffect(() => {
    if (!signed_in_user) return;
    fetchPosts(0);
  }, [signed_in_user]);

  // Intersection Observer for eager loading
  useEffect(() => {
    if (!endOfListRef.current || !hasMore || isLoadingMore || eagerLoadTriggered) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Trigger when user is near bottom (80% of element visible)
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
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${SERVER_URL}/api/my_posts?limit=10&offset=${newOffset}`, {
        headers: { Authorization: `Bearer ${token}` },
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
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${SERVER_URL}/api/my_posts?limit=10&offset=${newOffset}`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const handleDelete = async (postId) => {
    const token = localStorage.getItem("auth_token");
    const res = await fetch(`${SERVER_URL}/api/posts/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleSaved = (updated) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditPost(null);
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

  return (
    <ProtectedRoute isLoggedIn={!!signed_in_user}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">My Photos</h1>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-500">No posts yet. Create one with the New Post button!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
            {posts.map((post) => {
              const imageUrl = post.images?.[0];
              const aspectRatio = imageUrl ? aspectRatios[imageUrl] : null;
              return (
              <div
                key={post.id}
                className="relative group rounded-lg overflow-hidden shadow border bg-white"
                style={
                  aspectRatio
                    ? { aspectRatio: aspectRatio.toString() }
                    : { minHeight: "12rem" }
                }
              >
                {post.images?.[0] ? (
                  <img
                    src={getResponsiveImageUrl(post.images[0])}
                    alt={post.title}
                    onLoad={(e) => handleImageLoad(e, imageUrl)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    No image
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-white">
                  <p className="font-medium text-sm truncate text-gray-800">{post.title}</p>
                  {post.brand && (
                    <p className="text-xs text-gray-400 truncate">{post.brand}</p>
                  )}
                </div>
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditPost(post)}
                    className="bg-white rounded-full p-1.5 shadow hover:bg-gray-100"
                    title="Edit post"
                  >
                    <FaPencilAlt size={13} className="text-gray-700" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="bg-white rounded-full p-1.5 shadow hover:bg-red-50"
                    title="Delete post"
                  >
                    <FaTrash size={13} className="text-red-500" />
                  </button>
                </div>
              </div>
              );
            })}
            {/* Intersection observer trigger for eager loading */}
            <div ref={endOfListRef} className="col-span-full" />
          </div>
          {isLoadingMore && (
            <div className="flex justify-center mt-6">
              <p className="text-gray-400">Loading more posts...</p>
            </div>
          )}
        )}
      </div>

      {editPost && (
        <NewPostModal
          post={editPost}
          onClose={() => setEditPost(null)}
          onSaved={handleSaved}
        />
      )}
    </ProtectedRoute>
  );
}
