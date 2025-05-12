// styles
import table from './ticket-table.module.css'
import general from '../styles/general-table-styles.module.css'

// api
const ticketURL = import.meta.env.VITE_TICKET_API;

// react 
import React, { useState, useEffect } from 'react';
import axios, { all } from 'axios';
import { Link } from 'react-router-dom';

// comp
import { Dropdown, SearchBar } from '../components/General';

export function TicketHeader() {
  return(
    <tr className={general.header}>
      <th className={general.th}>Ticket No.</th>
      <th className={general.th}>Subject</th>
      <th className={general.th}>Customer</th>
      <th className={general.th}>Priority</th>
      <th className={general.th}>Opened On</th>
      <th className={general.th}>SLA</th>
      <th className={general.th}>Status</th>
      <th className={general.th}>Action</th>
    </tr>
  );
}

export function TicketItem({ ticket }) {
  return(
    <tr className={general.item}>
      <td className={general.ticketID}>{ticket.ticket_id}</td>
      <td className={general.ticketSubject}>{ticket.subject}</td> 
      <td className={general.tickeCustomer}>{ticket.customer}</td>
      <td>
        <div className={general[`priority-${ticket.priority.toLowerCase()}`]}>{ticket.priority}</div>
      </td>
      <td className={general.ticketOpenedOn}>{ticket.opened_on}</td>
      <td className={general.ticketSLA}>{ticket.sla}</td>
      <td>
        <div className={general[`status-${ticket.status.replace(/\s+/g, '-').toLowerCase()}`]}>{ticket.status}</div>
      </td>
      <td className={general.ticketButton}>
        <Link to={`/agent/ticket/${ticket.ticket_id}`} state={{ ticket }}>
          <button className={general.viewButton}>View</button>
        </Link>
      </td> 
    </tr>
  );
}

export default function TicketTable() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState('');  

  // Priority
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState('');

  // Status
  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('')

  // Searcbar
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios
      .get(ticketURL)
      .then((response) => {
        // fetch tickets
        const allTickets = response.data;
        setTickets(allTickets);

        // fetch priority
        const priorities = [...new Set(allTickets.map(ticket => ticket.priority))];
        setPriorityOptions(priorities);

        // fetct status
        const status = [...new Set(allTickets.map(ticket => ticket.status))];
        setStatusOptions(status);

        setLoading(false);
      })
      .catch((error) => {
        setError('Failed to fetch data');
        setLoading(false);
      });
  }, [])

  // if (loading) {
  //   return <div>Loading...</div>;  
  // }

  // if (error) {
  //   return <div>{error}</div>;  
  // }

  return(
    <div className={table.ticketTable}>

      <div className={table.ticketTableLeft}>
        <div className={table.headerSection}>
          <div className={table.title}>Filter</div>
          <div>
            <button 
            className={table.resetButton}
            onClick={() => {
            setSelectedPriority('');
            setSelectedStatus('');
            // alert('Filter Reset!'); 
            }}>
            Reset
          </button> 
          </div>
        </div>
        <div className={table.filterSection}>
          <div className={table.title}>Priority</div>
          {/* Priority */}
          <Dropdown
            name="priority"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            options={priorityOptions}
            placeholder="Filter by Priority"
          />
        </div>
        <div className={table.filterSection}>
          <div className={table.title}>Status</div>
            {/* Status */}
            <Dropdown 
            name="status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={statusOptions}
            placeholder="Filter by Status"
          />
        </div>
      </div>

      <div className={table.ticketTableRight}>
        <div className={table.searchBar}>
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

        </div>
        <div className={general.ticketTableWrapper}>
          <table className={general.ticketPageTable}>
            <thead>
              <TicketHeader />
            </thead>
            <tbody>
              {tickets
                .filter(ticket => {
                  const priorityMatch = !selectedPriority || ticket.priority === selectedPriority;
                  const statusMatch = !selectedStatus || ticket.status === selectedStatus;
                  const searchMatch = !searchTerm || (
                    ticket.ticket_id.toLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
                    ticket.subject.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
                    ticket.customer.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()) 
                  )
                  // const dateMatch = !selectedDate || ticket.opened_on === selectedDate;
                  return priorityMatch && statusMatch && searchMatch;;
                })
                .map(ticket => (
                  <TicketItem key={ticket.ticket_id} ticket={ticket} />
                ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}