import AgentNav from "../../../components/navigations/agent-nav/AgentNav"

import ArchiveTicketTable from "../../../tables/agent/ArchiveTicketTable"

// style
import styles from './agent-archive.module.css'

export default function AgentArchive() {
  return(
    <>
    <AgentNav />
    <main className={styles.archiveTicketPage}>
      <section className={styles.archiveTicketTop}>
          <div className={styles.archiveTicketTitle}>
            <h3>Archived Tickets</h3>
          </div>  
      </section>

      <section className={styles.archiveTicketPageBot}>
        <ArchiveTicketTable />
      </section>
    </main>
    </>
  )
}