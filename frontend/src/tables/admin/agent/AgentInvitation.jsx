// dependencies import
import axios from "axios";
import { useEffect, useState } from "react";

// styles import
import table from "../../styles/general-table.module.css";
import layout from "./AgentInvitation.module.css";

// API URLs
const ticketURL = import.meta.env.VITE_PENDING_API;
const positionListURL = import.meta.env.VITE_POSITION_API;
const agentInviteURL = import.meta.env.VITE_AGENTINVITE_API;

// component imports
import { Pagination } from "../../components/tableforms";
import { SearchBar, Dropdown, AgentStatus } from "../../components/tableforms";

function TableHeader() {
  return (
    <tr className={table.tr}>
      <th className={table.th} style={{ width: '50%' }}>Email</th>
      <th className={table.th} style={{ width: '30%' }}>Role</th>
      <th className={table.th} style={{ width: '10%' }}>Status</th>
      <th className={table.th} style={{ width: '10%', textAlign: 'center', verticalAlign: 'middle' }}>Action</th>
    </tr>
  );
}

function TableRow(props) {
  return (
    <tr className={table.tr}>
      <td className={table.td}>{props.Email}</td>
      <td className={table.td}>{props.Role}</td>
      <td className={table.td}>
        <AgentStatus status={props.Status} />
      </td>
      <td className={table.td} style={{ textAlign: 'center' }}>
        <i className="fa-solid fa-user-pen"></i>
      </td>
    </tr>
  );
}

function Filters({ onSuccess }) {
  const [positions, setPositions] = useState([]);
  const [email, setEmail] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    axios.get(positionListURL)
      .then(response => setPositions(response.data))
      .catch(error => console.error('Error fetching positions:', error));
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Invalid email format.';
    } else if (!email.endsWith('@gmail.com')) {
      newErrors.email = 'Only Gmail addresses are allowed.';
    }

    if (!selectedPosition) {
      newErrors.position = 'Please select a position.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setStatusMessage('');

    axios.post(agentInviteURL, {
      email: email,
      role: selectedPosition
    })
      .then(() => {
        setStatusMessage('✅ Invitation sent successfully!');
        setEmail('');
        setSelectedPosition('');
        setErrors({});
        if (onSuccess) onSuccess(); // <-- Refresh agent list
      })
      .catch(error => {
        console.error('Error sending invitation:', error);
        setStatusMessage('❌ Failed to send invitation. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleReset = () => {
    setEmail('');
    setSelectedPosition('');
    setErrors({});
    setStatusMessage('');
  };

  return (
    <div className={layout.filters}>
      <form onSubmit={handleSubmit}>
        <div className={layout.title}>
          <b><p>Create Invitation</p></b>
          <p style={{ color: 'red', cursor: 'pointer' }} onClick={handleReset}>Reset</p>
        </div>
        <hr />

        <b><p>Information</p></b>
        <div>
          <p>Email</p>
          <input
            type="text"
            className={layout.forminput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
        </div>

        <div>
          <p>Position</p>
          <select
            className={layout.forminput}
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
          >
            <option value="">Select a position</option>
            {positions.map(pos => (
              <option key={pos.id} value={pos.id}>
                {pos.name}
              </option>
            ))}
          </select>
          {errors.position && <p style={{ color: 'red' }}>{errors.position}</p>}
        </div>

        <br />
        <hr />
        <br />

        <button type="submit" className={layout.button} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Invite'}
        </button>

        {statusMessage && (
          <div style={{ marginTop: '1rem', color: statusMessage.startsWith('✅') ? 'green' : 'red' }}>
            {statusMessage}
          </div>
        )}
      </form>
    </div>
  );
}

function AgentInvitation() {
  const [agents, setAgents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const fetchAgents = () => {
    axios.get(ticketURL)
      .then((response) => {
        const data = response.data;
        setAgents(Array.isArray(data) ? data : data.agents || []);
      })
      .catch((error) => {
        console.error("Failed to fetch agents", error);
      });
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const totalPages = Math.ceil(agents.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const pagedAgents = agents.slice(start, start + itemsPerPage);

  const handleManage = (id) => {
    console.log("Manage agent", id);
  };

  return (
    <div className={layout.whole}>
      <Filters onSuccess={fetchAgents} />
      <div className={layout.right}>
        <SearchBar />
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
                    Name={agent.Name}
                    Email={agent.email}
                    Role={agent.role}
                    Status='pending'
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
    </div>
  );
}

export default AgentInvitation;
