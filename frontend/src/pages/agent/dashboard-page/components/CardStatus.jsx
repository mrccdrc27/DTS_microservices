import styles from './card-status.module.css'

export default function CardStatus(props) {

  const statusClassMap = {
    'Open': styles.open,
    'On Hold': styles.onHold,
    'Approved': styles.approved,
    'Rejected': styles.rejected,
  };

  return(
    <div className={styles.statCard}>
      <div className={styles.statNumber}>{props.number}</div>
      <div className={`${styles.underline} ${statusClassMap[props.label] || ''}`}></div>
      <div className={styles.label}>{props.label}</div>
    </div>
  );
}

export function CardPriority(props) {

  const priorityClassMap = {
    'Open Tickets': styles.openTickets,
    'Critical': styles.critical,
    'High': styles.high,
    'Medium': styles.medium,
    'Low': styles.low,
  }

  return(
    <div className={`${styles.prioCard} ${priorityClassMap[props.label] || ''}`}>
      <div className={styles.prioNumber}>{props.number}</div>
      <div className={styles.label}>{props.label}</div>
    </div>
  );
}