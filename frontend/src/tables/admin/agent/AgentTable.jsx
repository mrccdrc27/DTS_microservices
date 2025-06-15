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
import { AgentStatus } from "../../components/tableforms";

// Enhanced Modal Component for both disable and enable
function AccountActionModal({ isOpen, onClose, agentName, action, onConfirm }) {
  if (!isOpen) return null;

  const isDisabling = action === 'disable';
  const actionText = isDisabling ? 'Disable' : 'Enable';
  const actionColor = isDisabling ? '#dc3545' : '#28a745';

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
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>{actionText} Account</h3>
        <p style={{ marginBottom: '1.5rem' }}>
          Are you sure you want to {action} the account for <strong>{agentName}</strong>?
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
              backgroundColor: actionColor,
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {actionText} Account
          </button>
        </div>
      </div>
    </div>
  );
}

function TableHeader() {
  return(
      <tr className={table.tr}>
        <th className={table.th} style={{
          width: '10%',
          display: 'table-cell', 
          textAlign: 'center', 
          verticalAlign: 'middle' 
          }}>Photo</th>
        <th className={table.th} style={{ width: '25%' }}>Name</th>
        <th className={table.th} style={{ width: '25%' }}>Email</th>
        {/* <th className={table.th} style={{ width: '10%' }}>Department</th> */}
        <th className={table.th} style={{ width: '20%' }}>Role</th>
        {/* <th className={table.th} style={{ width: '10%' }}>Status</th> */}
        <th className={table.th} style={{ width: '10%' }}>status</th>
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
      {/* <td className={table.td}>Department</td> */}
      <td className={table.td}>{props.Role}</td>
      {/* <td className={table.td}>
        <AgentStatus status={props.Status}/>
      </td> */}
      <td className={table.td}>
      <span
        style={{
          padding: "4px 8px",
          borderRadius: "12px",
          color: "white",
          backgroundColor: props.Active ? "#548E3D" : "red",
          fontWeight: "bold",
          fontSize: "0.85rem",
        }}
      >
        {props.Active ? "Active" : "Inactive"}
      </span>
    </td>
      <td className={table.td} style={{ display: 'table-cell', textAlign: 'center' }}>
        <i 
          className={props.Active ? "fa-solid fa-user-slash" : "fa-solid fa-user-check"}
          onClick={() => props.onActionClick(props.ID, props.Name, props.Active)}
          style={{ 
            cursor: 'pointer', 
            color: props.Active ? '#dc3545' : '#28a745',
            fontSize: '16px'
          }}
          title={props.Active ? 'Disable Account' : 'Enable Account'}
        ></i>
      </td>
    </tr>
  );
}

// New SearchBar component matching WorkflowTable style
function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '16px',
      padding: '16px 0'
    }}>
      <div style={{
        position: 'relative',
        maxWidth: 'auto',
        width: '100%'
      }}>
        <div style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#9ca3af',
          fontSize: '16px'
        }}>
          🔍
        </div>
        <input
          type="text"
          placeholder="Search agents..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px 10px 40px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s ease',
            backgroundColor: 'white',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#d1d5db';
            e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
          }}
        />
      </div>
    </div>
  );
}

// New StatusFilter component
function StatusFilter({ statuses, selectedStatuses, onStatusChange }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      minWidth: '180px'
    }}>
      <label style={{
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '4px'
      }}>
        Status:
      </label>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '8px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        backgroundColor: 'white',
        maxHeight: '120px',
        overflowY: 'auto',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }}>
        {statuses.map((status) => (
          <label 
            key={status}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#374151',
              padding: '2px 0'
            }}
          >
            <input
              type="checkbox"
              checked={selectedStatuses.includes(status)}
              onChange={(e) => {
                if (e.target.checked) {
                  onStatusChange([...selectedStatuses, status]);
                } else {
                  onStatusChange(selectedStatuses.filter(s => s !== status));
                }
              }}
              style={{
                width: '14px',
                height: '14px',
                accentColor: '#3b82f6',
                cursor: 'pointer'
              }}
            />
            <span>{status}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// New RoleFilter component
function RoleFilter({ roles, selectedRole, onRoleChange }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      minWidth: '160px'
    }}>
      <label 
        htmlFor="role-filter"
        style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '2px'
        }}
      >
        Role:
      </label>
      <select
        id="role-filter"
        value={selectedRole}
        onChange={(e) => onRoleChange(e.target.value)}
        style={{
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          backgroundColor: 'white',
          fontSize: '14px',
          color: '#374151',
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#3b82f6';
          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#d1d5db';
          e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
        }}
      >
        <option value="">All Roles</option>
        {roles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    </div>
  );
}

