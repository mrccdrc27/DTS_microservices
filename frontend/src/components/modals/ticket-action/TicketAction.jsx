import { useEffect, useState } from 'react';
import styles from "./ticket-action.module.css";
import axios from 'axios';

const ticketURL = import.meta.env.VITE_TICKET_API;

export default function TicketAction({ ticket, closeTicketAction }) {
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (ticket?.status) {
      setStatus(ticket.status.toLowerCase());
    }
  }, [ticket]);

  return (
    <main className={styles.ticketActionWrapper}>
      <div className={styles.ticketActionOverlay}></div>
      <div className={styles.ticketActionPage}>
        <button onClick={() => closeTicketAction(false)}>X</button>

        <section className={styles.ticketActionHeader}>
          <div className={styles.ticketActionTitle}>
            <h1>Ticket No. {ticket?.ticket_id}</h1>
            <button>PUSH</button>
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
            >
              <option value="" disabled>Please select an option</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>
        </section>

        <section className={styles.ticketActionContent}>
          <div className={styles.ticketActionDesciption}>
            <h3>Description</h3>
            <p>{ticket.description}</p>
          </div>

          <div className={styles.ticketActionInput}>
            <textarea
              placeholder="Add a comment here..."
            />
          </div>

          <div className={styles.ticketActionUpload}>
            <input type="file" />
          </div>
        </section>
      </div>
    </main>
  );
}
