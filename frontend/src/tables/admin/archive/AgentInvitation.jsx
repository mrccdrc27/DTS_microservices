// dependencies import
import axios from "axios";
import { useEffect, useState } from "react";

// styles import
import table from "../../styles/general-table.module.css";
import layout from "./AgentInvitation.module.css";

// Api Import
const ticketURL = import.meta.env.VITE_ARCHIVE_API;

// component import
import { Pagination } from "../../components/tableforms";
import { SearchBar, Dropdown, AgentStatus } from "../../components/tableforms";


function TableHeader() {
  // Inline styles for the width of each rows
  return(
      <tr className={table.tr}>
        <th className={table.th} style={{ width: '15%' }}>TicketID</th>
        <th className={table.th} style={{ width: '15%' }}>Subject</th>
        <th className={table.th} style={{ width: '15%' }}>Customer</th>
        <th className={table.th} style={{ width: '15%' }}>Status</th>
        <th className={table.th} style={{ width: '15%' }}>Resolved On</th>
        <th className={table.th} style={{ width: '15%' }}>Resolved By</th>
        <th className={table.th} style={{ width: '10%',
           display: 'table-cell', 
           textAlign: 'center', 
           verticalAlign: 'middle'  
           }}>Action</th>
      </tr>
  )
}

function TableRow(props) {
  return(
    <tr className={table.tr}>
      <td className={table.td}>{props.TicketID}</td>
      <td className={table.td}>{props.Subject}</td>
      <td className={table.td}>{props.Customer}</td>
      <td className={table.td}>
      <AgentStatus status={props.Status}/>
      </td>
      <td className={table.td}>{props.ResolvedOn}</td>
      <td className={table.td}>{props.ResolvedBy}</td>

      <td className={table.td}
      style={{
        display: 'table-cell',
        textAlign: 'center'
      }}>
        <i class="fa-solid fa-ellipsis-vertical"></i>
      </td>

    </tr>
  )
}

function Title(props) {
  return(
    <div>
    <div className={layout.header}>
      <b>
          <p>{props.title}</p>
      </b>  
    </div>
  </div>
  )
}

function Filters({ statusFilters, setStatusFilters, resetFilters }) {
  const toggleStatus = (key) => {
    setStatusFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={layout.filters}>
      <div className={layout.title}>
        <b><p>Filter</p></b>
        <p style={{ color: 'red', cursor: 'pointer' }} onClick={resetFilters}>Reset</p>
      </div>
      <hr />
      <Title title='Status' />
      <div className={layout.row}>
        <p>resolved</p>
        <input type="checkbox" checked={statusFilters.approved} onChange={() => toggleStatus('resolved')} />
      </div>
      <div className={layout.row}>
        <p>cancelled</p>
        <input type="checkbox" checked={statusFilters.cancelled} onChange={() => toggleStatus('cancelled')} />
      </div>
      <hr />
      {/* Additional filters like DateRange can be added similarly */}
      <Title title='Date Range'/>
        <Dropdown title='Start Date'/>
        <Dropdown title='End Date'/>
    </div>
  );
}

function AgentInvitation() {
  const [statusFilters, setStatusFilters] = useState({
    resolved: false,
    cancelled: false,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [agents, setAgents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const resetFilters = () => {
    setStatusFilters({ resolved: false, cancelled: false });
    setSearchQuery("");
  };

  // Filtered data
  const filteredAgents = agents.filter((agent) => {
    const matchesStatus =
      (statusFilters.resolved && agent.status === "resolved") ||
      (statusFilters.cancelled && agent.status === "cancelled") ||
      (!statusFilters.resolved && !statusFilters.cancelled);

    const matchesSearch =
      agent.ticket_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.subject?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Pagination logic on filtered data
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const pagedAgents = filteredAgents.slice(start, start + itemsPerPage);

  // Fetching data
  useEffect(() => {
    axios
      .get(`${ticketURL}`)
      .then((response) => {
        const data = response.data;
        setAgents(Array.isArray(data) ? data : data.agents || []);
      })
      .catch((error) => {
        console.error("Failed to fetch agents", error);
      });
  }, []);

  const handleManage = (id) => {
    console.log("Manage agent", id);
  };

  return (
    <div className={layout.whole}>
      <Filters
        statusFilters={statusFilters}
        setStatusFilters={setStatusFilters}
        resetFilters={resetFilters}
      />

      <div className={layout.right}>
        <SearchBar onSearch={setSearchQuery} />
        <div className={table.tableborder}>
          <div className={table.tablewrapper}>
            <table className={table.tablecontainer}>
              <thead>
                <TableHeader />
              </thead>
              <tbody>
                {pagedAgents.map((agent) => (
                  <TableRow
                    key={agent.ID}
                    Name={agent.ID}
                    ID={agent.ID}
                    TicketID={agent.ticket_id}
                    Customer={agent.customer}
                    Status={agent.status}
                    Subject={agent.subject}
                    ResolvedOn={agent.resolved_on}
                    ResolvedBy={agent.resolved_by}
                    onManage={handleManage}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

export default AgentInvitation;