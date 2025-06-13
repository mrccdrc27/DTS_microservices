
import AdminNav from "../../../components/navigations/admin-nav/AdminNav";
import TitleCard from "../../../components/TitleCard";
import AgentInvitation from "../../../tables/admin/agent/AgentInvitation";
import { useNavigate } from "react-router-dom";


import style from "./Agent.module.css"
import forms from "../../../forms.module.css"

export default function AgentInvite() {
    const navigate = useNavigate();
  return(
    <>
    <AdminNav />
    <main className={style.main}>
      <section>
        <i class="fa-solid fa-angle-left"
        style={{
            fontSize:'30px',
            color:'blue'
        }}
        onClick={() => navigate("/admin/agent")}
        >
        </i>

        <div className={style.title}>
          <TitleCard 
          title="Agent Invitation"
          name="jessa"/>
          <button className={forms.button}>
            create new agent
          </button>
        </div>

        <hr/>
      </section>
      <section>
        <AgentInvitation/>
      </section>
    </main>
    </>
  );
}