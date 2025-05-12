import { useNavigate } from "react-router-dom";

import AdminNav from "../../../components/navigations/admin-nav/AdminNav";
import TitleCard from "../../../components/TitleCard";

import style from "./WorkflowCreator.module.css";
import forms from "../../../forms.module.css";
import CreateStep from "./components/createstep";
import WorkflowSteps from "./components/stepcard";

export default function WorkflowEditor() {
  const navigate = useNavigate();

  return (
    <>
      <AdminNav />
      <main className={style.main}>
        <section>
          <i class="fa-solid fa-angle-left"
          style={{
              fontSize:'30px',
              color:'blue'
          }}
          onClick={() => navigate("/admin/workflow")}
          />
          <div className={style.title}>
            <TitleCard 
              title="Workflow Creator"
              name="jessa"
            />
          </div>
          <hr />
        </section>
        <section className={style.whole}>
          <div className={style.step}>
            <WorkflowSteps/>
          </div>
          <div className={style.configure}>
            <CreateStep/>
          </div>

        </section>
      </main>
    </>
  );
} 