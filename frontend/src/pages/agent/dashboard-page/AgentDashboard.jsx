import AgentNav from "../../../components/navigations/agent-nav/AgentNav"
import CardStatus from "./components/CardStatus"
import RecentUpdates  from "./components/RecentUpdates"

import styles from './agent-dashboard.module.css'
import UpcomingTicketTable from "../../../tables/agent/UpcomingTicketTable"

export default function AgentDashboard() {
  return(
    <>
    <AgentNav />
    <main className={styles.dashboardPage}>
      <section className={styles.dashboardTopSection}>
        <div className={styles.dbHeroSection}>
          <p>Welcome, Username!</p>
        </div>
      </section> {/* top */}

      <section className={styles.dashboardBotSection}>
        <div className={styles.dbLeftSection}>
          <div className={styles.dbCardSection}>
            <h3>Dashboard</h3>
            <div className={styles.statusCont}>
              <CardStatus number="15" label="Open"/>
              <CardStatus number="14" label="On Hold"/>
              <CardStatus number="13" label="Approved"/>
              <CardStatus number="12" label="Rejected"/>
            </div>
          </div>
          <div className={styles.dbUpcomingTicketSection}>
           <h3>Upcoming Tickets</h3>
           <div className={styles.updateCont}>
              <UpcomingTicketTable />
           </div>
          </div>
        </div> {/* left */}
        <div className={styles.dbRightSection}>
          <div className={styles.dbTicketSection}>
            <h3>Recent Updates</h3>
            <RecentUpdates />
            <RecentUpdates />
            <RecentUpdates />
            <RecentUpdates />
            <RecentUpdates />
          </div>
        </div> {/* right */}
      </section> {/* bot */}
    </main>
    </>

  )
}