import AgentNav from "../../../components/navigations/agent-nav/AgentNav"

// styles
import styles from './track.module.css'

// api
const ticketURL = import.meta.env.VITE_TICKET_API;

// react 
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Track() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState('');  

  // Searcbar
  const [searchTerm, setSearchTerm] = useState('');
  const [matchedTicket, setMatchedTicket] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    axios
      .get(ticketURL)
      .then((response) => {
        // fetch tickets
        const allTickets = response.data;
        setTickets(allTickets);
        setLoading(false);
      })
      .catch((error) => {
        setError('Failed to fetch data');
        setLoading(false);
      });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    const match = tickets.find(ticket =>
      ticket.ticket_id.toLowerCase() === searchTerm.trim().toLowerCase()
    );

    if (match) {
      setMatchedTicket(match);
      setNotFound(false);
    } else {
      setMatchedTicket(null);
      setNotFound(true);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return(
    <>
    <AgentNav />
    <main className={styles.trackPage}>
    <section className={styles.trackPageTop}>
        <div className={styles.trackPageTitle}>
          <h3>Track</h3>
        </div>  
      </section>
      <section className={styles.trackPageBot}>
        <div className={styles.searchContainer}>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <input type="text" placeholder="Enter ticket number" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            <button type="submit">Track Ticket</button>
          </form>
        </div>    {/* search */}

        {notFound && (
            <div className={styles.errorMessage}>
              <p>Sorry, we couldn't find a ticket with that ID. Please check and try again.</p>
            </div>
          )}

        {matchedTicket && (
                  <div className={styles.resultsContainer}>
                  <div className={styles.ticketHeader}>
                    <div className={styles.ticketTitle}>
                      <h2>{matchedTicket.subject}</h2>
                      <div className={styles.ticketID}>{matchedTicket.ticket_id}</div>
                    </div>
                    <div className={styles[`status-${matchedTicket.status.replace(/\s+/g, '-').toLowerCase()}`]}>
                      {matchedTicket.status}
                    </div> 
                  </div>
        
                  <div className={styles.ticketProgress}>
                    <h3 className={styles.progressTitle}>Current Progress</h3>
                    <div className={styles.progressTrack}>
                      <div className={styles.progressBar}></div>
                      <div className={styles.progressStep}>
                        <div className={styles.stepIcon}></div>
                      </div>
                      <div className={styles.progressStep}>
                        <div className={styles.stepIcon}></div>
                      </div>
                      <div className={styles.progressStep}>
                        <div className={styles.stepIcon}></div>
                      </div>
                      <div className={styles.progressStep}>
                        <div className={styles.stepIcon}></div> 
                      </div>
                      <div className={styles.progressStep}>
                        <div className={styles.stepIcon}></div>
                      </div>
                    </div>
                  </div>
        
                  <div className={styles.ticketDetails}>
                    <div className={styles.detailCard}>
                      <h3>Priority</h3>
                      <p className={styles[`priority-${matchedTicket.priority.toLowerCase()}`]}>{matchedTicket.priority}</p>
                    </div>
                    <div className={styles.detailCard}>
                      <h3>Current Operator</h3>
                      <p>{matchedTicket.position}</p>
                    </div>
                    <div className={styles.detailCard}>
                      <h3>Created On</h3>
                      <p>{matchedTicket.opened_on}</p>
                    </div>
                    <div className={styles.detailCard}>
                      <h3>Expected Resolution</h3>
                      <p>{matchedTicket.sla}</p>
                    </div>
                  </div>
        
                  <div className={styles.ticketDescription}>
                    <h3>Description</h3>
                    <p>{matchedTicket.description}</p>
                  </div>
        
                </div>
                
        )}

      </section>
    </main>
    </>
  )
}