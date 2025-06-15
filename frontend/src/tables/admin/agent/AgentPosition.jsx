// dependencies import
import axios from "axios";
import { useEffect, useState } from "react";

// styles import
import table from "../../styles/general-table.module.css";
import layout from "./AgentInvitation.module.css";

// Api Import
const ticketURL = import.meta.env.VITE_POSITION_API;
const createPositionURL = import.meta.env.VITE_POSITION_API;

// component import
import { Pagination, SearchBar, AgentStatus } from "../../components/tableforms";

function TableHeader() {
  return (
    <tr className={table.tr}>
      <th className={table.th} style={{ width: '30%' }}>Name</th>
      <th className={table.th} style={{ width: '50%' }}>Description</th>
      <th className={table.th} style={{ width: '10%',
        textAlign: "center" }}>Action</th>
    </tr>
  );
}

function TableRow({ ID, Name, Description, Status, onManage }) {
  return (
    <tr className={table.tr}>
      <td className={table.td}>{Name}</td>
      <td className={table.td}>{Description}</td>
      <td className={table.td} style={{ textAlign: "center" }}>
        <i className="fa-solid fa-user-pen" onClick={() => onManage(ID)} style={{ cursor: "pointer" }}></i>
      </td>
    </tr>
  );
}

function PositionForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    user_id: 1,
    name: "",
    description: ""
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", content: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.description.trim()) newErrors.description = "Description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", content: "" });

    if (!validate()) return;

    try {
      const response = await axios.post(createPositionURL, formData);
      setMessage({ type: "success", content: "Position created successfully!" });
      setFormData({ user_id: 1, name: "", description: "" });
      onSuccess(); // Refresh parent list
    } catch (error) {
      const msg = error.response?.data?.message || "An unexpected error occurred.";
      setMessage({ type: "error", content: msg });
    }
  };

  return (
    <div className={layout.filters}>
      <form onSubmit={handleSubmit}>
        <div className={layout.title}><b><p>Create a position</p></b></div>
        <hr />

        <b><p>Position</p></b>

        <div>
          <p>Name</p>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={layout.forminput}
          />
          {errors.name && <span style={{ color: "red" }}>{errors.name}</span>}
        </div>

        <div>
          <p>Description</p>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            className={layout.forminput}
            style={{ height: "200px", resize: "vertical", maxHeight: "300px", minWidth: "100px" }}
          ></textarea>
          {errors.description && <span style={{ color: "red" }}>{errors.description}</span>}
        </div>

        {message.content && (
          <p style={{ color: message.type === "success" ? "green" : "red" }}>{message.content}</p>
        )}

        <br />
        <hr />
        <br />
        <button type="submit" className={layout.button}>Create</button>
      </form>
    </div>
  );
}

export default function AgentPosition() {
  const [agents, setAgents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const fetchAgents = () => {
    axios.get(ticketURL)
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : response.data.agents || [];
        setAgents(data);
      })
      .catch((error) => {
        console.error("Failed to fetch agents", error);
      });
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const totalPages = Math.ceil(agents.length / itemsPerPage);
  const pagedAgents = agents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className={layout.whole}>
      <div className={layout.right}>
        <SearchBar />
        <div className={table.tableborder}>
          <div className={table.tablewrapper}>
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              <table className={table.tablecontainer} style={{ width: "100%" }}>
                <thead style={{ position: "sticky", top: 0, background: "white", zIndex: 100 }}>
                  <TableHeader />
                </thead>
                <tbody>
                  {pagedAgents.map((agent) => (
                    <TableRow
                      key={agent.id}
                      ID={agent.id}
                      Name={agent.name}
                      Description={agent.description}
                      onManage={() => console.log("Manage", agent.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
      <PositionForm onSuccess={fetchAgents} />
    </div>
  );
}
