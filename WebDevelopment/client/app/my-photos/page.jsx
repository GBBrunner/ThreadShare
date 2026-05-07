"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/auth/useAuth";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import NewPostModal from "@/app/components/NewPostModal";
import { FaTrash, FaPencilAlt } from "react-icons/fa";
import { SERVER_URL } from "@/lib/config";

export default function MyPhotosPage() {
  const { signed_in_user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPost, setEditPost] = useState(null);

  useEffect(() => {
    if (!signed_in_user) return;
    fetchPosts();
  }, [signed_in_user]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${SERVER_URL}/api/my_posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
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

  return (
    <ProtectedRoute isLoggedIn={!!signed_in_user}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">My Photos</h1>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-500">No posts yet. Create one with the New Post button!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {posts.map((post) => (
              <div key={post.id} className="relative group rounded-lg overflow-hidden shadow border bg-white">
                {post.images?.[0] ? (
                  <img
                    src={post.images[0]}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    No image
                  </div>
                )}
                <div className="p-2">
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
            ))}
          </div>
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
