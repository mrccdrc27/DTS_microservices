import styles from './upcoming-ticket-table.module.css'
import general from '../styles/general-table-styles.module.css'

import { useEffect, useState } from 'react';

function UpcomingTicketItem({ticket}) {
  return(
      <tr className={styles.ticketRow}>
        <td className={styles.barCell}>
          <div className={styles.tag}></div>
        </td>
        <td className={`${styles.ticketCell} ${styles.subject}`}>{ticket.subject}</td>
        <td className={styles.ticketCell}>{ticket.userName}</td>
        <td className={styles.ticketCell}>
          <div className={general[`priority-${ticket.priority.toLowerCase()}`]}>{ticket.priority}</div>
        </td>
        <td className={styles.ticketCell}>{ticket.date}</td>
      </tr>
  );
}

export default function UpcomingTicketTable() {

  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const mockData = [
      {
        id: 1,
        date: '2025-05-03',
        ticketNumber: 'TK-001',
        avatar: 'https://i.pravatar.cc/30?img=1',
        userName: 'Juan Dela Cruz',
        priority: 'High',
        subject: 'Unable to log in to my account',
      }, 
      {
        id: 2,
        date: '2025-05-03',
        ticketNumber: 'TK-002',
        avatar: 'https://i.pravatar.cc/30?img=1',
        userName: 'Jessa Dela Cruz',
        priority: 'Medium',
        subject: 'Incorrect total showing in invoice summary',
      }, 
      {
        id: 3,
        date: '2025-05-03',
        ticketNumber: 'TK-003',
        avatar: 'https://i.pravatar.cc/30?img=1',
        userName: 'Yuta Mae Oligark',
        priority: 'Low',
        subject: 'Fix the printer',
      }, 
    ];
    setTickets(mockData);
  }, []);

  return(
    <div className={styles.ticketTableWrapper}>
      <table className={styles.ticketTable}>
        <tbody>
        {tickets.map(ticket => (
            <UpcomingTicketItem key={ticket.id} ticket={ticket} />
          ))}
        </tbody>
      </table>
    </div>
  );
}