import AdminNav from "../../../components/navigations/admin-nav/AdminNav";
import TitleCard from "../../../components/TitleCard";
import DashboardTable from "../../../tables/admin/dashboard/dashboardTable";
import {Reporting, Stats, VotingDonutChart} from "./components/Graphs.jsx"
import style from "./AdminDashboard.module.css"
import QuickAction from "./components/QuickAction";


export default function AgentDashboard() {
  return(
    <>    
    <AdminNav />
      <main className={style.main}>
        <section className={style.dashboardTopSection}>
          <div className={style.dbHeroSection}>
          </div>
        </section> {/* top */}
        <section>
          <div className={style.title}>
            <TitleCard 
              title="Dashboard"
              name="jessa"
            />
          </div>
          <hr />
        </section>

        <section>
          <div className={style.whole}>
            <div className={style.left}>
              <h2>Recent</h2>
              <DashboardTable/>
            </div>
            <div className={style.right}>
              <h2>Quick Actions</h2>
              <QuickAction/>
            </div>
          </div>
        </section>

        <section>
          <div className={style.column}>
            <div>
              <h2>Monitor</h2>
            </div>
            <div className={style.row}>
              <Stats/>
              <Stats/>
            </div>
            <div className={style.row}>
              <Reporting 
              title='Ticket Cancelled Per Day'
              content='3'
              description='Resolved Tickets'/>
              <Reporting 
              title='Ticket Resolution Per Day'
              content='12'
              description='Resolved Tickets'/>
            </div>
            
          </div>
        </section>
    </main>
    </>
  );
}

