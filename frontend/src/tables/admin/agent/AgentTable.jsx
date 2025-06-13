// dependencies import
import axios from "axios";
import { useEffect, useState } from "react";

// styles import
import table from "../../styles/general-table.module.css";
import layout from "./AgentTable.module.css";

// Api Import
const ticketURL = import.meta.env.VITE_AGENTS_API;

// component import
import { Pagination } from "../../components/tableforms";
import { SearchBar, Dropdown, AgentStatus } from "../../components/tableforms";


function TableHeader() {
  // Inline styles for the width of each rows
  return(
      <tr className={table.tr}>
        <th className={table.th} style={{
          width: '10%',
          display: 'table-cell', 
          textAlign: 'center', 
          verticalAlign: 'middle' 
          }}>Photo</th>
        <th className={table.th} style={{ width: '20%' }}>Name</th>
        <th className={table.th} style={{ width: '20%' }}>Email</th>
        <th className={table.th} style={{ width: '10%' }}>Department</th>
        <th className={table.th} style={{ width: '10%' }}>Role</th>
        <th className={table.th} style={{ width: '15%' }}>Status</th>
        <th className={table.th} style={{ width: '15%' }}>Last Login</th>
        <th className={table.th} style={{ width: '10%',
           display: 'table-cell', 
           textAlign: 'center', 
           verticalAlign: 'middle'  
           }}>Action</th>
      </tr>
  )
}

import { formatDistanceToNow, parseISO } from 'date-fns';

function TableRow(props) {
  const formattedLastLogin = props.LastLogin 
    ? formatDistanceToNow(parseISO(props.LastLogin), { addSuffix: true }) 
    : '—';

  return (
    <tr className={table.tr}>
      <td className={table.td} style={{ display: 'table-cell', textAlign: 'center', verticalAlign: 'middle' }}>
        <img src={props.image}
          style={{ display: 'block', margin: 'auto', height: '40px', width: '40px', borderRadius: '50px' }} />
      </td>
      <td className={table.td}>{props.Name}</td>
      <td className={table.td}>{props.Email}</td>
      <td className={table.td}>Department</td>
      <td className={table.td}>{props.Role}</td>
      <td className={table.td}>
        <AgentStatus status={props.Status}/>
      </td>
      <td className={table.td}>{formattedLastLogin}</td>
      <td className={table.td} style={{ display: 'table-cell', textAlign: 'center' }}>
        <i className="fa-solid fa-user-pen"></i>
      </td>
    </tr>
  );
}

function Filters() {
  return(
    <>
    <div className={layout.filters}>
      <Dropdown/>
      <Dropdown/>
      <p>reset filters</p>
    </div>
    </>
  )
}

function AgentTable() {
  const [agents, setAgents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false); // toggle state
  const itemsPerPage = 7;

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

  const totalPages = Math.ceil(agents.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const pagedAgents = agents.slice(start, start + itemsPerPage);

  const handleManage = (id) => {
    console.log("Manage agent", id);
  };

  return (
    <div className={table.whole}>
      <SearchBar />

      {/* Filter Toggle Button */}
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Conditional Filters Section */}
      {showFilters && <Filters />}

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
                  ID={agent.ID}
                  Name={agent.Name}
                  Email={agent.Email}
                  image={agent.ImageURL}
                  Role={agent.Role}
                  Status={agent.Status}
                  LastLogin={agent.LastLogin}
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
  );
}

export default AgentTable;