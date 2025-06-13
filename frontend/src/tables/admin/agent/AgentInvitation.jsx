// dependencies import
import axios from "axios";
import { useEffect, useState } from "react";

// styles import
import table from "../../styles/general-table.module.css";
import layout from "./AgentInvitation.module.css";

// Api Import
const ticketURL = import.meta.env.VITE_AGENTS_API;

// component import
import { Pagination } from "../../components/tableforms";
import { SearchBar, Dropdown, AgentStatus } from "../../components/tableforms";


function TableHeader() {
  // Inline styles for the width of each rows
  return(
      <tr className={table.tr}>
        <th className={table.th} style={{ width: '20%' }}>Name</th>
        <th className={table.th} style={{ width: '20%' }}>Email</th>
        <th className={table.th} style={{ width: '20%' }}>Department</th>
        <th className={table.th} style={{ width: '10%' }}>Role</th>
        <th className={table.th} style={{ width: '10%' }}>Status</th>
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
      <td className={table.td}>{props.Name}</td>
      <td className={table.td}>{props.Email}</td>
      <td className={table.td}>Department</td>
      <td className={table.td}>{props.Role}</td>
      <td className={table.td}>
        <AgentStatus status={props.Status}/>
      </td>

      <td className={table.td}
      style={{
        display: 'table-cell',
        textAlign: 'center'
      }}>
        <i class="fa-solid fa-user-pen"></i>
      </td>

    </tr>
  )
}

function Filters() {
  return(
    <>
    <div className={layout.filters}>
        <div className={layout.title}>
            <b>
                <p>Create Invitation</p>
            </b>
                <p
                style={{color: 'red'}}
                >Reset</p>
        </div>
        <hr/>

        <b>
            <p>Information</p>
        </b>

        <div>
          <p>Email</p>
          <input type="text"
          className={layout.forminput}/>
        </div>

        <div>
          <p>Name</p>
          <input type="text"
          className={layout.forminput}/>
        </div>

        <b>
            <p>Department Model</p>
        </b>
        <hr/>
        
        <Dropdown title='Department'/>
        <Dropdown title='Position'/>
        <button className={layout.button}>
            submit
        </button>
    </div>
    </>
  )
}

function AgentInvitation() {
  const [agents, setAgents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // rows per page

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

  // pagination calculations
  const totalPages = Math.ceil(agents.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const pagedAgents = agents.slice(start, start + itemsPerPage);

  const handleManage = (id) => {
    console.log("Manage agent", id);
  };

  return (
    <div className={layout.whole}>
        <Filters/>
        <div className={layout.right}>
            <SearchBar/>
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
    </div>
  );
}

export default AgentInvitation;