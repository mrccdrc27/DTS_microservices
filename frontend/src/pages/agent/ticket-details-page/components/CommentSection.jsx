// react
import { useEffect, useState } from "react";
import axios from "axios";

// style
import styles from "./comment-section.module.css";

// api
const commentURL = import.meta.env.VITE_COMMENTS_API;

export default function CommentSection({ ticket }) {
  const [refreshComments, setRefreshComments] = useState(false);
  const [showComments, setShowComments] = useState(true);

  const handleCommentAdded = () => {
    setRefreshComments((prev) => !prev);
  };

  const toggleCommentsVisibility = () => {
    setShowComments((prev) => !prev);
  };

  return (
    <div className={styles.tdCommentSection}>
      <AddComment ticket={ticket} onCommentAdded={handleCommentAdded} />
      <div className={styles.tdCSHeader}>
        <h3>Comments</h3>
        <div className={styles.tdCSButton} onClick={toggleCommentsVisibility}>
          <i
            className={`fa-solid fa-caret-${showComments ? "down" : "up"}`}
          ></i>
        </div>
      </div>
      {showComments && (
        <CommentList ticket={ticket} refreshTrigger={refreshComments} />
      )}
    </div>
  );
}

export function AddComment({ ticket, onCommentAdded }) {
  // state variable for comments
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // add new comments
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await axios.post(commentURL, {
        task_id: ticket.id,
        ticket_id: ticket.id,
        user_id: ticket.id,
        message: newComment,
        created_at: new Date().toISOString(),
        parent_id: null,
      });
      alert("Comment added.");
      setNewComment("");
      onCommentAdded();
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.tdComment}>
      <div className={styles.commentWrapper}>
        <div className={styles.tdUserProfile}>
          <img
            src="https://i.pinimg.com/736x/e6/50/7f/e6507f42d79520263d8d952633cedcf2.jpg"
            alt="Profile"
          />
        </div>
        <div className={styles.tdCommentInput}>
          <textarea
            placeholder="Add a comment here..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </div>
      </div>
      <button
        className={styles.tdCommentBtn}
        onClick={handleAddComment}
        disabled={isSubmitting}
      >
        Add comment
      </button>
    </div>
  );
}

export function CommentList({ ticket, refreshTrigger }) {
  // === COMMENTS ===
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch comments
  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(commentURL);
      const filteredComments = res.data.filter(
        (comment) => comment.ticket_id === ticket.id
      );

      // Sort comments
      const sortedComments = filteredComments.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setComments(sortedComments);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setError("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetchComments when ticket.id changes
  useEffect(() => {
    if (ticket?.id) {
      fetchComments();
    }
  }, [ticket?.id, refreshTrigger]);

  // === REPLY ===
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");

  // reply comment
  const handleReply = async (parent_id) => {
    if (!replyMessage.trim()) return;

    const replyData = {
      task_id: ticket.id,
      ticket_id: ticket.id,
      user_id: ticket.id,
      message: replyMessage,
      created_at: new Date().toISOString(),
      parent_id: parent_id,
    };

    try {
      await axios.post(commentURL, replyData);
      await fetchComments();
      setReplyingTo(null);
      setReplyMessage("");
    } catch (error) {
      console.error("Failed to reply:", error.message);
    }
  };

  // === EDIT ===
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editMessage, setEditMessage] = useState("");

  // edit comment
  const handleEditComment = async (id) => {
    if (!editMessage.trim()) return;

    try {
      await axios.patch(`${commentURL}/${id}`, {
        message: editMessage,
      });
      await fetchComments();
      setEditingCommentId(null);
      setEditMessage("");
    } catch (error) {
      console.error("Failed to edit comment:", error.message);
    }
  };

  // === DELETE
  // delete comment
  const handleDeleteComment = async (id) => {
    const confirmDelete = confirm("Delete this comment?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${commentURL}/${id}`);
      await fetchComments();
    } catch (error) {
      console.error("Failed to delete comment:", error.message);
    }
  };

  if (loading) return <div>Loading comments...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.tdCSWrapper}>
      {comments.map((comment) => (
        <div className={styles.tdCSContainer}>
          <div key={comment.id} className={styles.tdCSLeft}>
            <img
              src={
                "https://i.pinimg.com/736x/e6/50/7f/e6507f42d79520263d8d952633cedcf2.jpg"
              }
              alt="profile"
            />
          </div>
          <div className={styles.tdCSRight}>
            <div className={styles.tdCSUserHeader}>
              <span className={styles.tdCSUserName}>
                <strong> User {comment.user_id}</strong>
              </span>
              <span className={styles.tdCSDate}>
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className={styles.tdCSContent}>
              <p>{comment.message}</p>
            </div>
            <div className={styles.tdCSActions}>
              <div className={styles.tdCommentAction}>
                <i className="fa-regular fa-thumbs-up"></i>
              </div>
              <span
                className={styles.tdCommentAction}
                onClick={() => {
                  setReplyingTo(comment.id);
                  setReplyMessage("");
                }}
              >
                Reply
              </span>
              <span
                className={styles.tdCommentAction}
                onClick={() => {
                  setEditingCommentId(comment.id);
                  setEditMessage(comment.message);
                }}
              >
                Edit
              </span>
              <span
                className={styles.tdCommentAction}
                onClick={() => handleDeleteComment(comment.id)}
              >
                Delete
              </span>
            </div>

            {/* Where it renders this shi */}
            <div className={styles.tdActionCont}>
              {replyingTo === comment.id && (
                <div className={styles.replyBox}>
                  <textarea
                    placeholder="Write a reply..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                  />
                  <button onClick={() => handleReply(comment.id)}>
                    Submit Reply
                  </button>
                </div>
              )}
              {editingCommentId === comment.id && (
                <div className={styles.editBox}>
                  <textarea
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                  />
                  <button onClick={() => handleEditComment(comment.id)}>
                    Save
                  </button>
                  <button onClick={() => setEditingCommentId(null)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
