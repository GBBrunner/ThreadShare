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
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Discover</h1>

        {/* Filters Section - Ready for future implementation */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Filters coming soon - category, condition, occasions
          </p>
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
                    className="relative group rounded-lg overflow-hidden shadow border-2 border-gray-200 bg-white mb-6 break-inside-avoid pb-4 cursor-pointer hover:shadow-lg transition-shadow"
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

                    {/* Hover overlay with details */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100 flex flex-col justify-between p-4">
                      <div></div>
                      <div className="text-white">
                        <p className="font-bold text-lg">{post.title}</p>
                        {post.brand && <p className="text-sm text-gray-200">{post.brand}</p>}
                      </div>
                    </div>

                    {/* Engagement badges */}
                    <div className="absolute bottom-0 right-0 p-2 flex gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1 bg-black/50 rounded-full px-2 py-1 text-xs">
                        <FaHeart size={12} /> 0
                      </div>
                      <div className="flex items-center gap-1 bg-black/50 rounded-full px-2 py-1 text-xs">
                        <FaComment size={12} /> 0
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
