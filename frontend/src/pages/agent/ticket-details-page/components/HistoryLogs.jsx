// styles
import styles from "./history-logs.module.css";

// react
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

// api
const activityLogURL = import.meta.env.VITE_ACTIVITY_LOG_API;

export default function HistoryLogs({ ticket }) {
  // hide activity log
  const [showActivityLog, setShowActivityLog] = useState(true);

  const toggleActivityLogVisibility = () => {
    setShowActivityLog((prev) => !prev);
  };

  // fetch activity log
  const [activityLog, setActivityLog] = useState([]);

  // fetch logs
  const fetchActivityLogs = useCallback(async () => {
    try {
      const res = await axios.get(activityLogURL);
      setActivityLog(res.data);
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
    }
  }, []);

  useEffect(() => {
    if (ticket) {
      fetchActivityLogs();
    }
  }, [ticket, fetchActivityLogs]);

  return (
    <div className={styles.tdActivityLog}>
      <div className={styles.tdALHeader}>
        <div className={styles.tdActivityLogTitle}>Activity Log</div>
        <div className={styles.tdCSButton} onClick={toggleActivityLogVisibility}>
          <i
            className={`fa-solid fa-caret-${showActivityLog ? "down" : "up"}`}
          ></i>
        </div>
      </div>
      {showActivityLog && (
        <div className={styles.tdALWrapper}>
          <div className={styles.tdALProgressBar}></div>
          {activityLog
            .filter((entry) => String(entry.ticket_id) === String(ticket.id))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map((entry) => (
              <div key={entry.id} className={styles.tdALRow}>
                <div className={styles.tdALProgressStep}>
                  <div className={styles.tdALProgressIcon}></div>
                </div>
                <div className={styles.activityItem}>
                  <div className={styles.activityTitle}>
                    {new Date(entry.created_at).toLocaleString()}
                  </div>
                  <div className={styles.activityText}>#{entry.id}</div>
                  <div className={styles.activityText}>{entry.content}</div>
                  <div className={styles.activityFooter}>
                    By user {entry.user_id}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
