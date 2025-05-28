
// style
import styles from "./ticket-detail.module.css";
import general from "../../../tables/styles/general-table-styles.module.css";

// react
import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";

// axios
import axios from "axios";

// comp
import AgentNav from "../../../components/navigations/agent-nav/AgentNav";
import TicketAction from "../../../components/modals/ticket-action/TicketAction";

// api
const ticketURL = import.meta.env.VITE_TICKET_API;

export default function TicketDetail() {
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openTicketAction, setOpenTicketAction] = useState(false);
  const [hideCommentSection, setHideCommentSection] = useState(false); // start as visible
  const [hideActivityLog, setHideActivityLog] = useState(true); // start as visible
  const [error, setError] = useState(null);

  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.ticket) {
      setTicket(location.state.ticket);
    } else {
      fetchTicket();
    }
  }, [id]);

  useEffect(() => {
    if (ticket?.status) {
      setStatus(ticket.status.toLowerCase());
    }
  }, [ticket]);

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

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const updatedComments = [
      ...(ticket.comments || []),
      {
        id: Date.now(),
        user_id: 1, // change as needed
        message: newComment.trim(),
        created_at: new Date().toISOString(),
      },
    ];

    setIsSubmitting(true);
    try {
      await axios.patch(`${ticketURL}/${ticket.id}`, { comments: updatedComments });
      setNewComment('');
      await fetchTicket();
      setOpenTicketAction(false);
    } catch (error) {
      console.error("Failed to add comment:", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!ticket) return <div>Loading ticket data for ID: {id}...</div>;

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
            />
          </div>
        )}

        {/* Header */}
        <section className={styles.tdTopSection}>
          <div className={styles.tdBack} onClick={() => navigate(-1)}>
            <i className="fa fa-chevron-left"></i>
          </div>
          <div className={styles.tdLabel}>
            <p>Ticket Details</p>
          </div>
        </section>

        {/* Main Content */}
        <section className={styles.tdBotSection}>
          {/* Left Side */}
          <div className={styles.tdLeftSection}>
            {/* Header Info */}
            <div className={styles.tdHeader}>
              <h3 className={styles.tdTitle}>Ticket No. {ticket.ticket_id}</h3>
              <p className={styles.tdSubject}><strong>Subject: </strong>{ticket.subject}</p>
              <div className={styles.tdMetaData}>
                <p>Opened On: {ticket.opened_on}</p>
                <p>Expected Resolution: </p>
              </div>
            </div>

            {/* Description */}
            <div className={styles.tdDescription}>
              <h3>Description</h3>
              <p>{ticket.description}</p>
            </div>

            {/* Attachment */}
            <div className={styles.tdAttachment}>
              <h3>Attachment</h3>
              <div className={styles.tdAttached}>
                <i className="fa fa-upload"></i>
                <span>No file attached</span>
              </div>
            </div>

            {/* Comment Input */}
            <div style={{ display: "flex", flexDirection: "row" }}>
              <textarea
                style={{ width: "100%", maxHeight: "200px", resize: "vertical" }}
                placeholder="Add a comment here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button onClick={handleAddComment} disabled={isSubmitting || !newComment.trim()}>
                Send comment
              </button>
            </div>

            {/* Comment Section */}
            <div className={styles.tdCommentSection}>
              <div className={styles.tdCSHeader}>
                <h3>Comment</h3>
                <p
                  className={styles.tdCSButton}
                  onClick={() => setHideCommentSection(!hideCommentSection)}
                >
                  {hideCommentSection ? "Show" : "Hide"}
                </p>
              </div>
              {!hideCommentSection &&
                (ticket.comments?.length > 0 ? (
                  [...ticket.comments]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
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
                            <strong>User {comment.user_id}</strong>
                            <div>{new Date(comment.created_at).toLocaleString()}</div>
                          </div>
                          <p>{comment.message}</p>
                          <div className={styles.tdCommentActions}>
                            <span>Reply</span>
                            <span>Edit</span>
                            <span>Delete</span>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className={styles.noCommentMessage}>No comments available.</p>
                ))}
            </div>
          </div>

          {/* Right Side */}
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
                <div className={general[`priority-${ticket.priority.toLowerCase()}`]}>{ticket.priority}</div>
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
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
