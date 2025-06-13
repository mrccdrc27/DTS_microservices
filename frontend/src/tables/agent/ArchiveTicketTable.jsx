// styles
import table from "./archive-ticket-table.module.css";
import general from "../styles/general-table-styles.module.css";

// api
const ticketURL = import.meta.env.VITE_ARCHIVE_TICKETS_API;

// react
import React, { useState, useEffect } from "react";
import axios, { all } from "axios";

// comp
import { Dropdown, SearchBar, Datetime } from "../components/General";
import Pagination from "../components/Pagination";

export function TicketHeader() {
  return (
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
  return (
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
  const [error, setError] = useState("");

  // Searcbar
  const [searchTerm, setSearchTerm] = useState("");

  // Datetime
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filter
  const [showFilter, setShowFilter] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Define how many items per page
  const [totalPages, setTotalPages] = useState(1);

  // Filtered tickets based on search and filters
  const filteredTickets = tickets.filter((ticket) => {
    const searchMatch =
      !searchTerm ||
      ticket.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const dateMatch =
      (!startDate || ticket.opened_on >= startDate) &&
      (!endDate || ticket.opened_on <= endDate);
    return searchMatch && dateMatch;
  });

  // PAGINATION STUFF START

  // Calculate the total pages
  useEffect(() => {
    setTotalPages(Math.ceil(filteredTickets.length / itemsPerPage));
  }, [filteredTickets]);

  // Slice the tickets based on current page
  const currentTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // PAGINATION STUFF END

  // Fetch Data
  useEffect(() => {
    axios
      .get(ticketURL)
      .then((response) => {
        const allTickets = response.data;
        setTickets(allTickets);

        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch data");
        setLoading(false);
      });
  }, []);

  return (
    <div className={table.archiveTicketTable}>
      {showFilter && (
        <div className={table.archiveTicketTableLeft}>
          <div className={table.headerSection}>
            <div className={table.title}>Filter</div>
            <div>
              <button
                className={table.resetButton}
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Reset
              </button>
            </div>
          </div>
          <div className={table.filterSection}>
            <div className={table.dateTime}>
              <div className={table.title}>Start Date</div>
              <Datetime
                className={table.dateTime}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                name="start-date"
              />
            </div>
            <div className={table.dateTime}>
              <div className={table.title}>End Date</div>
              <Datetime
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                name="end-date"
              />
            </div>
          </div>
          {/* <div className={table.filterSection}>
            <div className={table.title}>Date</div>
          </div>
          <div className={table.filterSection}>
            <div className={table.title}>Status</div>
          </div> */}
        </div>
      )}

      <div className={table.archiveTicketTableRight}>
        <div className={table.filterWrapper}>
          <div
            className={table.filterIcon}
            onClick={() => setShowFilter((prev) => !prev)}
            title={showFilter ? "Hide Filter" : "Show Filter"}
          >
            <i className="fa-solid fa-filter"></i>
          </div>
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
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className={general.noTicketsMessage}>
                    There is no ticket on the list
                  </td>
                </tr>
              ) : (
                currentTickets.map((ticket) => (
                  <TicketItem key={ticket.ticket_id} ticket={ticket} />
                ))
              )}
              {/* {currentTickets.map((ticket) => (
                <TicketItem key={ticket.ticket_id} ticket={ticket} />
              ))} */}
            </tbody>
          </table>
        </div>
        {/* Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}
