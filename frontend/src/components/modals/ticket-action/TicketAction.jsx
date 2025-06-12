import { useEffect, useState } from "react";
import styles from "./ticket-action.module.css";
import axios from "axios";

// component
import ConfirmAction from "../confirm-action/ConfirmAction";

const ticketURL = import.meta.env.VITE_TICKET_API;
const activityLogURL = import.meta.env.VITE_ACTIVITY_LOG_API;

export default function TicketAction({
  ticket,
  closeTicketAction,
  refreshTicket,
  refreshLogs,
}) {
  // open ticket action modal
  const [openConfirmAction, setOpenConfirmAction] = useState(false);

  const [status, setStatus] = useState("");

  //
  const handleConfirm = () => {
    handleUpdateStatus();
  };

    //
  const handleCancel = () => {
    setOpenConfirmAction(false);
  };

  // update status
  const handleUpdateStatus = async () => {
    const timestamp = new Date().toISOString();

    const newActivity = {
      task_id: ticket.id,
      ticket_id: ticket.id,
      user_id: ticket.id,
      content: `Status changed to "${status}" on ${timestamp}`,
      created_at: new Date().toISOString(),
    };

    try {
      await axios.patch(`${ticketURL}/${ticket.id}`, {
        status,
      });

      await axios.post(activityLogURL, newActivity);
      await refreshTicket();
      closeTicketAction(false);
      window.location.reload();
    } catch (error) {
      console.error(
        "Error updating status or logging activity:",
        error.message
      );
    }
  };

  useEffect(() => {
    if (ticket?.status) {
      setStatus(ticket.status);
    }
  }, [ticket]);

  return (
    <main className={styles.ticketActionWrapper}>
      {openConfirmAction && (
        <ConfirmAction
          message="Are you sure you want to push these changes?"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
      <div className={styles.ticketActionOverlay}></div>
      <div className={styles.ticketActionPage}>
        <button onClick={() => closeTicketAction(false)}>X</button>

        <section className={styles.ticketActionHeader}>
          <div className={styles.ticketActionTitle}>
            <h1>Ticket No. {ticket?.ticket_id}</h1>
            {/* <button onClick={handleUpdateStatus}>PUSH</button> */}
            <button
              className={styles.actionButton}
              onClick={() => {
                setOpenConfirmAction(true);
              }}
            >
              PUSH
            </button>
          </div>

          <div className={styles.ticketActionSubject}>
            <h1>Subject: {ticket.subject}</h1>
          </div>

          <div className={styles.ticketActionMeta}>
            <span>Opened on: {ticket.opened_on}</span>
            <span>Expected Resolution: {/* add if needed */}</span>
          </div>

          <div className={styles.ticketActionStatus}>
            <select
              name="ticket-action-status"
              className={styles.actionStatus}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="" disabled>
                Please select an option
              </option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="On Hold">On Hold</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>
        </section>

        <section className={styles.ticketActionContent}>
          <div className={styles.ticketActionDesciption}>
            <h3>Description</h3>
            <p>{ticket.description}</p>
          </div>

          <div className={styles.ticketActionInput}>
            <textarea placeholder="Add a comment here..." />
          </div>

          <div className={styles.ticketActionUpload}>
            <input type="file" />
          </div>
        </section>
      </div>
    </main>
  );
}
