
import AdminNav from "../../../components/navigations/admin-nav/AdminNav";
import TitleCard from "../../../components/TitleCard";
import AgentInvitation from "../../../tables/admin/agent/AgentInvitation";
import { useNavigate } from "react-router-dom";


import style from "./Agent.module.css"
import forms from "../../../forms.module.css"

export default function AgentPosition() {
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
        onClick={() => navigate("/admin/agent/invite")}
        >
        </i>

        <div className={style.title}>
          <TitleCard 
          title="Agent Position"
          name="jessa"/>
        </div>

        <hr/>
      </section>
      <section>
        <AgentPosition/>
      </section>
    </main>
    </>
  );
}