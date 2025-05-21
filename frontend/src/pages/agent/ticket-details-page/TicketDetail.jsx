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

  // If ticket is passed via Link's state, use it directly
  useEffect(() => {
    if (location.state?.ticket) {
      setTicket(location.state.ticket);
    }
    fetchTicket();
  }, [id]);

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

            {/* <div className={styles.tdComment}>
              <div className={styles.tdUserProfile}>
                <img
                  src="https://i.pinimg.com/736x/e6/50/7f/e6507f42d79520263d8d952633cedcf2.jpg"
                  alt="Profile"
                />
              </div>
              <input
                type="text"
                className={styles.tdCommentInput}
                placeholder="Add comment here..."
              />
            </div> */}

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
              {hideCommentSection &&
              ticket.comments &&
              ticket.comments.length > 0
                ? [...ticket.comments]
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
                            <span className={styles.tdCommentAction}>
                              Reply
                            </span>
                            <span className={styles.tdCommentAction}>Edit</span>
                            <span className={styles.tdCommentAction}>
                              Delete
                            </span>
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
