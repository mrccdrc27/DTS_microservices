// styles
import styles from './ticket-detail.module.css'
import general from "../../../tables/styles/general-table-styles.module.css";

// react
import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

// axios
import axios from 'axios';

// comp
import AgentNav from '../../../components/navigations/agent-nav/AgentNav';
import TicketAction from '../../../components/modals/ticket-action/TicketAction';

// api
const ticketURL = import.meta.env.VITE_TICKET_API;

export default function TicketDetail() {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(location.state?.ticket || null);

  // open ticket action modal
  const [openTicketAction, setOpenTicketAction] = useState(false);

  useEffect(() => {
    if (!ticket) {
      axios.get(`${ticketURL}/${id}`)
        .then((res) => {
          setTicket(res.data);
        })
        .catch((err) => {
          console.error('Failed to fetch ticket:', err);
        });
    }
  }, [id, ticket]);

  if (!ticket) {
    return <div>Loading ticket data for ID: {id}...</div>;
  }
  
  return(
    <>
    <AgentNav />
    <main className={styles.ticketDetailPage}>
      {/* Modal */}
      {openTicketAction && <div className="ticket-action-section">
        <TicketAction 
          closeTicketAction={setOpenTicketAction}
          ticket={ticket}
          />
        </div> } 
      <div className={styles.topTicketDetail}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>Back</button>
      </div>
      <div className={styles.botTicketDetail}>
        <div className={styles.leftTicketDetails}>
          <div className={styles.tdTitleCont}>
            <h3 className={styles.tdTitle}>Ticket No.{ticket.ticket_id}</h3>
            <p className={styles.tdSubject}><strong>Subject:</strong> {ticket.subject}</p>
            <div className={styles.tdMeta}>
              <p>Started: {ticket.opened_on}</p>
              <p>Expected Resolution: </p>
            </div>
          </div>

          <div className={styles.tdDescription}>
            <h3>Description</h3>
            <p>{ticket.description}</p>
          </div>

          <div className={styles.tdAttachment}>
            <h3>Attachment</h3>
            <p>pdf</p>
          </div>

          <div className={styles.tdComment}>
            <div className={styles.tdCommenterAvatar}></div>
            <input type="text" className={styles.commentInput} placeholder="Add a comment..." />
          </div>

          <div className={styles.tdCommentSection}>
            <div className={styles.commenterAvatar}></div>
            <div className={styles.commentContent}>
              <div className={styles.commentHeader}>
                <div className={styles.commenterName}>John Smith</div>
                <div className={styles.commentDate}>mm-dd-yy</div>
              </div>
              <div className={styles.commentText}>
                Lorem ipsum dolor sit amet...
              </div>
              <div className={styles.commentActions}>
                <span className={styles.commentAction}>Reply</span>
                <span className={styles.commentAction}>Edit</span>
                <span className={styles.commentAction}>Delete</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightTicketDetails}>
          <button
            className={styles.actionButton}
            onClick={() => {
              setOpenTicketAction(true);
            }}
          >
            Make an Action
          </button>

          <div className={styles.tdStatusCard}>
            <div className={styles.tdStatusLabel}>Status:</div>
            <div className={general[`status-${ticket.status.replace(/\s+/g, '-').toLowerCase()}`]}>{ticket.status}</div>
          </div>

          <div className={styles.tdInfoItem}>
            <div className={styles.tdInfoLabelValue}>
              <div className={styles.tdInfoLabel}>Priority</div>
              <div className={styles.tdInfoValue}>{ticket.priority}</div>
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
            <div className={styles.tdActivityLogTitle}>Activity Log</div>
            <div className={styles.tdActivityLogContent}>
              <div className={styles.activityTitle}>April 1, 9:31 AM</div>
              <div className={styles.activityText}>Status to open</div>
              <div className={styles.activityText}>
                Lorem ipsum dolor sit amet...
              </div>
              <div className={styles.activityFooter}>By Sarah Johnson | admin</div>
            </div>
          </div>
        </div>
      </div>

    </main>
    </>
  );
}