// styles
import table from "./ticket-table.module.css";
import general from "../styles/general-table-styles.module.css";

// api
const ticketURL = import.meta.env.VITE_TICKET_API;

// react
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// components
import { Dropdown, SearchBar, Datetime } from "../components/General";
import Pagination from "../components/Pagination"; // Import Pagination component

export function TicketHeader() {
  return (
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
  return (
    <tr className={general.item}>
      <td className={general.ticketID}>{ticket.ticket_id}</td>
      <td className={general.ticketSubject}>{ticket.subject}</td>
      <td className={general.tickeCustomer}>{ticket.customer}</td>
      <td>
        <div className={general[`priority-${ticket.priority.toLowerCase()}`]}>
          {ticket.priority}
        </div>
      </td>
      <td className={general.ticketOpenedOn}>{ticket.opened_on}</td>
      <td className={general.ticketSLA}>{ticket.sla}</td>
      <td>
        <div
          className={
            general[
              `status-${ticket.status.replace(/\s+/g, "-").toLowerCase()}`
            ]
          }
        >
          {ticket.status}
        </div>
      </td>
      <td className={general.ticketButton}>
        <Link to={`/agent/ticket/${ticket.id}`} state={{ ticket }}>
          <button className={general.viewButton}>View</button>
        </Link>
      </td>
    </tr>
  );
}

export default function TicketTable() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Priority
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState("");

  // Status
  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");

  // Searcbar
  const [searchTerm, setSearchTerm] = useState("");

  // Datetime
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filter Section
  const [showFilter, setShowFilter] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Define how many items per page
  const [totalPages, setTotalPages] = useState(1);

  // Filtered tickets based on search and filters
  const filteredTickets = tickets.filter((ticket) => {
    const priorityMatch =
      !selectedPriority || ticket.priority === selectedPriority;
    const statusMatch = !selectedStatus || ticket.status === selectedStatus;
    const searchMatch =
      !searchTerm ||
      ticket.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const dateMatch =
      (!startDate || ticket.opened_on >= startDate) &&
      (!endDate || ticket.opened_on <= endDate);
    return priorityMatch && statusMatch && searchMatch && dateMatch;
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

  // Fetching Data
  useEffect(() => {
    axios
      .get(ticketURL)
      .then((response) => {
        // fetch tickets
        const allTickets = response.data;
        setTickets(allTickets);

        // fetch priority
        const priorities = [
          ...new Set(allTickets.map((ticket) => ticket.priority)),
        ];
        setPriorityOptions(priorities);

        // fetct status
        const status = [...new Set(allTickets.map((ticket) => ticket.status))];
        setStatusOptions(status);

        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch data");
        setLoading(false);
      });
  }, []);

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  // if (error) {
  //   return <div>{error}</div>;
  // }

  return (
    <div className={table.ticketTable}>
      {showFilter && (
        <div className={table.ticketTableLeft}>
          <div className={table.headerSection}>
            <div className={table.title}>Filter</div>
            <div>
              <button
                className={table.resetButton}
                onClick={() => {
                  setSelectedPriority("");
                  setSelectedStatus("");
                  setStartDate("");
                  setEndDate("");
                  // alert('Filter Reset!');
                }}
              >
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
        </div>
      )}

      <div className={table.ticketTableRight}>
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
