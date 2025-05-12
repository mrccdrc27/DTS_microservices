
import AdminNav from "../../../components/navigations/admin-nav/AdminNav";
import TitleCard from "../../../components/TitleCard";
import AgentInvitation from "../../../tables/admin/Archive/AgentInvitation";
import { useNavigate } from "react-router-dom";


import style from "./Agent.module.css"
import forms from "../../../forms.module.css"

export default function AdminArchive() {
    const navigate = useNavigate();
  return(
    <>
    <AdminNav />
    <main className={style.main}>
      <section>
        <div className={style.title}>
          <TitleCard 
          title="Archive"
          name="jessa"/>
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