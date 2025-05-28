// style
import styles from "./ticket-detail.module.css";
import general from "../../../tables/styles/general-table-styles.module.css";

// react
import { useEffect, useState, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";

// axios
import axios from "axios";

// comp
import AgentNav from "../../../components/navigations/agent-nav/AgentNav";
import TicketAction from "../../../components/modals/ticket-action/TicketAction";

// api
const ticketURL = import.meta.env.VITE_TICKET_API;
const commentURL = import.meta.env.VITE_COMMENTS_API;
const activityLogURL = import.meta.env.VITE_ACTIVITY_LOG_API;

export default function TicketDetail() {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  // const [ticket, setTicket] = useState(location.state?.ticket || null);
  const [ticket, setTicket] = useState(null);

  // open ticket action modal
  const [openTicketAction, setOpenTicketAction] = useState(false);

  // comment section
  const [hideCommentSection, setHideCommentSection] = useState(true);

  // activity log
  const [hideActivityLog, setHideActivityLog] = useState(true);

  // fetch activity log
  const [activityLog, setActivityLog] = useState([]);

  // add comment
  const [comments, setComments] = useState([]);

  // add new comment
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // reply comment
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");

  // edit comment
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editMessage, setEditMessage] = useState("");

  // fetch logs
  const fetchActivityLogs = useCallback(async () => {
    try {
      const res = await axios.get(activityLogURL);
      setActivityLog(res.data);
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
    }
  }, []);

  // fetch comments
  const fetchComments = useCallback(async () => {
    try {
      const res = await axios.get(commentURL);
      setComments(res.data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  }, []);

  // add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const commentData = {
      task_id: ticket.id,
      ticket_id: ticket.id,
      user_id: ticket.id,
      message: newComment,
      created_at: new Date().toISOString(),
      parent_id: null,
    };

    setIsSubmitting(true);

    try {
      await axios.post(`${commentURL}`, commentData);
      alert("Comment added.");
      setNewComment("");
      await fetchComments();
    } catch (error) {
      console.error("Failed to add comment:", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // If ticket is passed via Link's state, use it directly
  useEffect(() => {
    if (location.state?.ticket) {
      setTicket(location.state.ticket);
    }
    fetchTicket();
  }, [id]);

  useEffect(() => {
    if (ticket?.id) {
      fetchComments();
    }
  }, [ticket?.id, fetchComments]);

  useEffect(() => {
    if (ticket) {
      fetchActivityLogs();
    }
  }, [ticket, fetchActivityLogs]);

  const fetchTicket = async () => {
    try {
      const res = await axios.get(`${ticketURL}/${id}`);
      setTicket(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch ticket:", err);
      setError("Ticket not found.");
    }
  };

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (!ticket) {
    return <div>Loading ticket data for ID: {id}...</div>;
  }

  return (
    <>
      <AgentNav />
      <main className={styles.ticketDetailPage}>
        {openTicketAction && (
          <div className="ticket-action-section">
            <TicketAction
              closeTicketAction={setOpenTicketAction}
              ticket={ticket}
              refreshTicket={fetchTicket}
              refreshLogs={fetchActivityLogs}
            />
          </div>
        )}
        <section className={styles.tdTopSection}>
          <div className={styles.tdBack} onClick={() => navigate(-1)}>
            <i className="fa fa-chevron-left"></i>
          </div>
          <div className={styles.tdLabel}>
            <p>Ticket Details</p>
          </div>
        </section>

        <section className={styles.tdBotSection}>
          <div className={styles.tdLeftSection}>
            <div className={styles.tdHeader}>
              <h3 className={styles.tdTitle}>Ticket No.{ticket.ticket_id}</h3>
              <p className={styles.tdSubject}>
                <strong>Subject: </strong>
                {ticket.subject}
              </p>
              <div className={styles.tdMetaData}>
                <p className={styles.tdDateOpened}>
                  Opened On: {ticket.opened_on}
                </p>
                <p className={styles.tdDateResolution}>Expected Resolution: </p>
              </div>
            </div>

            <div className={styles.tdDescription}>
              <h3>Description</h3>
              <p>{ticket.description}</p>
            </div>

            <div className={styles.tdAttachment}>
              <h3>Attachment</h3>
              <div className={styles.tdAttached}>
                <i className="fa fa-upload"></i>
                <span className={styles.placeholderText}>No file attached</span>
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf, .jpg, .jpeg, .docx"
                  style={{ display: "none" }}
                />
              </div>
            </div>

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

            <div className={styles.tdCommentSection}>
              <div className={styles.tdCSHeader}>
                <h3>Comment</h3>
                {hideCommentSection ? (
                  <p
                    className={styles.tdCSButton}
                    onClick={() => setHideCommentSection(false)}
                  >
                    Hide
                  </p>
                ) : (
                  <p
                    className={styles.tdCSButton}
                    onClick={() => setHideCommentSection(true)}
                  >
                    Show
                  </p>
                )}
              </div>
              {hideCommentSection && comments && comments.length > 0
                ? [...comments]
                    .sort(
                      (a, b) => new Date(b.created_at) - new Date(a.created_at)
                    )
                    .map((comment) => (
                      <div key={comment.id} className={styles.tdCommentItem}>
                        <div className={styles.tdUserProfile}>
                          <img
                            src="https://i.pinimg.com/736x/e6/50/7f/e6507f42d79520263d8d952633cedcf2.jpg"
                            alt="Profile"
                          />
                        </div>
                        <div className={styles.tdCommentContent}>
                          <div className={styles.tdCommentHeader}>
                            <div className={styles.tdUserName}>
                              <strong>User {comment.user_id}</strong>
                            </div>
                            <div className={styles.tdCommentDate}>
                              {new Date(comment.created_at).toLocaleString()}
                            </div>
                          </div>
                          <div className={styles.tdCommentContent}>
                            <p>{comment.message}</p>
                          </div>
                          <div className={styles.tdCommentActions}>
                            <div className={styles.tdCommentAction}>
                              <i className="fa-regular fa-thumbs-up"></i>
                            </div>
                            {/* <span className={styles.tdCommentAction}>Reply</span> */}
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
                          <div className={styles.tdActionCont}>
                            {replyingTo === comment.id && (
                              <div className={styles.replyBox}>
                                <textarea
                                  placeholder="Write a reply..."
                                  value={replyMessage}
                                  onChange={(e) =>
                                    setReplyMessage(e.target.value)
                                  }
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
                                  onChange={(e) =>
                                    setEditMessage(e.target.value)
                                  }
                                />
                                <button
                                  onClick={() => handleEditComment(comment.id)}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingCommentId(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                : hideCommentSection && (
                    <p className={styles.noCommentMessage}>
                      No comments available.
                    </p>
                  )}
            </div>
          </div>

          <div className={styles.tdRightSection}>
            <button
              className={styles.actionButton}
              onClick={() => {
                setOpenTicketAction(true);
              }}
            >
              Make an Action
            </button>
            <div className={styles.tdStatusCard}>
              <div className={styles.tdStatusLabel}>Status</div>
              <div
                className={
                  general[
                    `status-${ticket.status.replace(/\s+/g, "-").toLowerCase()}`
                  ]
                }
              >
                {ticket.status}
              </div>
            </div>

            <div className={styles.tdProgressTrack}>
              <div className={styles.progressBar}></div>
              <div className={styles.progressStep}>
                <div className={styles.stepIcon}></div>
              </div>
              <div className={styles.progressStep}>
                <div className={styles.stepIcon}></div>
              </div>
              <div className={styles.progressStep}>
                <div className={styles.stepIcon}></div>
              </div>
              <div className={styles.progressStep}>
                <div className={styles.stepIcon}></div>
              </div>
            </div>

            <div className={styles.tdInfoItem}>
              <div className={styles.tdInfoLabelValue}>
                <div className={styles.tdInfoLabel}>Priority</div>
                <div
                  className={
                    general[`priority-${ticket.priority.toLowerCase()}`]
                  }
                >
                  {ticket.priority}
                </div>
              </div>
              <div className={styles.tdInfoLabelValue}>
                <div className={styles.tdInfoLabel}>Ticket Owner</div>
                <div className={styles.tdInfoValue}>{ticket.customer}</div>
              </div>
              <div className={styles.tdInfoLabelValue}>
                <div className={styles.tdInfoLabel}>Department</div>
                <div className={styles.tdInfoValue}>{ticket.department}</div>
              </div>
              <div className={styles.tdInfoLabelValue}>
                <div className={styles.tdInfoLabel}>Position</div>
                <div className={styles.tdInfoValue}>{ticket.position}</div>
              </div>
              <div className={styles.tdInfoLabelValue}>
                <div className={styles.tdInfoLabel}>SLA</div>
                <div className={styles.tdInfoValue}>{ticket.sla}</div>
              </div>
            </div>

            {/* <div className={styles.tdActivityLog}>
              <div className={styles.tdALHeader}>
                <div className={styles.tdActivityLogTitle}>Activity Log</div>
                {hideActivityLog ? (
                  <p
                    className={styles.tdCSButton}
                    onClick={() => setHideActivityLog(false)}
                  >
                    Hide
                  </p>
                ) : (
                  <p
                    className={styles.tdCSButton}
                    onClick={() => setHideActivityLog(true)}
                  >
                    Show
                  </p>
                )}
              </div>
              {hideActivityLog && (
                <div className={styles.tdALWrapper}>
                  <div className={styles.tdALProgressBar}></div>
                  {ticket.activity_log.map((entry, index) => (
                    <div key={index} className={styles.tdALRow}>
                      <div className={styles.tdALProgressStep}>
                        <div className={styles.tdALProgressIcon}></div>
                      </div>
                      <div className={styles.activityItem}>
                        <div className={styles.activityTitle}>
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                        <div className={styles.activityText}>{entry.title}</div>
                        <div className={styles.activityText}>
                          {entry.message}
                        </div>
                        <div className={styles.activityFooter}>
                          By {entry.author}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div> */}

            <div className={styles.tdActivityLog}>
              <div className={styles.tdALHeader}>
                <div className={styles.tdActivityLogTitle}>Activity Log</div>
                {hideActivityLog ? (
                  <p
                    className={styles.tdCSButton}
                    onClick={() => setHideActivityLog(false)}
                  >
                    Hide
                  </p>
                ) : (
                  <p
                    className={styles.tdCSButton}
                    onClick={() => setHideActivityLog(true)}
                  >
                    Show
                  </p>
                )}
              </div>
              {hideActivityLog && (
                <div className={styles.tdALWrapper}>
                  <div className={styles.tdALProgressBar}></div>
                  {activityLog
                    .filter(
                      (entry) => String(entry.ticket_id) === String(ticket.id)
                    )
                    .sort(
                      (a, b) => new Date(b.created_at) - new Date(a.created_at)
                    )
                    .map((entry) => (
                      <div key={entry.id} className={styles.tdALRow}>
                        <div className={styles.tdALProgressStep}>
                          <div className={styles.tdALProgressIcon}></div>
                        </div>
                        <div className={styles.activityItem}>
                          <div className={styles.activityTitle}>
                            {new Date(entry.created_at).toLocaleString()}
                          </div>
                          <div className={styles.activityText}>#{entry.id}</div>
                          <div className={styles.activityText}>
                            {entry.content}
                          </div>
                          <div className={styles.activityFooter}>
                            By user {entry.user_id}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
