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

// Modal Component
function DisableAccountModal({ isOpen, onClose, agentName, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Disable Account</h3>
        <p style={{ marginBottom: '1.5rem' }}>
          Are you sure you want to disable the account for <strong>{agentName}</strong>?
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ccc',
              backgroundColor: 'white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              backgroundColor: '#dc3545',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Disable Account
          </button>
        </div>
      </div>
    </div>
  );
}

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
        <th className={table.th} style={{ width: '25%' }}>Role</th>
        <th className={table.th} style={{ width: '15%' }}>Status</th>
        {/* <th className={table.th} style={{ width: '15%' }}>Last Login</th> */}
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
      {/* <td className={table.td}>{formattedLastLogin}</td> */}
      <td className={table.td} style={{ display: 'table-cell', textAlign: 'center' }}>
        <i 
          className="fa-solid fa-user-pen"
          onClick={() => props.onActionClick(props.ID, props.Name)}
          style={{ cursor: 'pointer', color: '#007bff' }}
        ></i>
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState({ id: null, name: '' });
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

  const handleActionClick = (id, agentName) => {
    setSelectedAgent({ id: id, name: agentName });
    setModalOpen(true);
  };

  const handleDisableAccount = async () => {
    try {
      // Make API call to disable the account
      await axios.post(`http://localhost:3000/api/users/${selectedAgent.id}/activate`, {
        is_active: false
      }
    );
  
      // Update the local state to reflect the change
      setAgents(prevAgents => 
        prevAgents.map(agent => 
          agent.ID === selectedAgent.id 
            ? { ...agent, Status: 'Disabled' }
            : agent
        )
      );
      
      console.log(`Account disabled for agent ID: ${selectedAgent.id}`);
    } catch (error) {
      console.error("Failed to disable account", error);
      // You might want to show an error message to the user here
    } finally {
      setModalOpen(false);
      setSelectedAgent({ id: null, name: '' });
    }
  };
  

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAgent({ id: null, name: '' });
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
                  key={agent.id}
                  ID={agent.id}
                  Name={`${agent.first_name} ${agent.middle_name} ${agent.last_name}`}
                  Email={agent.email}
                  image={agent.profile_picture}
                  Role={agent.role}
                  Status={agent.Status}
                  LastLogin={agent.LastLogin}
                  onActionClick={handleActionClick}
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

      {/* Disable Account Modal */}
      <DisableAccountModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        agentName={selectedAgent.name}
        onConfirm={handleDisableAccount}
      />
    </div>
  );
}

export default AgentTable;