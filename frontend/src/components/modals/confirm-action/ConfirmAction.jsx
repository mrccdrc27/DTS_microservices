import styles from "./confirm-action.module.css";

export default function ConfirmAction({ message, onConfirm, onCancel }) {
  return (
    <div className={styles.confirmModal}>
      <div className={styles.confirmModalContent}>
        <div className={styles.confirmModalMessage}>
          <p>{message}</p>
        </div>
        <div className={styles.confirmModalActions}>
          <button className={styles.cancel} onClick={onCancel}>Cancel</button>
          <button className={styles.confirm} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
