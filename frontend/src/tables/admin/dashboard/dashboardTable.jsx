// dependencies import
import axios from "axios";
import { useEffect, useState } from "react";

// styles import
import table from "../../styles/general-table.module.css";
import layout from "./dashboardTable.module.css";

// Api Import
const ticketURL = import.meta.env.VITE_ADMINTICKET_API;

// component import
import { Pagination } from "../../components/tableforms";
import { SearchBar, Dropdown, AgentStatus } from "../../components/tableforms";

function TableRow({ subject, status, sla }) {
  return (
    <tr className={table.tr}>
      <td className={table.td} style={{ width: '5%', backgroundColor: 'blue' }}></td>
      <td className={table.td} style={{ width: '60%' }}>{subject}</td>
      <td className={table.td} style={{ width: '15%', textAlign: 'center' }}>
        <AgentStatus status={status} />
      </td>
      <td className={table.td} style={{ width: '20%' }}>{sla}</td>
    </tr>
  );
}

function DashboardTable() {
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    axios
      .get(ticketURL)
      .then((response) => {
        const data = response.data;
        setTableData(Array.isArray(data) ? data : data.tableData || []);
      })
      .catch((error) => {
        console.error("Failed to fetch tickets", error);
      });
  }, []);

  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const pagedTickets = tableData.slice(start, start + itemsPerPage);

  return (
    <div className={table.whole}>
      <div className={table.tableborder}>
        <div className={layout.tablewrapper}>
          <table className={table.tablecontainer}>
            <tbody>
              {pagedTickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  subject={ticket.subject}
                  status={ticket.status}
                  sla={ticket.sla}
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

export default DashboardTable;
