import styles from './notif-modal.module.css';

export default function NotifModal() {
  return (
    <main className={styles.notifModalPage}>
      <section className={styles.notifModalHeader}>
        <div className={styles.nmTitle}>
          <h3>Notifications</h3>
        </div>
      </section>
      <section className={styles.notifModalBody}>
        <div className={styles.nmItem}>
          <img className={styles.nmImage} src="https://api.dicebear.com/7.x/lorelei/svg?seed=Sasuke" alt="Anime Avatar" />
          <div className={styles.nmNotifInfo}>
            <span>JohnathanMaximillianTheThirdWhoReallyLovesTickets</span>
            <span>
              A new ticket has been created with an unusually long description that might cause overflow or require wrapping — please verify the handling of this kind of edge case in the UI.
            </span>
            <span>Just now</span>
          </div>
        </div>

        <div className={styles.nmItem}>
          <img className={styles.nmImage} src="https://i.pinimg.com/736x/c6/5a/bc/c65abc09dde1a7dbb78df5845744a932.jpg" alt="Anime Avatar 2" />
          <div className={styles.nmNotifInfo}>
            <span>Anna</span>
            <span>
              Ticket updated. The issue with the backend service you submitted yesterday has been escalated to Tier 2 support and will be reviewed shortly by the assigned team lead.
            </span>
            <span>15 mins ago</span>
          </div>
        </div>

        <div className={styles.nmItem}>
          <img className={styles.nmImage} src="https://i.mydramalist.com/jQjnXO_5c.jpg" alt="User" />
          <div className={styles.nmNotifInfo}>
            <span>Mike "The Debugger" Johnson</span>
            <span>
              Commented: "This bug might be related to the asynchronous data flow issue. I'll investigate it deeper after the deployment window closes tomorrow."
            </span>
            <span>30 mins ago</span>
          </div>
        </div>

        <div className={styles.nmItem}>
          <img className={styles.nmImage} src="https://i.pinimg.com/736x/64/00/dd/6400dd0e35e6f3919fe01c0254aea9a0.jpg" alt="User" />
          <div className={styles.nmNotifInfo}>
            <span>Samantha</span>
            <span>
              Reminder: Your support ticket SLA is about to expire in 30 minutes. Please update or escalate accordingly.
            </span>
            <span>1 hr ago</span>
          </div>
        </div>

        <div className={styles.nmItem}>
          <img className={styles.nmImage} src="https://randomuser.me/api/portraits/men/21.jpg" alt="User" />
          <div className={styles.nmNotifInfo}>
            <span>Chris P. Bacon</span>
            <span>
              A new comment was added: "🤯 This issue just blew my mind. Let's regroup tomorrow to see if it's an API versioning conflict."
            </span>
            <span>2 hrs ago</span>
          </div>
        </div>

        <div className={styles.nmItem}>
          <img className={styles.nmImage} src="https://randomuser.me/api/portraits/women/30.jpg" alt="User" />
          <div className={styles.nmNotifInfo}>
            <span>EmilyTheAnalystWithAVeryLongTitleIndeed</span>
            <span>
              Your data export request is complete. Please download the .csv from the dashboard within the next 24 hours to avoid it being purged by the system.
            </span>
            <span>4 hrs ago</span>
          </div>
        </div>
      </section>
    </main>
  );
}
