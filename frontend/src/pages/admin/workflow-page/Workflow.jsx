import { useNavigate } from "react-router-dom";

import AdminNav from "../../../components/navigations/admin-nav/AdminNav";
import TitleCard from "../../../components/TitleCard";

import style from "./Workflow.module.css";
import forms from "../../../forms.module.css";
import WorkflowTable from "../../../tables/admin/workflow/Workflow";

export default function Workflow() {
  const navigate = useNavigate();

  return (
    <>
      <AdminNav />
      <main className={style.main}>
        <section>
          <div className={style.title}>
            <TitleCard 
              title="Workflow"
              name="jessa"
            />
            <button 
              className={forms.button}
              onClick={() => navigate("/admin/workflow/create")}
            >
              Create Workflow
            </button>
          </div>
          <hr />
        </section>
        <section>
          <WorkflowTable/>
        </section>
      </main>
    </>
  );
} 