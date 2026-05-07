"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaPencilAlt, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import { SERVER_URL } from "@/lib/config";
import { useAuth } from "@/app/auth/useAuth";

export default function CommentModal({ post, onClose, onCommentsCountChange }) {
  const { signed_in_user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingContent, setEditingContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const myComment = comments.find((c) => c.user_id === signed_in_user?.id);

  useEffect(() => {
    fetch(`${SERVER_URL}/api/comments/${post.id}`)
      .then((r) => r.json())
      .then((data) => setComments(data.comments || []))
      .catch(() => toast.error("Failed to load comments."))
      .finally(() => setLoading(false));
  }, [post.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${SERVER_URL}/api/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ post_id: post.id, content: newContent.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Failed to post comment."); return; }
      setComments((prev) => [...prev, data.comment]);
      onCommentsCountChange(post.id, data.commentsCount);
      setNewContent("");
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingContent.trim()) return;
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${SERVER_URL}/api/comment/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: editingContent.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Failed to update comment."); return; }
      setComments((prev) => prev.map((c) => (c.id === data.comment.id ? data.comment : c)));
      setIsEditing(false);
    } catch {
      toast.error("Something went wrong. Try again.");
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${SERVER_URL}/api/comment/${post.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Failed to delete comment."); return; }
      setComments((prev) => prev.filter((c) => c.user_id !== signed_in_user?.id));
      onCommentsCountChange(post.id, data.commentsCount);
    } catch {
      toast.error("Something went wrong. Try again.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg">{post.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-4">Loading...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No comments yet. Be the first!</p>
          ) : (
            comments.map((comment) => {
              const isOwn = comment.user_id === signed_in_user?.id;
              return (
                <div key={comment.id} className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${isOwn ? "bg-accent-dark text-white" : "bg-gray-100 text-gray-800"}`}>
                    {!isOwn && (
                      <p className="font-semibold text-xs mb-0.5 text-gray-500">
                        {comment.displayName || comment.username}
                      </p>
                    )}
                    {isOwn && isEditing ? (
                      <div className="flex flex-col gap-1">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="text-sm bg-white text-gray-800 rounded p-1 resize-none w-full focus:outline-none"
                          rows={2}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setIsEditing(false)} className="text-white/70 hover:text-white">
                            <FaTimes size={12} />
                          </button>
                          <button onClick={handleEdit} className="text-white hover:text-white/70">
                            <FaCheck size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p>{comment.content}</p>
                    )}
                  </div>
                  {isOwn && !isEditing && (
                    <div className="flex flex-col gap-1 justify-center">
                      <button onClick={() => { setEditingContent(comment.content); setIsEditing(true); }} className="text-gray-400 hover:text-gray-600">
                        <FaPencilAlt size={11} />
                      </button>
                      <button onClick={handleDelete} className="text-gray-400 hover:text-red-500">
                        <FaTrash size={11} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Input area */}
        <div className="p-4 border-t">
          {!signed_in_user ? (
            <p className="text-gray-400 text-sm text-center">Sign in to leave a comment.</p>
          ) : myComment ? (
            <p className="text-gray-400 text-sm text-center">You&apos;ve already commented on this post.</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={submitting || !newContent.trim()}
                className="bg-accent-dark text-white rounded-full px-4 py-1.5 text-sm font-semibold disabled:opacity-50 hover:bg-accent transition-colors"
              >
                Post
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