// New DepartmentFilter component
// function DepartmentFilter({ departments, selectedDepartment, onDepartmentChange }) {
//   return (
//     <div style={{
//       display: 'flex',
//       flexDirection: 'column',
//       gap: '6px',
//       minWidth: '160px'
//     }}>
//       {/* <label 
//         htmlFor="department-filter"
//         style={{
//           fontSize: '14px',
//           fontWeight: '500',
//           color: '#374151',
//           marginBottom: '2px'
//         }}
//       >
//         Department:
//       </label> */}
//       {/* <select
//         id="department-filter"
//         value={selectedDepartment}
//         onChange={(e) => onDepartmentChange(e.target.value)}
//         style={{
//           padding: '8px 12px',
//           border: '1px solid #d1d5db',
//           borderRadius: '6px',
//           backgroundColor: 'white',
//           fontSize: '14px',
//           color: '#374151',
//           cursor: 'pointer',
//           outline: 'none',
//           transition: 'all 0.2s ease',
//           boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
//         }}
//         onFocus={(e) => {
//           e.target.style.borderColor = '#3b82f6';
//           e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
//         }}
//         onBlur={(e) => {
//           e.target.style.borderColor = '#d1d5db';
//           e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
//         }}
//       >
//         <option value="">All Departments</option>
//         {departments.map((department) => (
//           <option key={department} value={department}>
//             {department}
//           </option>
//         ))}
//       </select> */}
//     </div>
//   );
// }

// Updated Filters component matching WorkflowTable style
function Filters({ 
  roles, 
  departments, 
  statuses,
  selectedRole, 
  selectedDepartment, 
  selectedStatuses,
  onRoleChange, 
  onDepartmentChange, 
  onStatusChange,
  onResetFilters,
  isVisible,
  onToggleVisibility
}) {
  return(
    <div>
      {/* Filter Toggle Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '12px'
      }}>
        <button
          onClick={onToggleVisibility}
          style={{
            padding: '8px 16px',
            backgroundColor: isVisible ? '#3b82f6' : '#f8fafc',
            color: isVisible ? 'white' : '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
          onMouseEnter={(e) => {
            if (!isVisible) {
              e.target.style.backgroundColor = '#f1f5f9';
              e.target.style.borderColor = '#94a3b8';
            }
          }}
          onMouseLeave={(e) => {
            if (!isVisible) {
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.borderColor = '#d1d5db';
            }
          }}
        >
          <span>{isVisible ? '🔼' : '🔽'}</span>
          {isVisible ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Filters Container */}
      {isVisible && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '16px',
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <RoleFilter
            roles={roles}
            selectedRole={selectedRole}
            onRoleChange={onRoleChange}
          />
          {/* <DepartmentFilter
            departments={departments}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={onDepartmentChange}
          /> */}
          {/* <StatusFilter
            statuses={statuses}
            selectedStatuses={selectedStatuses}
            onStatusChange={onStatusChange}
          /> */}
          <button 
            onClick={onResetFilters}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f8fafc',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              cursor: 'pointer',
              height: '36px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f1f5f9';
              e.target.style.borderColor = '#94a3b8';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.borderColor = '#d1d5db';
            }}
            onMouseDown={(e) => {
              e.target.style.transform = 'translateY(1px)';
            }}
            onMouseUp={(e) => {
              e.target.style.transform = 'translateY(0px)';
            }}
          >
            <span>🔄</span>
            Reset Filters
          </button>
        </div>
      )}
    </div>
  )
}

