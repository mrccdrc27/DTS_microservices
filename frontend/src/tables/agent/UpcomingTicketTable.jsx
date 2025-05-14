import styles from './upcoming-ticket-table.module.css'
import general from '../styles/general-table-styles.module.css'

// react
import { useEffect, useState } from 'react';
import axios, { all } from 'axios';

// api
const ticketURL = import.meta.env.VITE_UPCOMING_TICKETS_API;

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
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState('');  

  useEffect(() => {
    axios
      .get(ticketURL)
      .then((response) => {
        const allTickets = response.data;
        setTickets(allTickets);

        setLoading(false);
      })
      .catch((error) => {
        setError('No upcoming data');
        setLoading(false);
      });
  }, [])
  
  return(
    <div className={styles.ticketTableWrapper}>
     {loading ? <p>Loading...</p> : error ? <p>{error}</p> : tickets.length === 0 ? <p>No upcoming ticket.</p> : (
        <table className={styles.ticketTable}>
          <tbody>
            {tickets.map(ticket => <UpcomingTicketItem key={ticket.id} ticket={ticket} />)}
          </tbody>
        </table>
      )}
      
      {/* <table className={styles.ticketTable}>
        <tbody>
        {tickets.map(ticket => (
            <UpcomingTicketItem key={ticket.id} ticket={ticket} />
          ))}
        </tbody>
      </table> */}
    </div>
  );
}