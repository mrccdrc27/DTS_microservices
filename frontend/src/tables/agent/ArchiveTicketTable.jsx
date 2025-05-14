// styles
import table from './archive-ticket-table.module.css'
import general from '../styles/general-table-styles.module.css'

// api
const ticketURL = import.meta.env.VITE_ARCHIVE_TICKETS_API;

// react 
import React, { useState, useEffect } from 'react';
import axios, { all } from 'axios';

// comp
import { Dropdown, SearchBar, Datetime } from '../components/General';

export function TicketHeader() {
  return(
    <tr className={general.header}>
      <th className={general.th}>Ticket No.</th>
      <th className={general.th}>Subject</th>
      <th className={general.th}>Customer</th>
      <th className={general.th}>Opened On</th>
      <th className={general.th}>Resolved On</th>
      <th className={general.th}>Resolved By</th>
      <th className={general.th}>Action</th>
  </tr>
  );
}

export function TicketItem({ ticket }) {
  return(
    <tr className={general.item}>
      <td className={general.ticketID}>{ticket.ticket_id}</td>
      <td className={general.ticketID}>{ticket.subject}</td>
      <td className={general.ticketID}>{ticket.customer}</td>
      <td className={general.ticketID}>{ticket.opened_on}</td>
      <td className={general.ticketID}>{ticket.resolved_on}</td>
      <td className={general.ticketID}>{ticket.resolved_by}</td>
      <td className={general.ticketButton}>
        <button className={general.viewButton}>View</button> 
      </td> 
    </tr>
  );
}

export default function ArchiveTicketTable() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState('');  

  // Searcbar
  const [searchTerm, setSearchTerm] = useState('');

  // Filter
  const [showFilter, setShowFilter] = useState(false);

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
  }, [])

  return(
    <div className={table.archiveTicketTable}>

    {showFilter && (<div className={table.archiveTicketTableLeft}>
      <div className={table.headerSection}>
        <div className={table.title}>Filter</div>
        <div>
          <button 
          className={table.resetButton}></button> 
        </div>
      </div>
      <div className={table.filterSection}>
        <div className={table.title}>Priority</div>
      </div>
      <div className={table.filterSection}>
        <div className={table.title}>Status</div>
      </div>
    </div>)}

    <div className={table.archiveTicketTableRight}>
      <div className={table.filterWrapper}>
        <div className={table.filterIcon} onClick={() => setShowFilter(prev => !prev)} title={showFilter ? 'Hide Filter' : 'Show Filter'}><i className="fa-solid fa-filter"></i></div>
        <div className={table.searchBar}>
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className={general.ticketTableWrapper}>
        <table className={general.ticketPageTable}>
          <thead>
            <TicketHeader />
          </thead>
          <tbody>
            {tickets
              .filter(ticket => {
                const searchMatch = !searchTerm || (
                  ticket.ticket_id.toLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
                  ticket.subject.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
                  ticket.customer.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()) 
                )
                // const dateMatch = !selectedDate || ticket.opened_on === selectedDate;
                return searchMatch;;
              })
              .map(ticket => (
                <TicketItem key={ticket.ticket_id} ticket={ticket} />
              ))}
          </tbody>
        </table>
      </div>
    </div>

  </div>
  );
}