// dependencies import
import axios from "axios";
import { useEffect, useState } from "react";

// styles import
import table from "../../styles/general-table.module.css";
import layout from "./WorkflowTable.module.css";

// Api Import
const ticketURL = import.meta.env.VITE_WORKFLOW_API;

// component import
import { Pagination } from "../../components/tableforms";
import { SearchBar, Dropdown, AgentStatus } from "../../components/tableforms";


function TableHeader() {
  // Inline styles for the width of each rows
  return(
      <tr className={table.tr}>
        <th className={table.th} style={{ width: '20%' }}>Workflow</th>
        <th className={table.th} style={{ width: '20%' }}>Division</th>
        <th className={table.th} style={{ width: '30%' }}>Description</th>
        
        <th className={table.th} style={{ width: '10%',
        display: 'table-cell',
        textAlign: 'center'
         }}>Status</th>

        <th className={table.th} style={{ width: '10%',
        display: 'table-cell',
        textAlign: 'center'
        }}>Tickets</th>

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
      <td className={table.td}>{props.Division}</td>
      <td className={table.td}>{props.Description}</td>
      <td className={table.td}
            style={{
              display: 'table-cell',
              textAlign: 'center'
            }}
      >
        <AgentStatus status={props.Status}/>
      </td>
      
      <td className={table.td}
            style={{
              display: 'table-cell',
              textAlign: 'center'
            }}>{props.Ticket}</td>

      <td className={table.td}
      style={{
        display: 'table-cell',
        textAlign: 'center'
      }}>
        <i class="fa-solid fa-pen"></i>
      </td>
      

    </tr>
  )
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

function WorkflowTable() {
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // rows per page

  useEffect(() => {
    axios
      .get(`${ticketURL}`)
      .then((response) => {
        const data = response.data;
        setTableData(Array.isArray(data) ? data : data.tableData || []);
      })
      .catch((error) => {
        console.error("Failed to fetch agents", error);
      });
  }, []);

  // pagination calculations
  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const pagedAgents = tableData.slice(start, start + itemsPerPage);

  const handleManage = (id) => {
    console.log("Manage agent", id);
  };

  return (
    <div className={table.whole}>
      <SearchBar/>
      <Filters/>
      <div className={table.tableborder}>
        <div className={table.tablewrapper}>
            <table className={table.tablecontainer}>
              <thead>
                <TableHeader />
              </thead>
              <tbody>
                {pagedAgents.map((tableData) => (
                  <TableRow
                    key={tableData.ID}
                    ID={tableData.ID}
                    Name={tableData.name}
                    Division={tableData.division}
                    Description={tableData.description}
                    Status={tableData.status}
                    Ticket={tableData.ticket}
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

export default WorkflowTable;