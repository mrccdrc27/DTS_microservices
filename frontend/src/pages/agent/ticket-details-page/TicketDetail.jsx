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
import CommentSection from "./components/CommentSection";
import HistoryLogs from "./components/HistoryLogs";

// api
const ticketURL = import.meta.env.VITE_TICKET_API;
const commentURL = import.meta.env.VITE_COMMENTS_API;
const activityLogURL = import.meta.env.VITE_ACTIVITY_LOG_API;

export default function TicketDetail() {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const [ticket, setTicket] = useState(null);

  // open ticket action modal
  const [openTicketAction, setOpenTicketAction] = useState(false);

  // hide Ticket Information Panel
  const [showTicketInfo, setShowTicketInfo] = useState(true);

  const toggTicketInfosVisibility = () => {
    setShowTicketInfo((prev) => !prev);
  };

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
              // refreshLogs={fetchActivityLogs}
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
              <div className={styles.tdTitle}>
                <h3 className={styles.tdTitle}>Ticket No.{ticket.ticket_id}</h3>
              </div>
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

            <div className={styles.tdInstructions}>
              <h3>Instructions</h3>
              <p>Details</p>
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

            <CommentSection ticket={ticket} />
          </div>

          {/* BREAK */}

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

            <div className={styles.tdInfoWrapper}>
              <div className={styles.tdInfoHeader}>
                <h3>Details</h3>
                <div
                  className={styles.tdCSButton}
                  onClick={toggTicketInfosVisibility}
                >
                  <i
                    className={`fa-solid fa-caret-${
                      showTicketInfo ? "down" : "up"
                    }`}
                  ></i>
                </div>
              </div>
              {showTicketInfo && (
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
                    <div className={styles.tdInfoValue}>
                      {ticket.department}
                    </div>
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
              )}
            </div>

            <HistoryLogs ticket={ticket} />
          </div>
        </section>
      </main>
    </>
  );
}
