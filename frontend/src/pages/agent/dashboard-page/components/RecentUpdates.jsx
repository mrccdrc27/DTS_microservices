import styles from './recent-updates.module.css'

export default function RecentUpdates() {
  return(
    <div className={styles.recentUpdatesComp}>
      <div className={styles.recentUpdatesWrapper}>
        <div className={styles.recentUpdatesLeft}>
          <div className={styles.ruAvatar}></div>
        </div>
        <div className={styles.recentUpdatesRight}>
          <p className={styles.ruContentTicket}>TK-101-202</p>
          <p className={styles.ruDescription}>New comment added – 'User reported error on login page. Investigating further.'</p>
          <p className={styles.ruTime}>1hr ago</p>
        </div>
      </div>
    </div>
  )
}