function AgentTable() {
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState({ id: null, name: '', isActive: false });
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter states
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  
  const itemsPerPage = 7;

  // Function to fetch agents data
  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${ticketURL}`);
      const data = response.data;
      const agentData = Array.isArray(data) ? data : data.agents || [];
      setAgents(agentData);
      setFilteredAgents(agentData);
    } catch (error) {
      console.error("Failed to fetch agents", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // Get unique roles, departments, and statuses
  const roles = [...new Set(agents.map(agent => agent.role).filter(Boolean))];
  const departments = [...new Set(agents.map(agent => agent.department).filter(Boolean))];
  const statuses = [...new Set(agents.map(agent => agent.Status).filter(Boolean))];

  // Filter data based on selected filters and search term
  useEffect(() => {
    let filtered = agents;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(agent => 
        `${agent.first_name} ${agent.middle_name} ${agent.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (selectedRole) {
      filtered = filtered.filter(agent => agent.role === selectedRole);
    }

    // Department filter
    if (selectedDepartment) {
      filtered = filtered.filter(agent => agent.department === selectedDepartment);
    }

    // Status filter
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(agent => selectedStatuses.includes(agent.Status));
    }

    setFilteredAgents(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [agents, selectedRole, selectedDepartment, selectedStatuses, searchTerm]);

  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const pagedAgents = filteredAgents.slice(start, start + itemsPerPage);

  const handleActionClick = (id, agentName, isActive) => {
    setSelectedAgent({ id: id, name: agentName, isActive: isActive });
    setModalOpen(true);
  };

  const handleAccountAction = async () => {
    const { id, isActive } = selectedAgent;
    const newActiveStatus = !isActive;
    
    try {
      setIsLoading(true);
      
      // Make API call to update the account status
      await axios.patch(`http://localhost:3000/api/users/${id}/`, {
        is_active: newActiveStatus
      });

      // Show success message
      console.log(`Account ${newActiveStatus ? 'enabled' : 'disabled'} for agent ID: ${id}`);
      
      // Refresh the data from the server
      await fetchAgents();
      
    } catch (error) {
      console.error("Failed to update account status", error);
    } finally {
      setIsLoading(false);
      setModalOpen(false);
      setSelectedAgent({ id: null, name: '', isActive: false });
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAgent({ id: null, name: '', isActive: false });
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
  };

  const handleDepartmentChange = (department) => {
    setSelectedDepartment(department);
  };

  const handleStatusChange = (statuses) => {
    setSelectedStatuses(statuses);
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  const handleResetFilters = () => {
    setSelectedRole('');
    setSelectedDepartment('');
    setSelectedStatuses([]);
    setSearchTerm('');
  };

  const toggleFiltersVisibility = () => {
    setFiltersVisible(!filtersVisible);
  };

  return (
    <div className={table.whole}>
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #f3f3f3',
              borderTop: '2px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span>Updating...</span>
          </div>
        </div>
      )}

      <SearchBar 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />
      
      <Filters
        roles={roles}
        departments={departments}
        statuses={statuses}
        selectedRole={selectedRole}
        selectedDepartment={selectedDepartment}
        selectedStatuses={selectedStatuses}
        onRoleChange={handleRoleChange}
        onDepartmentChange={handleDepartmentChange}
        onStatusChange={handleStatusChange}
        onResetFilters={handleResetFilters}
        isVisible={filtersVisible}
        onToggleVisibility={toggleFiltersVisibility}
      />

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
                  Active={agent.is_active}
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

      <AccountActionModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        agentName={selectedAgent.name}
        action={selectedAgent.isActive ? 'disable' : 'enable'}
        onConfirm={handleAccountAction}
      />

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AgentTable;