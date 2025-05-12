import AgentNav from "../../../components/navigations/agent-nav/AgentNav"

import TicketTable from "../../../tables/agent/TicketTable"

import styles from './ticket.module.css'

export default function Ticket() {
  return(
    <>
    <AgentNav />
    <main className={styles.ticketPage}>
      <section className={styles.ticketPageTop}>
        <div className={styles.ticketPageTitle}>
          <h3>Tickets</h3>
        </div>
      </section>
      <section className={styles.ticketPageBot}>
        <TicketTable />
      </section>
    </main>
    </>
  )
}