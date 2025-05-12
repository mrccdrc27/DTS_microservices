import { useNavigate } from "react-router-dom";

import AdminNav from "../../../components/navigations/admin-nav/AdminNav";
import TitleCard from "../../../components/TitleCard";
import AgentTable from "../../../tables/admin/agent/AgentTable";

import style from "./Agent.module.css";
import forms from "../../../forms.module.css";

export default function Agent() {
  const navigate = useNavigate();

  return (
    <>
      <AdminNav />
      <main className={style.main}>
        <section>
          <div className={style.title}>
            <TitleCard 
              title="Agent"
              name="jessa"
            />
            <button 
              className={forms.button}
              onClick={() => navigate("/admin/agent/invite")}
            >
              Invite Agent
            </button>
          </div>
          <hr />
        </section>
        <section>
          <AgentTable />
        </section>
      </main>
    </>
  );
} 