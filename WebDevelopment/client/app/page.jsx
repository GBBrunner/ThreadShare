"use client";

import { useEffect, useState, useRef } from "react";
import LoadingScreen from "@/app/components/LoadingScreen";
import { SERVER_URL } from "@/lib/config";
import { constrainAspectRatio } from "@/lib/imageUtils";
import { FaHeart, FaComment } from "react-icons/fa";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [aspectRatios, setAspectRatios] = useState({});
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [eagerLoadTriggered, setEagerLoadTriggered] = useState(false);
  const [filters, setFilters] = useState({
    category: null,
    condition: null,
    occasions: [],
  });
  const endOfListRef = useRef(null);

  useEffect(() => {
    fetchPosts(0);
  }, [filters]);

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

      // Add filter params if set
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
    <main className="min-h-screen bg-white">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Discover</h1>
        </div>

        {loading ? (
          <LoadingScreen />
        ) : posts.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No posts available.</p>
        ) : (
          <>
            <div className="columns-2 md:columns-3 gap-4">
              {posts.map((post) => {
                const imageUrl = post.images?.[0];
                const aspectRatio = imageUrl ? aspectRatios[imageUrl] : null;
                return (
                  <div
                    key={post.id}
                    className="relative group rounded-lg overflow-hidden shadow border-2 border-secondary bg-white mb-6 break-inside-avoid pb-4 cursor-pointer hover:shadow-lg transition-shadow"
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
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                        No image
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-secondary-light">
                      <p className="font-medium text-sm truncate text-gray-800">{post.title}</p>
                      {post.brand && (
                        <p className="text-xs text-gray-600 truncate">{post.brand}</p>
                      )}
                    </div>

                    {/* Engagement badges on hover */}
                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1 bg-white rounded-full px-2 py-1 text-xs shadow">
                        <FaHeart size={12} className="text-red-500" /> 0
                      </div>
                      <div className="flex items-center gap-1 bg-white rounded-full px-2 py-1 text-xs shadow">
                        <FaComment size={12} className="text-blue-500" /> 0
                      </div>
                    </div>
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
    </main>
  );
}
