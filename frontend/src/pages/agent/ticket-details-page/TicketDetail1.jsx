// react
import { useEffect, useState, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";

// styles
import styles from "./ticket-detail.module.css";
import general from "../../../tables/styles/general-table-styles.module.css";

// components
import AgentNav from "../../../components/navigations/agent-nav/AgentNav";
import TicketAction from "../../../components/modals/ticket-action/TicketAction";

// api
const ticketURL = import.meta.env.VITE_TICKET_API;

export default function TicketDetail() {
  return (
    <>
      <AgentNav />
      <main className={styles.ticketDetailPage}>
        <section className={styles.tdTopSection}>
          <div className={styles.tdBack} onClick={() => navigate(-1)}>
            <i className="fa fa-chevron-left"></i>
          </div>
          <div className={styles.tdLabel}>
            <p>Ticket Details</p>
          </div>
        </section>
        <section className={styles.tdBotSection}>
          <div className={styles.tdLeftSection}></div>
          <div className={styles.tdRightSection}></div>
        </section>
      </main>
    </>
  );
}
