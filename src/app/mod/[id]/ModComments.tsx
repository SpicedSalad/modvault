"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Buttons";
import { Trash2 } from "lucide-react";

function CommentItem({ 
  comment, 
  replies, 
  allComments,
  userId, 
  tweakId, 
  onNewReply,
  onDeleteComment,
  depth = 0 
}: { 
  comment: any; 
  replies: any[];
  allComments: any[];
  userId: string | null; 
  tweakId: string;
  onNewReply: (reply: any) => void;
  onDeleteComment: (commentId: string) => void;
  depth?: number;
}) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClient();

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert("Please login to reply.");
      return;
    }
    if (!replyText.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({ 
          tweak_id: tweakId, 
          user_id: userId, 
          content: replyText, 
          parent_id: comment.id 
        })
        .select("*, profiles(username, avatar_url)")
        .single();

      if (error) throw error;
      if (data) {
        onNewReply(data);
        setReplyText("");
        setShowReplyBox(false);
      }
    } catch (err: any) {
      alert("Error posting reply: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!userId || userId !== comment.user_id) {
      alert("You can only delete your own comments.");
      return;
    }

    if (!confirm("Delete this comment and all replies?")) return;

    setIsDeleting(true);
    try {
      // Supabase RLS and cascade delete will handle removing nested replies
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", comment.id);

      if (error) throw error;
      onDeleteComment(comment.id);
    } catch (err: any) {
      alert("Error deleting comment: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Get nested replies for this comment
  const childReplies = allComments.filter(c => c.parent_id === comment.id);

  return (
    <div className={depth > 0 ? "ml-8 pl-4 border-l-2 border-white/10" : ""}>
      <div className="flex gap-4 p-4 glass-card hover:shadow-[0_4px_24px_rgba(255,255,255,0.05)] transition-all">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={comment.profiles?.avatar_url || "https://mc-heads.net/avatar/Steve/48"} 
          alt="user" 
          className={`${depth > 0 ? 'w-8 h-8' : 'w-12 h-12'} border border-white/10 shadow-sm bg-black/40 backdrop-blur-md pixelated flex-shrink-0`} 
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-baseline gap-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200 drop-shadow-[0_0_15px_rgba(255,170,0,0.3)] font-pixel text-sm py-1 leading-normal">
                {comment.profiles?.username || 'Unknown'}
              </span>
              <span className="text-gray-500 font-sans text-xs">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            {userId === comment.user_id && (
              <button
                onClick={handleDeleteComment}
                disabled={isDeleting}
                className="p-1 text-red-500/60 hover:text-red-500 transition-colors disabled:opacity-50"
                title="Delete comment"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <p className="text-gray-300 font-sans whitespace-pre-wrap text-sm leading-relaxed">
            {comment.content}
          </p>
          
          {/* Reply toggle button */}
          {userId && depth < 2 && (
            <button 
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="mt-2 text-xs font-sans text-gray-500 hover:text-gold transition-colors duration-200"
            >
              {showReplyBox ? "Cancel" : "↳ Reply"}
            </button>
          )}

          {/* Inline reply box */}
          {showReplyBox && (
            <form onSubmit={handleReply} className="mt-3 flex flex-col gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.profiles?.username || 'Unknown'}...`}
                rows={2}
                className="w-full px-3 py-2 border border-white/10 bg-black/40 text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold focus:shadow-[0_0_12px_rgba(255,170,0,0.4)] backdrop-blur-md rounded-md transition-all duration-300 font-sans text-sm resize-none"
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={loading || !replyText.trim()} 
                  className="py-1 px-4 text-xs relative overflow-hidden group shadow-[0_0_15px_rgba(63,186,84,0.2)] hover:shadow-[0_0_20px_rgba(63,186,84,0.5)]"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay pointer-events-none"></div>
                  {loading ? "..." : "REPLY"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Render nested replies */}
      {childReplies.length > 0 && (
        <div className="mt-2 space-y-2">
          {childReplies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              replies={[]}
              allComments={allComments}
              userId={userId}
              tweakId={tweakId}
              onNewReply={onNewReply}
              onDeleteComment={onDeleteComment}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ModComments({ 
  tweakId, 
  initialComments,
  userId
}: {
  tweakId: string;
  initialComments: any[];
  userId: string | null;
}) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert("Please login to comment.");
      return;
    }
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({ tweak_id: tweakId, user_id: userId, content: newComment })
        .select("*, profiles(username, avatar_url)")
        .single();
      
      if (error) throw error;
      if (data) {
        setComments([data, ...comments]);
        setNewComment("");
      }
    } catch (err: any) {
      alert("Error posting comment: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewReply = (reply: any) => {
    setComments(prev => [...prev, reply]);
  };

  const handleDeleteComment = (commentId: string) => {
    // Remove the deleted comment and all its nested replies
    setComments(prev => prev.filter(c => c.id !== commentId && c.parent_id !== commentId));
  };

  // Top-level comments only (no parent_id)
  const topLevelComments = comments.filter(c => !c.parent_id);

  return (
    <div className="space-y-6">
      <form onSubmit={handlePost} className="flex gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://mc-heads.net/avatar/Steve/48" alt="You" className="w-12 h-12 border-pixel border-[#1a1a1a] hidden sm:block pixelated" />
        <div className="flex-1 flex flex-col items-end gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={userId ? "Add a comment..." : "Login to comment"}
            disabled={!userId || loading}
            rows={3}
            className="w-full px-4 py-3 border border-white/10 bg-black/40 text-white placeholder-gray-500 focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass focus:shadow-[0_0_15px_rgba(63,186,84,0.6)] backdrop-blur-md rounded-md transition-all duration-300 font-sans resize-none"
          />
          <Button type="submit" disabled={!userId || loading || !newComment.trim()} className="py-2 px-6 relative overflow-hidden group shadow-[0_0_20px_rgba(63,186,84,0.3)] hover:shadow-[0_0_30px_rgba(63,186,84,0.6)]">
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay pointer-events-none"></div>
            POST
          </Button>
        </div>
      </form>

      <div className="space-y-4 pt-4 border-t border-gray-700">
        {topLevelComments.length === 0 ? (
          <p className="text-gray-400 font-sans italic text-center py-4">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          topLevelComments.map(c => (
            <CommentItem
              key={c.id}
              comment={c}
              replies={comments.filter(r => r.parent_id === c.id)}
              allComments={comments}
              userId={userId}
              tweakId={tweakId}
              onNewReply={handleNewReply}
              onDeleteComment={handleDeleteComment}
            />
          ))
        )}
      </div>
    </div>
  );
}
