import { useNavigate } from "react-router-dom";

import style from './QuickAction.module.css'

function QuickActionCard(props) {
    const navigate = useNavigate();
    
    return (
        <div className={style.card}
            onClick={() => navigate(props.route)}
            style={{
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0px 4px 12px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
            }}
            onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
            }}
        >
            <b><p>{props.title}</p></b>
            <div className={style.accent}></div>
        </div>
    );

}

export default function QuickAction() {
    return(
        <>
        <div className={style.cardContainer}>
            <QuickActionCard title='Create Workflow' route='/admin/workflow/create'/>
            <QuickActionCard title='Manage Agents'  route='/admin/agent'/>
            <QuickActionCard title='Invite Agent' route='/admin/agent/invite'/>
            <QuickActionCard title='Archives' route='/admin/archive'/>
        </div>
        </>
    )
}